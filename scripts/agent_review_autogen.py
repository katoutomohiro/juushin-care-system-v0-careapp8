import os, subprocess, re
from tenacity import retry, stop_after_attempt, wait_exponential

ALLOWED = (".ts", ".tsx", ".js", ".jsx", ".json")

def git_diff():
    tries = [
        ["git","diff","--unified=0","HEAD~1...HEAD"],
        ["git","diff","--unified=0"]
    ]
    for cmd in tries:
        try:
            return subprocess.check_output(cmd, text=True, stderr=subprocess.STDOUT)
        except Exception:
            pass
    return ""

def filter_diff(diff: str) -> str:
    keep, current = [], None
    for line in diff.splitlines():
        if line.startswith("diff --git"):
            m = re.search(r" b/(.+)$", line)
            current = m.group(1) if m else None
            continue
        if current and current.endswith(ALLOWED):
            keep.append(line)
    return "\n".join(keep)

@retry(stop=stop_after_attempt(2), wait=wait_exponential(min=1, max=6))
def run_agents(diff_excerpt: str) -> str:
    try:
        from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
    except Exception as e:
        return "AutoGenが未インストール/初期化失敗のため、単独LLMレビューをお使いください。詳細: " + str(e)[:400]

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return "OPENAI_API_KEY が未設定のため、AutoGenレビューをスキップしました。"

    reviewer  = AssistantAgent(name="Reviewer",  system_message="厳密なコードレビュワー。重大度順で具体的指摘を短く正確に。")
    tester    = AssistantAgent(name="TestDesigner", system_message="テスト設計者。ユニット/E2Eの追加テストケースを列挙。")
    planner   = AssistantAgent(name="Planner",   system_message="まとめ役。二者の結果を統合し、修正案とチェックリストを出力。")

    user = UserProxyAgent(name="Dev", human_input_mode="NEVER")
    chat = GroupChat(agents=[planner, reviewer, tester, user], messages=[], max_round=4)
    mgr  = GroupChatManager(groupchat=chat)

    prompt = f"""
対象: ケアアプリのPR差分（抜粋）
要件:
- Reviewer: バグ/設計/型/例外/セキュリティ/パフォーマンス/アクセシビリティの指摘（重要度順）
- TestDesigner: 追加すべきユニット/E2Eテストを具体的に
- Planner: 2者の出力を統合し、コード例とチェックリストを含む最終報告を日本語で出力

--- DIFF ---
{diff_excerpt}
"""
    user.initiate_chat(mgr, message=prompt)
    # 最後にPlannerの発話を返す
    for m in reversed(chat.messages):
        if m.get("name") == "Planner":
            return m.get("content","(no content)")
    return "AutoGenの最終結果を取得できませんでした。"

def main():
    raw = git_diff()
    focused = filter_diff(raw)
    if not focused.strip():
        print("【AutoGenレビュー】対象ファイルなし（*.ts,*.tsx,*.js,*.jsx,*.json）")
        return
    print(run_agents(focused[:12000]))

if __name__ == "__main__":
    main()
