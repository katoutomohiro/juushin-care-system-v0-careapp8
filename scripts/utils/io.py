# -*- coding: utf-8 -*-
"""
入出力ユーティリティ
- ディレクトリ作成、テキスト保存、glob 取得、レポート出力先生成
"""
from __future__ import annotations

import glob
from datetime import datetime
from pathlib import Path
from typing import List, Tuple, Optional


def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def write_text(p: Path, content: str) -> None:
    ensure_dir(p.parent)
    p.write_text(content, encoding="utf-8")


def read_files_by_glob(pattern: str, limit: int = 50) -> List[Tuple[str, str]]:
    matches: List[Tuple[str, str]] = []
    for fp in glob.glob(pattern, recursive=True)[:limit]:
        try:
            txt = Path(fp).read_text(encoding="utf-8", errors="ignore")
            matches.append((fp, txt))
        except Exception:
            pass
    return matches


def make_report_dir(base: Optional[Path] = None) -> Path:
    base = base or Path("artifacts") / "agent_reports"
    ts = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    outdir = base / ts
    ensure_dir(outdir)
    return outdir


def save_artifact(output_dir: Path, filename: str, content: str) -> Path:
    """
    指定されたディレクトリにアーティファクトを保存
    
    Args:
        output_dir: 出力先ディレクトリ
        filename: ファイル名 (例: "db-analysis.md")
        content: ファイル内容
    
    Returns:
        保存したファイルのPath
    """
    ensure_dir(output_dir)
    file_path = output_dir / filename
    write_text(file_path, content)
    return file_path
