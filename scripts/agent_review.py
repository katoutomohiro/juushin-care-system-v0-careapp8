import os, subprocess, re

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

def main():
    raw = git_diff()
    focused = filter_diff(raw)
    if not focused.strip():
        print("【AI自動レビュー（雛形）】対象ファイルなし（*.ts,*.tsx,*.js,*.jsx,*.json）")
        return
    excerpt = focused[:4000]
    print(f"""【AI自動レビュー（雛形）】
- 変更要約（ダミー）
- 影響範囲の推定（ダミー）
- 追加テスト/型/例外の提案（ダミー）
- セキュリティ/PII/医療データの注意点（ダミー）

--- diff excerpt ---
{excerpt}
""")

if __name__ == "__main__":
    main()
