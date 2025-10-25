from typing import Any, Dict, List

class ValidationError(Exception):
    pass

def ensure_valid(result: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(result, dict):
        raise ValidationError("result must be a dict")
    if "ok" not in result or not isinstance(result["ok"], bool):
        raise ValidationError("ok must be a boolean")
    if "summary" not in result or not isinstance(result["summary"], str):
        raise ValidationError("summary must be a string")
    for key in ("artifacts", "next_actions"):
        if key not in result:
            result[key] = []
        if not isinstance(result[key], list):
            raise ValidationError(f"{key} must be a list")
    return result
