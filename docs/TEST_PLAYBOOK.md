# 全端末アクセス 技術確認プレイブック

## 目的
- 未ログインでアプリ画面・APIにアクセスできないことを確認する
- ALLOW_REAL_PII=false の場合に PII 入力が UI/API の両方で拒否されることを確認する
- PC/スマホ/タブレットで最低限の動線が動作することを確認する

---

## 端末別チェック（PC / スマホ / タブレット）

### 1. ログイン確認
- 未ログイン状態で / にアクセス → /login にリダイレクトされる
- 正常ログイン後に /services/... に遷移できる

### 2. 一覧 → 編集 → 保存 → 反映
- 利用者一覧が表示される
- 利用者詳細に遷移できる
- 編集を開いて保存できる（PIIを含まない範囲）
- 保存後の表示が更新される

### 3. PII 禁止（ALLOW_REAL_PII=false）
- 実名・住所・電話番号などの入力欄が表示されない、または無効化される
- API に full_name 等を送信すると 400 が返る（"PII is disabled"）

---

## 禁止事項（必須）
- 実名・住所・電話番号・緊急連絡先などの入力/保存/共有
- URL の無断共有・SNS へのスクショ投稿
- テスト結果の個人情報を含むログ保存

---

## 失敗時のログ採取（Windows PowerShell）

```powershell
# Lint
pnpm lint

# Build
pnpm build

# Typecheck
pnpm typecheck

# 直近の Git 状態
git status

# 直近のログ（必要に応じて）
Get-ChildItem . -Filter "*.log" -Recurse | Select-Object -First 20
```

---

## 期待結果（合格ライン）
- 未ログインアクセスがブロックされる
- PII が入力できない（UI）かつ API が拒否する
- 主要画面の遷移と保存が成立する

---

最終更新: 2026-01-29
