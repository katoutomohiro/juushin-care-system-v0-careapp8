import importlib
import json
import argparse
from .registry import AGENTS
from .validate import ensure_valid

def load_agent(task: str):
    if task not in AGENTS:
        raise ValueError(f"Unknown task: {task}")
    module_path, func_name = AGENTS[task].split(":")
    module = importlib.import_module(module_path)
    return getattr(module, func_name)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", required=True)
    parser.add_argument("--payload", default="{}")
    args = parser.parse_args()

    agent_fn = load_agent(args.task)
    payload = json.loads(args.payload or "{}")
    result = agent_fn(payload)
    ensure_valid(result)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
