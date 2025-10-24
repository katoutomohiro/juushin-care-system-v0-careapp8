#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
簡易マルチエージェント・オーケストレーター（最小実装）
- .ai/agents_config.yaml を読み込み
- Implementation → Review → Test → Doc の順で擬似実行
- 成果物を artifacts/agent_reports/<timestamp>/ に保存
- 引数: --topic / --path / --outdir / --verbose （--pr は将来用）

依存（推奨）: autogen, pyyaml, httpx, tiktoken
→ 未インストールでも動くようフォールバックします（標準ライブラリのみで擬似実行）
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

# スクリプト直下の utils をインポートできるようにパスを調整
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

try:
    from utils.config import load_agents_config
    from utils.io import ensure_dir, write_text, read_files_by_glob, make_report_dir
except Exception:
    # フォールバック: 最低限の関数をここで定義
    def load_agents_config(path: Path) -> Dict[str, Any]:
        return {
            "implementation_agent": {"model": "gpt-4o", "temperature": 0.2},
            "review_agent": {"model": "gpt-4o", "temperature": 0.0},
            "test_agent": {"model": "gpt-4o", "temperature": 0.0},
            "doc_agent": {"model": "gpt-4o", "temperature": 0.2},
            "workflow": {"sequence": ["implementation_agent", "review_agent", "test_agent", "doc_agent"]},
        }

    def ensure_dir(p: Path) -> None:
        p.mkdir(parents=True, exist_ok=True)

    def write_text(p: Path, content: str) -> None:
        ensure_dir(p.parent)
        p.write_text(content, encoding="utf-8")

    def read_files_by_glob(pattern: str, limit: int = 50) -> List[Tuple[str, str]]:
        matches = []
        for fp in glob.glob(pattern, recursive=True)[:limit]:
            try:
                txt = Path(fp).read_text(encoding="utf-8", errors="ignore")
                matches.append((fp, txt))
            except Exception:
                pass
        return matches

    def make_report_dir(base: Optional[Path] = None) -> Path:
        base = base or Path("artifacts") / "agent_reports"
        ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        outdir = base / ts
        ensure_dir(outdir)
        return outdir

# ------------- 型と簡易エージェント定義 ------------------------------------

@dataclass
class AgentSpec:
    name: str
    model: str
    temperature: float
    description: str = ""

@dataclass
class Agents:
    implementation: AgentSpec
    review: AgentSpec
    test: AgentSpec
    doc: AgentSpec
    db_modeler: Optional[AgentSpec] = None
    i18n_reviewer: Optional[AgentSpec] = None

# ------------- ビルド/実行ロジック ------------------------------------------

def build_agents(cfg: Dict[str, Any]) -> Agents:
    """YAMLからエージェント定義を構築（未定義はデフォルト）"""
    impl = cfg.get("implementation_agent", {})
    rev = cfg.get("review_agent", {})
    tst = cfg.get("test_agent", {})
    doc = cfg.get("doc_agent", {})
    db = cfg.get("db_modeler", {})
    i18n = cfg.get("i18n_reviewer", {})

    def sp(name: str, d: Dict[str, Any]) -> AgentSpec:
        return AgentSpec(
            name=name,
            model=d.get("model", "gpt-4o"),
            temperature=float(d.get("temperature", 0.2)),
            description=d.get("description", ""),
        )

    return Agents(
        implementation=sp("implementation", impl),
        review=sp("review", rev),
        test=sp("test", tst),
        doc=sp("doc", doc),
        db_modeler=sp("db_modeler", db) if db else None,
        i18n_reviewer=sp("i18n_reviewer", i18n) if i18n else None,
    )

# 擬似LLM呼び出し（実運用時は httpx/openai/autogen 等に差し替え）
class TooManyRequests(Exception):
    pass

