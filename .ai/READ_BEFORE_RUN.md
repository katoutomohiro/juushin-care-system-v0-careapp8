# This file is mandatory to read aloud before any change. Version: 2025-10-16
タイトル: AGENT-SAFETY-PROTOCOL: Always confirm latest files & cross-agent sync before any change

## ⭐ 重要補足（2026-02-20 追加）

**このプロジェクトのセキュリティドキュメント確認必須**

コード実装前に**必ず** 以下を読んでください：

1. `docs/SECURITY_MODEL.md` - 認証→認可→処理→監査の API 強制フロー
   - service_id スコープの重要性
   - SUPABASE_SERVICE_ROLE_KEY 使用時も認可省略禁止
   - 詳細: [SECURITY_MODEL.md](../docs/SECURITY_MODEL.md)

2. `docs/AUDIT_LOGGING.md` - PII/PHI 禁止ルール
   - ログに full_name, address, phone を含めない
   - 詳細: [AUDIT_LOGGING.md](../docs/AUDIT_LOGGING.md)

3. `docs/DATA_RETENTION.md` - PII 削除・バックアップポリシー
   - 利用終了後の自動削除フロー
   - 詳細: [DATA_RETENTION.md](../docs/DATA_RETENTION.md)

4. `docs/HANDOFF_PROMPT.md` - この AI 引き継ぎガイド
   - 読む順番・確認チェックリスト
   - 詳細: [HANDOFF_PROMPT.md](../docs/HANDOFF_PROMPT.md)

---

## 指示:

あなた（Codex）は以後、katoutomohiro/juushin-care-system-v0-careapp8 でいかなる編集/実行を行う前に、次のプロトコルを厳守してください。
初回実行時に以下を自動セットアップし、以後の全タスクで再利用します。

0) セットアップ（初回のみ）

リポジトリ直下に .ai/ ディレクトリを作成し、次の2ファイルを管理します。

.ai/READ_BEFORE_RUN.md … 本プロトコル本文（この指示を保存）

.ai/RUN_BOOK.md … 毎タスクのチェック結果ログ（時刻つき）

すでに存在する場合は上書きせず追記。以後の全タスク開始時に .ai/READ_BEFORE_RUN.md を音読→遵守宣言 してから作業を始めます。

1) ユーザー保存の確認（ローカル → GitHub）

必ず毎回、実行を開始する前にあなたが行うこと：

ユーザーに保存確認の問いかけ（必須）
次をそのまま表示して、ユーザーの明示回答を待ってください。

【保存確認】VS Codeで最新の編集を保存しましたか？
- Auto Save は ON ですか？（[ファイル] > [自動保存]）
- 直近で変更したファイルを [Ctrl+K, S] または [すべて保存] しましたか？
保存を完了したら「OK-保存」と返信してください。未保存なら「保留」と返信してください。


返信が 「OK-保存」 でなければ、作業を開始しないで待機。

GitHub への反映確認

GitHub上の main もしくは作業ブランチに最新コミットが存在するか確認する。

次の情報を表示してユーザーに確認を求める（Codex は自動で取得・表示してよい）：

HEAD の コミットSHA/日時/著者/件名

git status（クリーンかどうか）

直近変更ファイルの一覧（git diff --name-only HEAD~1..HEAD）

表示後にユーザーへ確認：

【同期確認】このコミットが、あなたの意図した「最新編集」を含んでいますか？  
はい＝「OK-同期」／ いいえ＝「再同期」


「OK-同期」以外では作業を開始しない。必要なら git fetch --all --prune → git pull --rebase を実施し再確認。

目的：ユーザーのローカル保存 → GitHub反映 → 私（Codex）も同じHEADを見ていることを、毎回二重に担保。

2) 変更対象の実ファイルを特定して照合

実行対象（例：components/ui/chart.tsx など）をファイルパスで列挙。

各ファイルについて以下を表示し、ユーザーに可視化：

最終コミット（SHA/日時/著者/件名）

差分の有無（git diff --stat）

ファイルハッシュ（SHA-256）

そのうえでユーザーに再確認：

