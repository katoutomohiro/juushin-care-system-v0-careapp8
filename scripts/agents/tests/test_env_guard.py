import os
import importlib
import pytest

@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    # 影響を小さく
    for k in ("OPENAI_API_KEY","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"):
        monkeypatch.delenv(k, raising=False)

def test_missing_required_env_fails(monkeypatch):
    mod = importlib.import_module("scripts.agents.stubs.env_guard")
    result = mod.run({})
    assert result["ok"] is False

def test_valid_env_passes(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY","x")
    monkeypatch.setenv("SUPABASE_URL","https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY","y")
    mod = importlib.import_module("scripts.agents.stubs.env_guard")
    result = mod.run({})
    assert result["ok"] is True
