# Copilot Coding Agent 運用手順（Slack連携）

このドキュメントは、Slack から GitHub Copilot Coding Agent を使って本リポジトリの定常運用を行うための手順と定型プロンプトをまとめたものです。

## 0) 初回セットアップ（Slack管理者/Org管理者用）

Slack（ワークスペース内で）

1. `/invite @GitHub`
2. `/github signin`
3. `/github subscribe katoutomohiro/juushin-care-system-v0-careapp8`

GitHub（組織管理者）

- Copilot → Coding agent を有効化（Slack 連携を許可）。
- Slack for GitHub アプリの「Repository access」に `katoutomohiro/juushin-care-system-v0-careapp8` を追加。

これで、Slackの任意チャンネル（例: `#careapp-dev`）から `@GitHub` 宛ての自然文で Copilot Coding Agent に作業を依頼できます。

---

## 1) リリースPRのBLOCKED解除～リリース作成まで（#88 相当）

Slack の `#careapp-dev` チャンネルで、@GitHub をメンションして次を送ってください。

```text
@GitHub Copilot Coding Agent
対象リポジトリ: katoutomohiro/juushin-care-system-v0-careapp8
タスク: Release PR (#88) が「required status checks」不一致で BLOCKED。以下を自動実施し、完了報告してください。

1) main の必須ステータスチェック名を取得（build-test / ai-agent-review / agent-runner / tests）
2) release/v0.11.0 ブランチ上に、上記4つの名前と一致する「ブリッジ用Workflow」を .github/workflows に追加
3) release/v0.11.0 にコミット＆プッシュ → #88 の checks が通るまで監視
4) checks が全成功後、#88 を Squash マージ（auto-merge 設定許可）
5) main HEAD に tag v0.11.0 を付与し、GitHub Release(v0.11.0) を作成（Generate notes 有効）
6) 一時ブリッジWorkflowを削除する PR を作成（タイトル: chore: remove temporary bridge CI for v0.11.0）→ auto-merge 設定
7) 実行ログと結果（作成/更新ファイル、PR/Tag/Release URL、残タスク）を要約してスレッドにまとめて報告

前提と制約:
- main は直接書き換え不可。PR経由またはタグ作成のみ
- 機密ファイル(.env, secrets)の変更禁止
- 既存CI/保護ルールは維持
- すべてのコミットは1トピック小さめで
```

---

## 2) CSV エクスポーターの maskFields 統一（#90 相当）

```text
@GitHub Copilot Coding Agent
対象リポジトリ: katoutomohiro/juushin-care-system-v0-careapp8
タスク: CSV エクスポーターに PDF と同じ「列定義＋maskFields」設計を統一的に導入し、UT 追加、PR 作成まで行ってください。

要件:
- 既存 PDF の設計（Column<T> / toData の純関数 / maskFields / rowMapper）と API/型方針を統一
- lib/exporter/csv.ts に V2 関数 exportAsCsvV2<T> を追加（既存は @deprecated で温存）
- tests/unit/csv-exporter.spec.ts に V2 用のテストケースを 5 件以上（列定義/マスク/ネストキー/map/rowMapper）
- 画面側の置換は別PR（今回はライブラリ＆テストのみ）
- 変更範囲: lib/exporter/*, tests/unit/* のみ

PR:
- ブランチ: feat/csv-mask-unified
- タイトル: feat(csv): CSVエクスポーターにPIIマスク機能追加（PDFと統一設計）
- 本文: 変更点/テスト/互換性/影響範囲/今後の移行（画面差替）を記載
- auto-merge ON、必要あれば main を取り込みリベース
- 実行結果（ビルド/テスト/PR URL）をこのスレッドに報告
```

---

## 3) PDF/CSV 画面側のV2 API差し替え & E2E 追加（後続）

```text
@GitHub Copilot Coding Agent
対象: katoutomohiro/juushin-care-system-v0-careapp8
タスク: 履歴ページ（seizure/expression）のエクスポートボタンを V2 API に差し替え、E2E でダウンロード検証を追加。

要件:
- 画面側 PdfExportButton/CsvExportButton の呼び出しを V2 に差し替え
- note/memo は maskFields 既定でマスク
- Playwright で CSV/PDF ダウンロードの存在・サイズ>0・拡張子などを検証
- 変更範囲: app/daily-log/**/history/*ExportButton.tsx, tests/e2e/*
- ブランチ: feat/export-buttons-v2
- PR タイトル: feat(export): 履歴画面のCSV/PDFをV2 APIへ移行＋E2E追加
- auto-merge ON、結果を報告
```

---

## 4) 運用ガード（Agentへの“お作法”）

- main 直コミット禁止。必ずPR経由。保護ルールは変更しない
- secrets/.env/PII含み得るファイルに触らない
- 大量変更は禁止。1PRは1トピック/小さめ差分
- CI が赤なら自動でre-runせず原因を説明して相談
- 破壊的変更は提案止まり（実装は別PRで）
- すべての作業ログ（コマンド/差分/URL）をスレッドに時系列で残す

---

## 5) 通知・監視用の軽量プロンプト

- Open PR 一覧とチェック状況の要約
  - `@GitHub このリポジトリの Open PR 一覧とチェック状況を要約して。auto-merge が有効か/保留か、blocked 理由（不足チェック名/レビュー要否）まで。`

- Vercel Pending 長期化の検出
  - `@GitHub Vercel の pending が30分以上続く PR を検出して、コメントで注意喚起しつつ、他の必須チェックが揃っているかどうかも併記して。`

- リリースノート生成（ワークログ付き）
  - `@GitHub 直近リリースタグ v0.11.0 の Release Notes を再生成。今回の #88 / #89 / #90 / #91 を要約し、変更点・影響範囲・ロールバック手順・担当者（Agent含む）を追加して更新`
