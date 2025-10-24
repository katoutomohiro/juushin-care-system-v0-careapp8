# -*- coding: utf-8 -*-
"""
国際化(i18n)解析ユーティリティ
- ハードコードされた日本語テキストの検出
- 翻訳キーの抽出と提案
- locales/ ディレクトリの構造解析
"""
from __future__ import annotations

import glob
import json
import re
from pathlib import Path
from typing import List, Dict, Any, Set, Tuple


def find_locales_directory(root: Path = Path(".")) -> Optional[Path]:
    """locales/ または translations/ ディレクトリを検索"""
    candidates = [
        root / "locales",
        root / "translations",
        root / "public" / "locales",
        root / "i18n",
    ]
    for candidate in candidates:
        if candidate.exists() and candidate.is_dir():
            return candidate
    return None


def find_locale_files(locales_dir: Path) -> Dict[str, List[Path]]:
    """
    locales/ 配下の翻訳ファイルを検出
    
    Returns:
        {"ja": [Path("locales/ja/common.json")], "en": [...], ...}
    """
    result: Dict[str, List[Path]] = {}
    
    if not locales_dir.exists():
        return result
    
    # locales/<lang>/*.json パターン
    for json_file in glob.glob(str(locales_dir / "**" / "*.json"), recursive=True):
        path = Path(json_file)
        # ロケールコードの推定 (ディレクトリ名から)
        relative = path.relative_to(locales_dir)
        lang = relative.parts[0] if len(relative.parts) > 1 else "unknown"
        result.setdefault(lang, []).append(path)
    
    return result


def extract_hardcoded_japanese_texts(file_path: Path) -> List[Dict[str, Any]]:
    """
    TypeScript/TSX ファイルからハードコードされた日本語テキストを抽出
    
    Returns:
        [
            {"line": 42, "text": "氏名を入力してください", "context": "alert(...)"},
            ...
        ]
    """
    if not file_path.exists() or file_path.suffix not in [".ts", ".tsx", ".js", ".jsx"]:
        return []
    
    content = file_path.read_text(encoding="utf-8")
    lines = content.split("\n")
    
    # 日本語を含む文字列リテラルを検出 (ひらがな、カタカナ、漢字)
    japanese_pattern = re.compile(r'[ぁ-んァ-ヶ一-龥]+')
    string_patterns = [
        # "..." or '...'
        re.compile(r'["\']([^"\']*[ぁ-んァ-ヶ一-龥][^"\']*)["\']'),
        # `...` (template literal)
        re.compile(r'`([^`]*[ぁ-んァ-ヶ一-龥][^`]*)`'),
    ]
    
    results = []
    for line_num, line in enumerate(lines, start=1):
        # コメント行をスキップ
        if line.strip().startswith("//") or line.strip().startswith("/*"):
            continue
        
        for pattern in string_patterns:
            for match in pattern.finditer(line):
                text = match.group(1).strip()
                if japanese_pattern.search(text):
                    # 文脈を抽出 (前後20文字)
                    start = max(0, match.start() - 20)
                    end = min(len(line), match.end() + 20)
                    context = line[start:end].strip()
                    
                    results.append({
                        "line": line_num,
                        "text": text,
                        "context": context,
                    })
    
    return results


def scan_project_for_japanese_texts(root: Path = Path("."), extensions: List[str] = None) -> Dict[str, List[Dict[str, Any]]]:
    """
    プロジェクト全体をスキャンして日本語テキストを検出
    
    Returns:
        {
            "app/page.tsx": [{"line": 42, "text": "...", "context": "..."}, ...],
            ...
        }
    """
    if extensions is None:
        extensions = [".ts", ".tsx", ".js", ".jsx"]
    
    results: Dict[str, List[Dict[str, Any]]] = {}
    
    # node_modules, .git などを除外
    exclude_dirs = {"node_modules", ".git", ".next", "dist", "build", "coverage"}
    
    for ext in extensions:
        for file_path in glob.glob(str(root / "**" / f"*{ext}"), recursive=True):
            path = Path(file_path)
            # 除外ディレクトリチェック
            if any(excluded in path.parts for excluded in exclude_dirs):
                continue
            
            texts = extract_hardcoded_japanese_texts(path)
            if texts:
                # ルートからの相対パスをキーに
                try:
                    relative_path = path.relative_to(root)
                    results[str(relative_path)] = texts
                except ValueError:
                    results[str(path)] = texts
    
    return results


