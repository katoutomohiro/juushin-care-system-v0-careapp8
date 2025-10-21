#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AutoGen-like multi-role review (Planner / Reviewer / TestDesigner)
- PR差分を取得（PR時は GITHUB_BASE_REF/GITHUB_HEAD_REF、ローカルは HEAD~1...HEAD）
- 3ロールを順に呼び分け（OpenAI API で疑似マルチエージェント）
- 収束結果を ai_review.json（構造化）と ai_review.md（要約）に出力
- 例外/キー未設定時はソフトにフォールバックして exit 0（CIを落とさない）
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from textwrap import dedent

# ---- Config ---------------------------------------------------------------

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
TEMP = float(os.getenv("LLM_TEMPERATURE", "0.2"))
SEED = int(os.getenv("LLM_SEED", "123"))
API_KEY = os.getenv("OPENAI_API_KEY")

AI_JSON_PATH = "ai_review.json"
AI_MD_PATH = "ai_review.md"
REPORT_PATH = "agent_report.txt"  # 既存CIのtee対象。なくてもOK

# ---- OpenAI Client --------------------------------------------------------

try:
    from openai import OpenAI
    _has_openai = True
except Exception:
    _has_openai = False

def oai_chat(system: str, user: str) -> str:
    """Call OpenAI Chat Completions with safe defaults."""
    if not _has_openai or not API_KEY:
        # オフライン/キーなしでもCIを落とさないための代替出力
        return dedent(f"""
        [DRY-RUN: No OpenAI] System={system[:80]}...
        --- REQ ---
        {user[:1200]}
        --- NOTE ---
        OPENAI_API_KEY が未設定、または openai SDK が未インストールです。
        """).strip()

    client = OpenAI(api_key=API_KEY)
    resp = client.chat.completions.create(
        model=MODEL,
        temperature=TEMP,
        seed=SEED,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ]
    )
    return resp.choices[0].message.content.strip()

# ---- Git diff -------------------------------------------------------------

def _run(cmd: str) -> tuple[str, int]:
    p = subprocess.run(cmd, shell=True, text=True, capture_output=True)
    return (p.stdout if p.returncode == 0 else p.stderr), p.returncode

def get_unified_diff() -> str:
    base = os.getenv("GITHUB_BASE_REF", "").strip()
    head = os.getenv("GITHUB_HEAD_REF", "").strip()

    if base and head:
        _run(f"git fetch origin {base} {head} --depth=1")
        out, rc = _run(f"git diff --unified=0 --no-color origin/{base}...origin/{head}")
        if rc == 0 and out.strip():
            return out
    # fallback（pushやローカル実行時）
    out, _ = _run("git diff --unified=0 --no-color HEAD~1...HEAD")
    return out

def trim(text: str, limit: int = 40000) -> str:
    if len(text) <= limit:
        return text
    head = text[: int(limit * 0.8)]
    tail = text[-int(limit * 0.2):]
    return head + "\n...\n" + tail

# ---- Prompts --------------------------------------------------------------

PLANNER_SYS = dedent("""
あなたは「Planner」。
入力として与えられる PR の unified diff（BASE...HEAD）を読み、レビュー論点の"地図"を作る。
- 変更ファイルごとに「関心領域（ロジック/型/パフォーマンス/可用性/セキュリティ/アクセシビリティ/CI）」をタグ付け
- 影響範囲（直接影響/間接影響/外部I/F）を簡潔に推定
- 重大度の仮ラベルを {blocker|major|minor|nit} で暫定付与
出力は Reviewer/TestDesigner が使える **論点リスト** のみ。冗長説明やコードは不要。
""").strip()

REVIEWER_SYS = dedent("""
あなたは「Reviewer」。Planner の論点に対しコードレビューを実施し、**修正パッチ（unified diff）**まで提案する。
評価軸：
1) 正確性/バグ誘発  2) セキュリティ  3) パフォーマンス/スケール  4) 可読性/保守性
5) UX/アクセシビリティ  6) 一貫性（型/命名/レイヤ）

ルール：
- 各指摘に severity {blocker|major|minor|nit} を必ず付与
- 可能な限り **統一 diff** を提示（`diff --git a/... b/...` から始まる形式）
- Next.js/React ではモバイル/ARIA/Legend/Tick も観点に含める
- CI/スクリプトは "失敗時にも実行されるか/タイムアウト/秘匿情報" を確認

最終出力は **JSON 文字列のみ**。以下スキーマ：
{
  "summary": "1〜3行要約",
  "overall_severity": "blocker|major|minor|nit",
  "findings": [
    {
      "file": "path/to/file",
      "lines": "start-end",
      "title": "短い見出し",
      "severity": "blocker|major|minor|nit",
      "details": "簡潔に理由",
      "fix": "どう直すかの要点",
      "patch": "diff --git a/... b/...\\n@@ ... @@\\n- old\\n+ new\\n"
    }
  ]
}
JSON 以外は出力しないこと。
""").strip()

TEST_SYS = dedent("""
あなたは「TestDesigner」。Reviewer の指摘を **再発防止の自動テスト**に落とし込む。
- 単体/結合/スナップショットのどれで検知できるかを分類
- 失敗再現ステップと最小テストコード（Vitest/React Testing Library 想定）を具体化
- CI 実行時間を意識し最小集合に絞る

出力は **JSON 文字列のみ**。スキーマ：
{
  "tests": [
    {
      "name": "テスト名",
      "purpose": "狙い",
      "example": "/* 最小のテストコード例（.test.ts[x]） */"
    }
  ],
  "ci_notes": [
    "ビルド失敗時にもレビューが実行されるか",
    "秘匿値未設定時のフォールバック挙動 など"
  ],
  "slack_summary": "Slack に流す 200字以内サマリ（最重要3点+結論）"
}
JSON 以外は出力しないこと。
""").strip()