【対象確認】このファイル一覧と状態で間違いありませんか？
はい＝「OK-対象」／ いいえ＝「修正対象の差替」


「OK-対象」以外なら作業を開始しない。

目的：Codexが触るファイルが本当に最新で、あなたの意図と一致していることを、開始前にゼロ距離で確認。

3) クロスエージェントの実行前アク知

Copilot（実装担当）・v0（UI自動生成担当）が誤読しないよう、以下のアク知テンプレを .ai/RUN_BOOK.md に追記し、ログとしても表示：

[RUN-ID: {日時-連番}]
TARGET HEAD : {コミットSHA}
BRANCH      : {ブランチ名}
FILES       : {今回対象ファイルの一覧}
USER-OK     : 保存=OK-保存 / 同期=OK-同期 / 対象=OK-対象
TASK        : {今回の作業要約（1～2行）}


Copilot/v0 へ共有メッセージ（Codex内コメントでOK。Jules未連携のためJulesは除外）：

【実行前確認】必ずこのRUN-IDの HEAD（{SHA}）を read-only でロードしてから開始してください。
- ユーザー編集の反映確認済み（OK-保存／OK-同期）
- 対象ファイルは {…}
- 以後、diffはこのHEAD基準で作成
- 作業後は lint/typecheck/build の結果サマリと差分件数を提出


目的：他エージェントが"今のHEAD"を見ないまま走り出す事故を防止。

あなた（Codex）は以後、katoutomohiro/juushin-care-system-v0-careapp8 でいかなる編集/実行を行う前に、次のプロトコルを厳守してください。
初回実行時に以下を自動セットアップし、以後の全タスクで再利用します。

0) セットアップ（初回のみ）

リポジトリ直下に .ai/ ディレクトリを作成し、次の2ファイルを管理します。

.ai/READ_BEFORE_RUN.md … 本プロトコル本文（この指示を保存）

.ai/RUN_BOOK.md … 毎タスクのチェック結果ログ（時刻つき）

すでに存在する場合は上書きせず追記。以後の全タスク開始時に .ai/READ_BEFORE_RUN.md を音読→遵守宣言 してから作業を始めます。

1) ユーザー保存の確認（ローカル → GitHub）

必ず毎回、実行を開始する前にあなたが行うこと：

ユーザーに保存確認の問いかけ（必須）
次をそのまま表示して、ユーザーの明示回答を待ってください。

【保存確認】VS Codeで最新の編集を保存しましたか？
- Auto Save は ON ですか？（[ファイル] > [自動保存]）
- 直近で変更したファイルを [Ctrl+K, S] または [すべて保存] しましたか？
保存を完了したら「OK-保存」と返信してください。未保存なら「保留」と返信してください。


返信が 「OK-保存」 でなければ、作業を開始しないで待機。

GitHub への反映確認

GitHub上の main もしくは作業ブランチに最新コミットが存在するか確認する。

次の情報を表示してユーザーに確認を求める（Codex は自動で取得・表示してよい）：

HEAD の コミットSHA/日時/著者/件名

git status（クリーンかどうか）

直近変更ファイルの一覧（git diff --name-only HEAD~1..HEAD）

表示後にユーザーへ確認：

【同期確認】このコミットが、あなたの意図した「最新編集」を含んでいますか？  
はい＝「OK-同期」／ いいえ＝「再同期」


「OK-同期」以外では作業を開始しない。必要なら git fetch --all --prune → git pull --rebase を実施し再確認。

目的：ユーザーのローカル保存 → GitHub反映 → 私（Codex）も同じHEADを見ていることを、毎回二重に担保。

2) 変更対象の実ファイルを特定して照合

実行対象（例：components/ui/chart.tsx など）をファイルパスで列挙。

各ファイルについて以下を表示し、ユーザーに可視化：

最終コミット（SHA/日時/著者/件名）

差分の有無（git diff --stat）

ファイルハッシュ（SHA-256）

そのうえでユーザーに再確認：

【対象確認】このファイル一覧と状態で間違いありませんか？
はい＝「OK-対象」／ いいえ＝「修正対象の差替」


