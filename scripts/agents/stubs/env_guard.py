from __future__ import annotations
import os
from typing import Dict, List

# 必須ENV（既存要件）
REQUIRED = {"OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"}

# 許可リスト（REQUIREDに加えて必要ならここへ拡張）
ALLOWED = set(REQUIRED)

# 対象とする接頭辞（ここに載るENVだけ未知キー判定の対象）
CANDIDATE_PREFIXES = ("OPENAI_", "SUPABASE_")

def _unknown_env_keys(env: Dict[str, str]) -> List[str]:
    candidates = {k for k in env.keys() if k.startswith(CANDIDATE_PREFIXES)}
    extras = sorted(k for k in candidates if k not in ALLOWED)
    return extras

def run(payload: Dict | None = None) -> Dict:
    missing = sorted(k for k in REQUIRED if not os.getenv(k))
    if missing:
        return {
            "ok": False,
            "summary": f"missing required env: {', '.join(missing)}",
            "artifacts": [],
            "next_actions": [],
        }

    summary = "env_guard: required env present"
    extras = _unknown_env_keys(os.environ)
    if extras:
        summary += f" | WARN unknown env keys: {', '.join(extras)}"

    return {"ok": True, "summary": summary, "artifacts": [], "next_actions": []}