# ---- JSON helpers ---------------------------------------------------------

def extract_json(text: str) -> dict:
    """
    LLM出力から最初のJSONオブジェクトを抽出してdict化。
    ```json ... ``` や前後のテキストが混ざっていても頑張って拾う。
    """
    if not text:
        return {}
    # フェンス内
    m = re.search(r"```json\s*(\{.*?\})\s*```", text, flags=re.S)
    if m:
        text = m.group(1)
    else:
        # フェンスなし → 最初の { ... } を貪欲すぎない形で
        m2 = re.search(r"(\{.*\})", text, flags=re.S)
        if m2:
            text = m2.group(1)
    try:
        return json.loads(text)
    except Exception:
        return {}

def write_file(path: str, content: str):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def to_markdown(payload: dict) -> str:
    if not payload:
        return "_no ai_review.json generated_\n"
    lines = []
    lines.append(f"# AI Review Summary\n")
    lines.append(f"- overall_severity: **{payload.get('overall_severity','n/a')}**")
    lines.append("")
    if s := payload.get("summary"):
        lines.append(s.strip())
        lines.append("")
    if findings := payload.get("findings"):
        lines.append("## Top Findings")
        for i, it in enumerate(findings[:3], 1):
            lines.append(f"### {i}. {it.get('title','(no title)')}  _({it.get('severity','n/a')})_")
            lines.append(f"- file: `{it.get('file','')}` lines: {it.get('lines','')}")
            lines.append(f"- details: {it.get('details','').strip()}")
            if it.get("fix"):
                lines.append(f"- fix: {it['fix'].strip()}")
            lines.append("")
    if tests := payload.get("tests"):
        lines.append("## Suggested Tests")
        for t in tests[:3]:
            lines.append(f"- **{t.get('name','(no name)')}**: {t.get('purpose','')}")
        lines.append("")
    return "\n".join(lines).strip() + "\n"

# ---- Main -----------------------------------------------------------------

def main() -> int:
    diff = get_unified_diff().strip()
    if not diff:
        # 差分なしでもJSONを出す（CIとSlackを安定させる）
        empty_payload = {
            "summary": "差分が見つからなかったため、レビュー対象はありませんでした。",
            "overall_severity": "nit",
            "findings": [],
            "tests": [],
            "ci_notes": ["差分なしのためスキップ"],
            "slack_summary": "差分なし：レビュー対象なし。"
        }
        write_file(AI_JSON_PATH, json.dumps(empty_payload, ensure_ascii=False, indent=2))
        write_file(AI_MD_PATH, to_markdown(empty_payload))
        print("No diff detected. Wrote ai_review.json/ai_review.md")
        return 0

    diff_for_model = trim(diff, 40000)

    # ---- Planner
    planner_user = dedent(f"""
    以下は PR の unified diff です。論点の"地図"を作ってください。
    ```diff
    {diff_for_model}
    ```
    """).strip()
    planner_map = oai_chat(PLANNER_SYS, planner_user)

    # ---- Reviewer
    reviewer_user = dedent(f"""
    これは Planner の論点です：
    ---
    {planner_map}
    ---
    同じ差分を参照して、指定スキーマどおり **JSONのみ** を出力してください。
    ```diff
    {diff_for_model}
    ```
    """).strip()
    reviewer_out = oai_chat(REVIEWER_SYS, reviewer_user)
    reviewer_json = extract_json(reviewer_out)

    # ---- TestDesigner
    test_user = dedent(f"""
    これは Reviewer の出力(JSON想定)です：
    ---
    {json.dumps(reviewer_json, ensure_ascii=False, indent=2)}
    ---
    指定スキーマどおり **JSONのみ** を出力してください。
    """).strip()
    test_out = oai_chat(TEST_SYS, test_user)
    test_json = extract_json(test_out)

    # ---- Merge
    payload = {
        "summary": reviewer_json.get("summary") or "レビュー結果の要約が生成されました。",
        "overall_severity": reviewer_json.get("overall_severity", "minor"),
        "findings": reviewer_json.get("findings", []),
        "tests": test_json.get("tests", []),
        "ci_notes": test_json.get("ci_notes", []),
        "slack_summary": test_json.get("slack_summary", "AIレビューを実施しました。詳細はPRを参照してください。")
    }

    write_file(AI_JSON_PATH, json.dumps(payload, ensure_ascii=False, indent=2))
    write_file(AI_MD_PATH, to_markdown(payload))

    # 標準出力にも短いサマリ（CIログで上位に残す）
    print("=== AI REVIEW SUMMARY ===")
    print(f"overall_severity: {payload['overall_severity']}")
    print(payload["summary"])
    print("=========================")

    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        # どんな例外でもCIを落とさない
        fallback = {
            "summary": f"AIレビューで例外が発生しました: {type(e).__name__}",
            "overall_severity": "minor",
            "findings": [],
            "tests": [],
            "ci_notes": [str(e)],
            "slack_summary": "AIレビューで例外。詳細はログを確認してください。"
        }
        write_file(AI_JSON_PATH, json.dumps(fallback, ensure_ascii=False, indent=2))
        write_file(AI_MD_PATH, to_markdown(fallback))
        print(f"[WARN] Exception: {e}")
        sys.exit(0)
