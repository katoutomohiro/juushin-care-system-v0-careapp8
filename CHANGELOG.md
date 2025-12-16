# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- A.T専用ケース記録フォーム（A4印刷対応）
- Console 500エラー止血機能（A.T専用暫定ガード）
- ESLint react-hooks プラグイン導入
- Next.js 15 params Promise対応
- 正本ドキュメント（AI_CONTEXT.md, ROUTE_MAP.md, PREFLIGHT.md, AT_CASE_RECORD_SPEC.md）
- 実機確認手順書（MANUAL_TEST.md）

### Fixed
- CaseRecordCards の無限fetchループ修正（useEffect依存配列最適化）
- Hooks順序違反修正（early return前に全Hooks呼び出し）
- ClickableCard の particleColors プロパティ型エラー解消
- case-records-structured.ts の number/string 比較型エラー解消
- APIエラーハンドリング強化（詳細ログ出力）

### Changed
- TypeScript エラー 10件 → 1件（9件削減）
- lint エラー 0件維持（warnings 2件 → 5件）

## [0.11.0] - 2025-12-16

### Added
- 初期バージョン（プロジェクト開始時）

[Unreleased]: https://github.com/katoutomohiro/juushin-care-system-v0-careapp8/compare/v0.11.0...HEAD
[0.11.0]: https://github.com/katoutomohiro/juushin-care-system-v0-careapp8/releases/tag/v0.11.0
