# Copilot Coding Agent 運用手頁E��Elack連携�E�E
こ�Eドキュメント�E、Slack から GitHub Copilot Coding Agent を使って本リポジトリの定常運用を行うための手頁E��定型プロンプトをまとめたも�Eです、E
## 0) 初回セチE��アチE�E�E�Elack管琁E��EOrg管琁E��E���E�E
Slack�E�ワークスペ�Eス冁E���E�E
1. `/invite @GitHub`
2. `/github signin`
3. `/github subscribe katoutomohiro/juushin-care-system-v0-careapp8`

GitHub�E�絁E��管琁E��E��E
- Copilot ↁECoding agent を有効化！Elack 連携を許可�E�、E- Slack for GitHub アプリの「Repository access」に `katoutomohiro/juushin-care-system-v0-careapp8` を追加、E
これで、Slackの任意チャンネル�E�侁E `#careapp-dev`�E�かめE`@GitHub` 宛ての自然斁E�� Copilot Coding Agent に作業を依頼できます、E
---

## 1) リリースPRのBLOCKED解除�E�リリース作�Eまで�E�E88 相当！E
Slack の `#careapp-dev` チャンネルで、@GitHub をメンションして次を送ってください、E
```text
@GitHub Copilot Coding Agent
対象リポジトリ: katoutomohiro/juushin-care-system-v0-careapp8
タスク: Release PR (#88) が「required status checks」不一致で BLOCKED。以下を自動実施し、完亁E��告してください、E
1) main の忁E��スチE�EタスチェチE��名を取得！Euild-test / ai-agent-review / agent-runner / tests�E�E2) release/v0.11.0 ブランチ上に、上訁Eつの名前と一致する「ブリチE��用Workflow」を .github/workflows に追加
3) release/v0.11.0 にコミット！E�EチE��ュ ↁE#88 の checks が通るまで監要E4) checks が�E成功後、E88 めESquash マ�Eジ�E�Euto-merge 設定許可�E�E5) main HEAD に tag v0.11.0 を付与し、GitHub Release(v0.11.0) を作�E�E�Eenerate notes 有効�E�E6) 一時ブリチE��Workflowを削除する PR を作�E�E�タイトル: chore: remove temporary bridge CI for v0.11.0�E��E auto-merge 設宁E7) 実行ログと結果�E�作�E/更新ファイル、PR/Tag/Release URL、残タスク�E�を要紁E��てスレチE��にまとめて報呁E
前提と制紁E
- main は直接書き換え不可。PR経由また�Eタグ作�Eのみ
- 機寁E��ァイル(.env, secrets)の変更禁止
- 既存CI/保護ルールは維持E- すべてのコミット�E1トピチE��小さめで
```

---

## 2) CSV エクスポ�Eターの maskFields 統一�E�E90 相当！E
```text
@GitHub Copilot Coding Agent
対象リポジトリ: katoutomohiro/juushin-care-system-v0-careapp8
タスク: CSV エクスポ�Eターに PDF と同じ「�E定義�E�maskFields」設計を統一皁E��導�Eし、UT 追加、PR 作�Eまで行ってください、E
要件:
- 既孁EPDF の設計！Eolumn<T> / toData の純関数 / maskFields / rowMapper�E�と API/型方針を統一
- lib/exporter/csv.ts に V2 関数 exportAsCsvV2<T> を追加�E�既存�E @deprecated で温存！E- tests/unit/csv-exporter.spec.ts に V2 用のチE��トケースめE5 件以上（�E定義/マスク/ネストキー/map/rowMapper�E�E- 画面側の置換�E別PR�E�今回はライブラリ�E�E��スト�Eみ�E�E- 変更篁E��: lib/exporter/*, tests/unit/* のみ

PR:
- ブランチE feat/csv-mask-unified
- タイトル: feat(csv): CSVエクスポ�EターにPIIマスク機�E追加�E�EDFと統一設計！E- 本斁E 変更点/チE��チE互換性/影響篁E��/今後�E移行（画面差替�E�を記輁E- auto-merge ON、忁E��あれ�E main を取り込みリベ�Eス
- 実行結果�E�ビルチEチE��チEPR URL�E�をこ�EスレチE��に報呁E```

---

## 3) PDF/CSV 画面側のV2 API差し替ぁE& E2E 追加�E�後続！E
```text
@GitHub Copilot Coding Agent
対象: katoutomohiro/juushin-care-system-v0-careapp8
タスク: 履歴ペ�Eジ�E�Eeizure/expression�E��Eエクスポ�Eト�EタンめEV2 API に差し替え、E2E でダウンロード検証を追加、E
要件:
- 画面側 PdfExportButton/CsvExportButton の呼び出しを V2 に差し替ぁE- note/memo は maskFields 既定でマスク
- Playwright で CSV/PDF ダウンロード�E存在・サイズ>0・拡張子などを検証
- 変更篁E��: app/daily-log/**/history/*ExportButton.tsx, tests/e2e/*
- ブランチE feat/export-buttons-v2
- PR タイトル: feat(export): 履歴画面のCSV/PDFをV2 APIへ移行＋E2E追加
- auto-merge ON、結果を報呁E```

---

## 4) 運用ガード！Egentへの“お作法”！E
- main 直コミット禁止。忁E��PR経由。保護ルールは変更しなぁE- secrets/.env/PII含み得るファイルに触らなぁE- 大量変更は禁止、EPRは1トピチE��/小さめ差刁E- CI が赤なら�E動でre-runせず原因を説明して相諁E- 破壊的変更は提案止まり（実裁E�E別PRで�E�E- すべての作業ログ�E�コマンチE差刁EURL�E�をスレチE��に時系列で残す

---

## 5) 通知・監視用の軽量�Eロンプト

- Open PR 一覧とチェチE��状況�E要紁E  - `@GitHub こ�Eリポジトリの Open PR 一覧とチェチE��状況を要紁E��て。auto-merge が有効ぁE保留か、blocked 琁E���E�不足チェチE��吁Eレビュー要否�E�まで。`

- Vercel Pending 長期化の検�E
  - `@GitHub Vercel の pending ぁE0刁E��上続く PR を検�Eして、コメントで注意喚起しつつ、他�E忁E��チェチE��が揃ってぁE��かどぁE��も併記して。`

- リリースノ�Eト生成（ワークログ付き�E�E  - `@GitHub 直近リリースタグ v0.11.0 の Release Notes を�E生�E。今回の #88 / #89 / #90 / #91 を要紁E��、変更点・影響篁E��・ロールバック手頁E�E拁E��老E��Egent含む�E�を追加して更新`

