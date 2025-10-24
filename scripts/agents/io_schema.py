from typing import Any, Dict, List, TypedDict

class AgentTask(TypedDict):
    task: str
    payload: Dict[str, Any]
    constraints: Dict[str, Any]

class Artifact(TypedDict):
    path: str
    type: str  # "patch" | "note" | "schema"

class AgentResult(TypedDict):
    ok: bool
    summary: str
    artifacts: List[Artifact]
    next_actions: List[Dict[str, Any]]