def llm_call(prompt: str, *, retry: int = 3, backoff: float = 1.0) -> str:
    """HTTP 429 リトライを考慮したダミーLLM呼び出し。
    現状はローカルで固定文面を返すため、例外は発生しない実装。
    """
    for i in range(retry):
        try:
            # ここで実際の API 呼び出しに差し替え可能
            return prompt.strip()[:1000]
        except TooManyRequests:
            time.sleep(backoff * (2 ** i))
    # 失敗時でもユーザ向けのメッセージで返す
    return "LLM呼び出しに失敗しました（429過多）。時間をおいて再実行してください。"

# 各エージェントのアウトプットを合成

def run_db_modeler(agents: Agents, verbose: bool = False) -> str:
    """データベースモデル解析エージェントの実行"""
    try:
        # db_model_utils をインポート
        sys.path.insert(0, str(SCRIPT_DIR / "utils"))
        from db_model_utils import detect_database_infrastructure, generate_db_analysis_report
        
        if verbose:
            print("[db_modeler] Analyzing database infrastructure...")
        
        detection_result = detect_database_infrastructure()
        report = generate_db_analysis_report(detection_result)
        
        if verbose:
            print(f"[db_modeler] Found Prisma: {detection_result['has_prisma']}, TypeORM: {detection_result['has_typeorm']}")
        
        return report
    except Exception as e:
        return f"# Database Model Analysis Report\n\n**Error:** {type(e).__name__}: {e}\n\nPlease ensure db_model_utils.py is available."


def run_i18n_reviewer(agents: Agents, verbose: bool = False) -> str:
    """国際化レビューエージェントの実行"""
    try:
        # i18n_utils をインポート
        sys.path.insert(0, str(SCRIPT_DIR / "utils"))
        from i18n_utils import detect_i18n_infrastructure, generate_i18n_analysis_report
        
        if verbose:
            print("[i18n_reviewer] Analyzing i18n infrastructure and hardcoded texts...")
        
        detection_result = detect_i18n_infrastructure()
        report = generate_i18n_analysis_report(detection_result)
        
        if verbose:
            total_texts = sum(len(texts) for texts in detection_result['hardcoded_texts'].values())
            print(f"[i18n_reviewer] Found {total_texts} hardcoded Japanese strings in {len(detection_result['hardcoded_texts'])} files")
        
        return report
    except Exception as e:
        return f"# i18n Analysis Report\n\n**Error:** {type(e).__name__}: {e}\n\nPlease ensure i18n_utils.py is available."


def run_pipeline(agents: Agents, topic: str, files: List[Tuple[str, str]], verbose: bool = False) -> Dict[str, str]:
    """Implementation→Review→Test→Doc の順で擬似生成を行い、各レポート文字列を返す。"""
    file_summaries = []
    for fp, content in files[:10]:
        trimmed = content[:400].replace("\n", " ")
        file_summaries.append(f"- {fp}: {trimmed[:200]}{'...' if len(trimmed)>200 else ''}")

    ctx = "\n".join(file_summaries) if file_summaries else "(no files matched)"

    impl_prompt = f"""
    [Implementation Agent]
    タスク: {topic}
    参照ファイル:
    {ctx}
    要求: 変更方針、影響範囲、最小パッチの案を簡潔に（3-7項目）。
    """.strip()
    implementation_md = llm_call(impl_prompt)

    rev_prompt = f"""
    [Review Agent]
    対象: Implementationの案
    観点: 正確性/セキュリティ/パフォーマンス/アクセシビリティ/一貫性
    出力: 指摘リスト（severity付与）と簡易パッチ案の要点
    ---
    {implementation_md}
    """.strip()
    review_md = llm_call(rev_prompt)

    test_prompt = f"""
    [Test Agent]
    目的: バグ再発防止の最小テスト設計（Vitest/RTL想定）
    出力: テスト項目（3-5件）と擬似コード断片
    ---
    {review_md}
    """.strip()
    test_plan_md = llm_call(test_prompt)

    doc_prompt = f"""
    [Doc Agent]
    利用者向けの変更概要と使い方（セットアップ/操作手順/注意点）を簡潔に記述
    ---
    {implementation_md}
    {test_plan_md}
    """.strip()
    doc_md = llm_call(doc_prompt)

    summary = "\n".join([
        "# Agent Run Summary",
        f"- topic: {topic}",
        f"- files: {len(files)} matched",
        "- sequence: Implementation → Review → Test → Doc",
    ])

    return {
        "implementation.md": implementation_md,
        "review.md": review_md,
        "test-plan.md": test_plan_md,
        "doc.md": doc_md,
        "summary.md": summary,
    }

