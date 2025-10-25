import os
import json
from typing import Dict, Any
from typing import List

REQUIRED_VARS = ["OPENAI_API_KEY"]
OPTIONAL_VARS = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]

def run(payload: Dict[str, Any]) -> Dict[str, Any]:
    missing: List[str] = [k for k in REQUIRED_VARS if not os.environ.get(k)]
    notes: List[str] = []

    # 温度とシードは数値かつ範囲（存在すればチェック）
    def read_float(name: str, lo: float, hi: float) -> None:
        v = os.environ.get(name)
        if v is None or v == "":
            return
        try:
            x = float(v)
            if not (lo <= x <= hi):
                notes.append(f"{name} out of range")
        except ValueError:
            notes.append(f"{name} not a float")

    def read_int(name: str, lo: int) -> None:
        v = os.environ.get(name)
        if v is None or v == "":
            return
        try:
            x = int(v)
            if x < lo:
                notes.append(f"{name} below {lo}")
        except ValueError:
            notes.append(f"{name} not an int")

    read_float("LLM_TEMPERATURE", 0.0, 2.0)
    read_int("LLM_SEED", 0)

    ok = len(missing) == 0
    summary = "env ok" if ok else "missing env vars: " + ", ".join(missing)

    return {
        "ok": ok,
        "summary": summary,
        "artifacts": [{
            "path": "env_hardening_report.json",
            "type": "note"
        }],
        "next_actions": [],
        "report": {  # 任意フィールド（将来拡張用）
            "missing": missing,
            "notes": notes,
            "seen": {k: bool(os.environ.get(k)) for k in REQUIRED_VARS + OPTIONAL_VARS}
        }
    }
