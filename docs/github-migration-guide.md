# 新しいGitHubプロジェクト作成・移行ガイド
## PC初心者向け詳細手順書

### 📋 事前準備
- GitHubアカウントにログイン済みであること
- 現在のワークスペースが正常に動作していること

---

## 🚀 Step 1: 新しいGitHubリポジトリの作成

### 1-1. GitHubにアクセス
- ブラウザで https://github.com を開く
- 右上のプロフィール画像をクリックしてログイン状態を確認

### 1-2. 新しいリポジトリを作成
1. **緑色の「New」ボタンをクリック**
   - 画面左側の「Top repositories」セクションにある緑色のボタン
   - または画面右上の「+」アイコン → 「New repository」

2. **リポジトリ情報を入力**
   \`\`\`
   Repository name: soul-care-system-v2
   Description: 重症心身障がい児者支援アプリ - PROJECT SOUL (新バージョン)
   \`\`\`

3. **設定を選択**
   - ✅ Public (推奨) または Private
   - ✅ Add a README file
   - ✅ Add .gitignore → 「Node」を選択
   - ✅ Choose a license → 「MIT License」を選択

4. **「Create repository」ボタンをクリック**

### 1-3. リポジトリURLを確認
- 作成後のURL例: `https://github.com/katoutomohiro/soul-care-system-v2`
- このURLをメモしておく

---

## 📁 Step 2: v0ワークスペースからファイルをダウンロード

### 2-1. v0でZIPダウンロード
1. **v0画面右上の「⋯」(三点メニュー)をクリック**
2. **「Download ZIP」を選択**
3. **ファイルを保存** (例: `soul-care-system.zip`)

### 2-2. ZIPファイルを展開
1. **ダウンロードしたZIPファイルを右クリック**
2. **「すべて展開」または「Extract All」を選択**
3. **展開先フォルダを選択** (例: `C:\Users\[ユーザー名]\Desktop\soul-care-system`)

---

## 🔄 Step 3: GitHubにファイルをアップロード

### 3-1. GitHub Web UIでアップロード
1. **新しく作成したリポジトリページを開く**
   - URL: `https://github.com/katoutomohiro/soul-care-system-v2`

2. **「uploading an existing file」リンクをクリック**
   - 「Quick setup」セクション内にあります

3. **ファイルをドラッグ&ドロップ**
   - 展開したフォルダ内の**すべてのファイル**を選択
   - ブラウザの点線枠内にドラッグ&ドロップ

### 3-2. コミット情報を入力
\`\`\`
Commit title: Initial commit - 重心ケアアプリ移行
Description: 
- v0ワークスペースから完全移行
- 重症心身障がい児者支援システム
- 全機能正常動作確認済み
\`\`\`

### 3-3. 「Commit changes」をクリック

---

## ⚙️ Step 4: GitHub設定の最適化

### 4-1. リポジトリ設定
1. **「Settings」タブをクリック**
2. **「General」セクションで以下を設定:**
   - ✅ Issues (課題管理を有効化)
   - ✅ Projects (プロジェクト管理を有効化)
   - ✅ Wiki (ドキュメント管理を有効化)

### 4-2. ブランチ保護設定
1. **「Branches」セクションを開く**
2. **「Add rule」をクリック**
3. **設定内容:**
   \`\`\`
   Branch name pattern: main
   ✅ Require pull request reviews before merging
   ✅ Require status checks to pass before merging
   \`\`\`

### 4-3. GitHub Pages設定 (オプション)
1. **「Pages」セクションを開く**
2. **Source: Deploy from a branch**
3. **Branch: main / (root)**
4. **「Save」をクリック**

---

## 🔗 Step 5: v0との連携設定

### 5-1. v0でGitHub連携
1. **v0画面右上の歯車アイコンをクリック**
2. **「GitHub」セクションを選択**
3. **新しいリポジトリURLを入力:**
   \`\`\`
   https://github.com/katoutomohiro/soul-care-system-v2
   \`\`\`
4. **「Connect」をクリック**

### 5-2. 連携確認
- ✅ 緑色のチェックマークが表示される
- ✅ 「変更をプッシュ」ボタンが有効になる

---

## 📊 Step 6: プロジェクト管理設定

### 6-1. GitHub Projectsの作成
1. **「Projects」タブをクリック**
2. **「New project」をクリック**
3. **テンプレート選択: 「Team planning」**
4. **プロジェクト名: 「重心ケアアプリ開発」**

### 6-2. 初期タスクの作成
\`\`\`
📋 Phase 1: 基盤安定化
- [x] v0からの完全移行
- [ ] CI/CD設定
- [ ] テスト環境構築

📋 Phase 2: 機能拡張
- [ ] 新機能開発
- [ ] UI/UX改善
- [ ] パフォーマンス最適化

📋 Phase 3: 本格運用
- [ ] 本番環境デプロイ
- [ ] ユーザーテスト
- [ ] 運用開始
\`\`\`

---

## 🎯 Step 7: 開発環境の準備

### 7-1. ローカル開発環境 (オプション)
\`\`\`bash
# リポジトリをクローン
git clone https://github.com/katoutomohiro/soul-care-system-v2.git

# ディレクトリに移動
cd soul-care-system-v2

# 依存関係をインストール
npm install

# 開発サーバー起動
npm run dev
\`\`\`

### 7-2. Vercelデプロイ設定
1. **https://vercel.com にアクセス**
2. **「Import Project」をクリック**
3. **GitHubリポジトリを選択**
4. **自動デプロイ設定完了**

---

## ✅ 完了チェックリスト

### 必須項目
- [ ] 新しいGitHubリポジトリが作成された
- [ ] 全ファイルが正常にアップロードされた
- [ ] v0との連携が完了した
- [ ] リポジトリ設定が適切に行われた

### 推奨項目
- [ ] GitHub Projectsが設定された
- [ ] ブランチ保護ルールが設定された
- [ ] GitHub Pagesが有効化された
- [ ] Vercelデプロイが完了した

---

## 🆘 トラブルシューティング

### よくある問題と解決策

#### 1. ファイルアップロードが失敗する
**原因:** ファイルサイズが大きすぎる
**解決策:** 
- `node_modules`フォルダを除外
- `.next`フォルダを除外
- 必要なソースファイルのみアップロード

#### 2. v0連携が失敗する
**原因:** リポジトリURLが間違っている
**解決策:**
- URLを再確認: `https://github.com/ユーザー名/リポジトリ名`
- リポジトリがPublicに設定されているか確認

#### 3. 権限エラーが発生する
**原因:** GitHubの権限設定
**解決策:**
- Personal Access Tokenを生成
- リポジトリの権限設定を確認

---

## 📞 サポート情報

### 参考URL
- GitHub公式ドキュメント: https://docs.github.com
- v0公式ヘルプ: https://vercel.com/help
- Next.js公式ドキュメント: https://nextjs.org/docs

### 緊急時の対応
1. **v0サポートチケット作成:** https://vercel.com/help
2. **GitHub Support:** https://support.github.com
3. **コミュニティフォーラム:** https://github.com/discussions

---

## 🎊 移行完了後の次のステップ

### 1. 開発再開
- 新しいリポジトリで機能追加
- バグ修正とパフォーマンス改善
- ユーザーフィードバックの収集

### 2. チーム開発
- コラボレーターの招待
- プルリクエストワークフローの確立
- コードレビュープロセスの導入

### 3. 本格運用
- 本番環境へのデプロイ
- 監視・ログ設定
- バックアップ戦略の実装

---

**🎯 この手順に従えば、PC初心者でも安全に新しいGitHubプロジェクトへの移行が完了できます！**
