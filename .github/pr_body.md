## Overview
<!-- 変更内容の概要を記載してください -->

## チェックリスト
- [ ] build / lint:strict / test グリーン
- [ ] (pochi) 以外の差分なし
- [ ] CSV(BOM/CRLF/0|1)出力OK
- [ ] LSドラフトOK
- [ ] a11y OK

## スクリーンショット
- Daily
  - _スクリーンショットを貼付_
- Users
  - _スクリーンショットを貼付_

## 手動ガード
- [ ] main に Branch protection rule を作成 → Required status checks を有効化（build / lint:strict / test）

## 運用メモ
- PR運用（#137 は Draftのまま）

## 追加メモ
- PR-A: a11y/文言/軽微スタイル
- PR-B: CSV importer（Zod で strict 受理、失敗行だけ再編集）
- PR-C: Users の userSuggestions を既存Userから取得（型：{id,name}）
- PR-D: 月次集計ビュー（ヘッダCSV × 明細CSVを連結してΣ）
