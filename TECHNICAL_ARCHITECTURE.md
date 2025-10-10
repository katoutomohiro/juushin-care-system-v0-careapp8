# 技術アーキテクチャ詳細

## アプリケーション構成

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (厳密設定)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State Management**: React Hooks + Local Storage
- **PWA**: Service Worker + Manifest

### バックエンド (予定)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **File Storage**: Vercel Blob

### AI/ML統合
- **AI SDK**: Vercel AI SDK
- **Models**: GPT-4, Claude-3 (予定)
- **Use Cases**: 健康状態分析、予測、提案

## データモデル

### ケア記録データ
\`\`\`typescript
interface CareEvent {
  id: string
  userId: string
  eventType: string
  timestamp: Date
  data: Record<string, any>
  notes?: string
}
\`\`\`

### ユーザーデータ
\`\`\`typescript
interface User {
  id: string
  name: string
  medicalInfo?: MedicalInfo
  careSettings: CareSettings
}
\`\`\`

## セキュリティ設計

### データ保護
- 医療情報の暗号化
- アクセス制御 (RBAC)
- 監査ログ機能

### プライバシー
- GDPR準拠
- データ最小化原則
- 同意管理システム

## パフォーマンス最適化

### フロントエンド
- Code Splitting
- Image Optimization
- Service Worker Caching

### データベース
- インデックス最適化
- クエリ最適化
- 接続プーリング

## 開発・運用

### CI/CD
- GitHub Actions
- PowerShell構文チェック
- 自動テスト・デプロイ

### 監視・ログ
- Vercel Analytics
- エラー追跡
- パフォーマンス監視
\`\`\`

GitHub Copilotで達成した成果を包括的にまとめた引き継ぎドキュメントを作成しました。これにより、OpenAI Codexが重心ケアアプリ開発の全体像と現在の状況を正確に把握し、効率的に開発を継続できます。特に残り8個のPRマージと重心ケアアプリのコア機能実装に焦点を当てた実用的な情報を整理しています。
