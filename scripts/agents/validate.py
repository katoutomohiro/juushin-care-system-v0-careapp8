from typing import Any, Dict

def ensure_valid(result: Dict[str, Any]) -> None:
    required = ["ok", "summary", "artifacts", "next_actions"]
    for k in required:
        if k not in result:
            raise SystemExit(f"missing field {k}")
    if not isinstance(result["ok"], bool):
        raise SystemExit("ok must be boolean")