「OK-対象」以外なら作業を開始しない。

目的：Codexが触るファイルが本当に最新で、あなたの意図と一致していることを、開始前にゼロ距離で確認。

3) クロスエージェントの実行前アク知

Copilot（実装担当）・v0（UI自動生成担当）が誤読しないよう、以下のアク知テンプレを .ai/RUN_BOOK.md に追記し、ログとしても表示：

[RUN-ID: {日時-連番}]
TARGET HEAD : {コミットSHA}
BRANCH      : {ブランチ名}
FILES       : {今回対象ファイルの一覧}
USER-OK     : 保存=OK-保存 / 同期=OK-同期 / 対象=OK-対象
TASK        : {今回の作業要約（1～2行）}


Copilot/v0 へ共有メッセージ（Codex内コメントでOK。Jules未連携のためJulesは除外）：

【実行前確認】必ずこのRUN-IDの HEAD（{SHA}）を read-only でロードしてから開始してください。
- ユーザー編集の反映確認済み（OK-保存／OK-同期）
- 対象ファイルは {…}
- 以後、diffはこのHEAD基準で作成
- 作業後は lint/typecheck/build の結果サマリと差分件数を提出


目的：他エージェントが“今のHEAD”を見ないまま走り出す事故を防止。

4) 実行ポリシー（編集・検査・コミット）

小粒原則：1コミット＝1ファイル（例外は明示）。

各コミット前に pnpm typecheck && pnpm lint を実行してコミットブロック（通らなければコミットしない）。

機械的一括置換は dry-run → 差分提示 → 承認後に適用。

PII禁止：PR本文・ログ・スクショに個人情報を載せない。

作業完了ごとに .ai/RUN_BOOK.md に以下の結果テンプレを追記・表示：

RESULT:
  - lint: {OK/NG}（警告件数=xx）
  - typecheck: {OK/NG}
  - build: {OK/NG}
  - changed files: {n} （一覧）
  - next step: {次アクション}


5) ユーザー最終確認（毎タスクの終了時）

結果サマリと差分を提示したら、必ずユーザーへ明示確認：

【結果確認】この差分と結果で進めて問題ありませんか？
はい＝「OK-結果」／ いいえ＝「修正リクエスト: …（具体）」


「OK-結果」以外は PR を作成しない／次のステップに進まない。

6) 失敗時の扱い

いずれかの段階で OKレスが得られない／検査NG の場合は 即停止。

停止時には .ai/RUN_BOOK.md に原因・再現手順・暫定対処案を追記し、ユーザーに可視化。

7) 実行の宣誓（毎回）

作業開始前に、以下の短文をあなた自身が出力してから着手してください：

「私は .ai/READ_BEFORE_RUN.md を確認し、保存・同期・対象・クロスエージェント確認を完了しました。OKレスを受領し、HEAD={SHA} 基準で作業を開始します。」

付録A：PowerShell/Nodeで使える“実在確認”ワンライナー

変更ファイルの最終保存時刻（例）
Get-Item .\components\ui\chart.tsx | Select-Object FullName,LastWriteTime

ファイルのSHA-256
Get-FileHash -Algorithm SHA256 .\components\ui\chart.tsx

Git最終コミット（要点）
git log -1 --pretty=format:"%H %ci %an %s"

HEADと差分ファイル
git diff --name-only HEAD~1..HEAD

Codexはこれらを自動実行→数値を提示してユーザー確認をもらってから進むこと。

付録B：Copilot／v0への連絡テンプレ（Codexが毎回貼る）
【RUN-ID: {…} / HEAD: {SHA}】
作業前アク知：ユーザー編集は保存＆GitHub同期済み。必ずこのHEADをロードしてから処理開始。
- 対象: {ファイル一覧}
- 期待結果: {短文}
- 完了時に提出: lint/typecheck/build の要約 と changed files 一覧

以上がチャットｇｐｔ5からの指示ですが、この指示の保存するプランファイルがあっている場合は確認してください。間違っていなければ、この指示の基、実行して下さい
