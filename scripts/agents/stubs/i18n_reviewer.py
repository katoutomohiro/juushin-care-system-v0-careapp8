from typing import Dict, Any
from ..io_schema import AgentResult

def run(payload: Dict[str, Any]) -> AgentResult:
    return {
        "ok": True,
        "summary": "i18n_reviewer stub executed (no-op).",
        "artifacts": [],
        "next_actions": []
    }
