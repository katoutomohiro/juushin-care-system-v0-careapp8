# -*- coding: utf-8 -*-
"""
YAML/設定ファイルの読み込みユーティリティ
- .ai/agents_config.yaml を読み込み、dict で返す
- PyYAML が無い場合は簡易フォールバック（空dict）
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict


def load_agents_config(path: Path) -> Dict[str, Any]:
    """エージェント設定（YAML）を読み込む。
    PyYAML が未導入の場合は空設定（呼び出し側でデフォルト適用）。
    """
    if not path.exists():
        return {}
    try:
        import yaml  # type: ignore
    except Exception:
        # YAML をパースできない場合は空
        return {}

    with path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
        if not isinstance(data, dict):
            return {}
        return data