# ------------- CLI ------------------------------------------

def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Minimal multi-agent orchestrator")
    p.add_argument("--topic", type=str, default="",
                   help="高レベルタスクの説明（例: 'hello agents'）")
    p.add_argument("--path", type=str, default="",
                   help="参照するファイルのglobパターン（例: 'src/**/*.tsx'）")
    p.add_argument("--outdir", type=str, default="",
                   help="成果物の出力先（デフォルト: artifacts/agent_reports/<ts>）")
    p.add_argument("--verbose", action="store_true", help="詳細ログ")
    p.add_argument("--pr", type=int, default=None, help="将来用: PR番号（未使用）")
    return p.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)

    try:
        # コンフィグ読み込み
        cfg_path = Path(".ai/agents_config.yaml").resolve()
        cfg = load_agents_config(cfg_path)
        agents = build_agents(cfg)

        # トピックベースのルーティング
        topic_lower = args.topic.lower() if args.topic else ""
        
        # 保存先
        base = Path(args.outdir) if args.outdir else None
        outdir = make_report_dir(base)
        
        outputs: Dict[str, str] = {}
        
        # db-modeler専用実行
        if "db-model" in topic_lower or "database" in topic_lower or "schema" in topic_lower:
            if args.verbose:
                print("[agent_run] Detected database modeling request")
            if agents.db_modeler:
                report = run_db_modeler(agents, verbose=args.verbose)
                outputs["db-analysis.md"] = report
                outputs["summary.md"] = f"# Agent Run Summary\n\n- topic: {args.topic}\n- agent: db_modeler\n- timestamp: {datetime.utcnow().isoformat()}"
            else:
                print("[WARNING] db_modeler not configured in agents_config.yaml")
                return 1
        
        # i18n-reviewer専用実行
        elif "i18n" in topic_lower or "translation" in topic_lower or "国際化" in topic_lower:
            if args.verbose:
                print("[agent_run] Detected i18n review request")
            if agents.i18n_reviewer:
                report = run_i18n_reviewer(agents, verbose=args.verbose)
                outputs["i18n-analysis.md"] = report
                outputs["summary.md"] = f"# Agent Run Summary\n\n- topic: {args.topic}\n- agent: i18n_reviewer\n- timestamp: {datetime.utcnow().isoformat()}"
            else:
                print("[WARNING] i18n_reviewer not configured in agents_config.yaml")
                return 1
        
        # 通常のパイプライン実行 (Implementation → Review → Test → Doc)
        else:
            if args.verbose:
                print("[agent_run] Running standard pipeline")
            
            # 参照ファイルの準備
            files: List[Tuple[str, str]] = []
            if args.path:
                files = read_files_by_glob(args.path, limit=50)

            # 実行
            outputs = run_pipeline(agents, args.topic or "(no topic)", files, verbose=args.verbose)

        # 保存
        for name, content in outputs.items():
            write_text(outdir / name, content)

        print(f"Saved reports to: {outdir}")
        return 0

    except FileNotFoundError as e:
        print(f"[ERROR] ファイルが見つかりません: {e}")
        return 2
    except PermissionError as e:
        print(f"[ERROR] 権限エラー: {e}")
        return 3
    except Exception as e:
        # ユーザ向けに簡潔化
        print(f"[ERROR] 実行中に例外が発生しました: {type(e).__name__}: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