def suggest_translation_keys(japanese_texts: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """
    ハードコードされたテキストから翻訳キーを提案
    
    Returns:
        [
            {
                "key": "errors.nameRequired",
                "japanese": "氏名を入力してください",
                "file": "app/page.tsx",
                "line": 42
            },
            ...
        ]
    """
    suggestions = []
    
    # テキストを収集して重複除去
    seen_texts: Set[str] = set()
    
    for file_path, texts in japanese_texts.items():
        for item in texts:
            text = item["text"]
            if text in seen_texts or len(text) > 100:  # 長すぎるテキストはスキップ
                continue
            seen_texts.add(text)
            
            # キー名の生成 (簡易的なルール)
            # 1. アラート/エラーメッセージ
            if "ください" in text or "エラー" in text or "失敗" in text:
                key_prefix = "errors."
            # 2. ボタン/アクション
            elif any(word in text for word in ["追加", "削除", "保存", "編集", "キャンセル"]):
                key_prefix = "actions."
            # 3. ラベル
            elif any(word in text for word in ["氏名", "年齢", "日付", "時間"]):
                key_prefix = "labels."
            # 4. その他
            else:
                key_prefix = "common."
            
            # キー名: 最初の数単語をキャメルケースに変換
            key_suffix = text[:20].replace(" ", "").replace("。", "")
            # 日本語をローマ字化する代わりに、簡易的にハッシュ値を使用
            key_suffix = f"text{abs(hash(text)) % 10000}"
            
            suggestions.append({
                "key": f"{key_prefix}{key_suffix}",
                "japanese": text,
                "file": file_path,
                "line": item["line"],
            })
    
    return suggestions


def detect_i18n_infrastructure() -> Dict[str, Any]:
    """
    プロジェクト全体で i18n インフラを検出
    
    Returns:
        {
            "has_locales": bool,
            "locales_dir": str | None,
            "locale_files": {"ja": [...], "en": [...]},
            "hardcoded_texts": {"app/page.tsx": [...]},
            "translation_suggestions": [...]
        }
    """
    locales_dir = find_locales_directory()
    locale_files = find_locale_files(locales_dir) if locales_dir else {}
    
    # プロジェクトルートから日本語テキストをスキャン
    hardcoded_texts = scan_project_for_japanese_texts()
    
    # 翻訳キーの提案
    suggestions = suggest_translation_keys(hardcoded_texts)
    
    return {
        "has_locales": locales_dir is not None,
        "locales_dir": str(locales_dir) if locales_dir else None,
        "locale_files": {lang: [str(p) for p in paths] for lang, paths in locale_files.items()},
        "hardcoded_texts": hardcoded_texts,
        "translation_suggestions": suggestions,
    }


def generate_i18n_analysis_report(detection_result: Dict[str, Any]) -> str:
    """
    検出結果から Markdown レポートを生成
    """
    lines = [
        "# Internationalization (i18n) Analysis Report",
        "",
        "## Infrastructure Detection",
        "",
    ]
    
    if not detection_result["has_locales"]:
        lines.extend([
            "⚠️ **No locales directory detected**",
            "",
            "### Current State:",
            f"- Found {len(detection_result['hardcoded_texts'])} files with hardcoded Japanese text",
            f"- Total {sum(len(texts) for texts in detection_result['hardcoded_texts'].values())} hardcoded strings detected",
            "",
            "### Recommendations:",
            "- Set up i18n library (next-i18next, react-i18next, etc.)",
            "- Create `locales/` directory structure:",
            "  ```",
            "  locales/",
            "    ja/",
            "      common.json",
            "      errors.json",
            "    en/",
            "      common.json",
            "      errors.json",
            "  ```",
            "- Replace hardcoded texts with translation function calls: `t('key')`",
            "",
        ])
    else:
        lines.extend([
            "✅ **Locales directory detected**",
            "",
            f"**Location:** `{detection_result['locales_dir']}`",
            "",
        ])
        
        locale_files = detection_result["locale_files"]
        if locale_files:
            lines.append("**Available locales:**")
            for lang, files in locale_files.items():
                lines.append(f"- `{lang}`: {len(files)} file(s)")
                for file in files[:5]:  # 最初の5ファイルのみ表示
                    lines.append(f"  - `{file}`")
            lines.append("")
    
    # ハードコードされたテキストの統計
    hardcoded_texts = detection_result["hardcoded_texts"]
    if hardcoded_texts:
        lines.extend([
            "## Hardcoded Japanese Text Analysis",
            "",
            f"**Files with hardcoded text:** {len(hardcoded_texts)}",
            f"**Total hardcoded strings:** {sum(len(texts) for texts in hardcoded_texts.values())}",
            "",
            "### Top 10 Files:",
            "",
        ])
        
        # ファイルごとの件数でソート
        sorted_files = sorted(hardcoded_texts.items(), key=lambda x: len(x[1]), reverse=True)
        for file_path, texts in sorted_files[:10]:
            lines.append(f"- `{file_path}`: {len(texts)} strings")
        lines.append("")
    
    # 翻訳キーの提案
    suggestions = detection_result["translation_suggestions"]
    if suggestions:
        lines.extend([
            "## Translation Key Suggestions",
            "",
            f"**Total suggestions:** {len(suggestions)}",
            "",
            "### Sample Translations (first 20):",
            "",
            "```json",
            "{",
        ])
        
        for i, suggestion in enumerate(suggestions[:20]):
            comma = "," if i < min(19, len(suggestions) - 1) else ""
            lines.append(f'  "{suggestion["key"]}": "{suggestion["japanese"]}"{comma}')
        
        lines.extend([
            "}",
            "```",
            "",
            "### Full Suggestion List:",
            "",
        ])
        
        for suggestion in suggestions[:30]:  # 最初の30件
            lines.append(f"- **`{suggestion['key']}`**: \"{suggestion['japanese']}\"")
            lines.append(f"  - File: `{suggestion['file']}` (line {suggestion['line']})")
        
        if len(suggestions) > 30:
            lines.append(f"- ... and {len(suggestions) - 30} more")
        
        lines.append("")
    
    lines.extend([
        "---",
        "",
        "## Action Items",
        "",
        "1. **Setup i18n library** if not already configured",
        "2. **Create translation files** in `locales/<lang>/` directory",
        "3. **Replace hardcoded strings** with `t('key')` function calls",
        "4. **Add English translations** for all keys",
        "5. **Configure language switcher** in the UI",
        "6. **Test all translations** before deployment",
        "",
        "### Example Migration:",
        "",
        "**Before:**",
        "```tsx",
        'alert("氏名を入力してください")',
        "```",
        "",
        "**After:**",
        "```tsx",
        'import { useTranslation } from "next-i18next"',
        "",
        "const { t } = useTranslation()",
        'alert(t("errors.nameRequired"))',
        "```",
    ])
    
    return "\n".join(lines)


# Optional import fix
from typing import Optional
