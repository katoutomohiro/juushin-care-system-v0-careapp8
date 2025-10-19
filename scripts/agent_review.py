import os, subprocess, re, sys
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

def build_prompt(diff_excerpt: str) -> str:
    return f"""
あなたは重症心身障がい児者向けケアアプリのシニアレビュワーです。
以下の diff から、要点を日本語でレビューしてください。

必須観点:
- 仕様逸脱/バグの可能性
- 型安全性・例外/エラーハンドリング
- アクセシビリティ（日本語表示、読み上げ、色覚差）
- セキュリティ/PII/医療データの取り扱い（保存先、マスキング、ログ）
- パフォーマンス（レンダリング/メモリ/再レンダリング）
- 追加すべきテスト項目（ユニット/E2E）
- 改善可能な設計（依存の分離、再利用、命名、一貫性）

出力:
1) 重要度順の指摘リスト（箇条書き）
2) 具体的な修正案（コード断片があればコードブロックで）
3) 追跡用チェックリスト（- [ ] 形式）

--- DIFF (抜粋) ---
{diff_excerpt}
"""

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
def call_openai(prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    resp = client.chat.completions.create(
        model=model,
        temperature=0.2,
        messages=[
            {"role":"system","content":"You are a meticulous senior code reviewer for a medical care app."},
            {"role":"user","content": prompt}
        ],
        max_tokens=1200
    )
    return resp.choices[0].message.content.strip()

def main():
    raw = git_diff()
    focused = filter_diff(raw)
    if not focused.strip():
        print("【AIレビュー】対象ファイルなし（*.ts,*.tsx,*.js,*.jsx,*.json）")
        return
    prompt = build_prompt(focused[:12000])
    try:
        report = call_openai(prompt)
        print(report)
    except Exception as e:
        # フェイルセーフ: 失敗時はダミー出力でCIを通す
        print("【AIレビュー失敗】LLM呼び出しで例外が発生しました。ダミー要約を出力します。")
        print(str(e)[:500])

if __name__ == "__main__":
    main()
