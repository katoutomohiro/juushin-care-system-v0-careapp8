# PLAN: 個人情報編集・追加・保存機能の実装

## 📋 概要

**背景**:
- 現在、利用者名はプライバシー保護のため `display_name`（アルファベット表示: "A・T", "I・K" など）のみで表示
- ただし、実運用では「本名・住所・連絡先・医療情報の追加更新」が必頻繁に発生
- **要件**: アプリ内で個人情報を安全に編集・追加・保存できるようにしたい

**目的**:
- DB に `full_name`（本名）を含む個人情報カラムを追加
- 画面表示は引き続き `display_name` を基本に、詳細画面で `full_name` 等を閲覧・編集可能に
- Role（admin/nurse/staff/anon）に応じた表示・編集権限の分離
- 監査ログ機能の準備（誰がいつ変更したか記録）

---

## 🎯 実装フェーズ

### Phase 1: DB + API（必須）

#### 1.1 Supabase Migration: care_receivers テーブル拡張

```sql
-- 20260202_add_personal_info_columns.sql
ALTER TABLE care_receivers
ADD COLUMN IF NOT EXISTS full_name TEXT,         -- 本名（個人情報）
ADD COLUMN IF NOT EXISTS birthday DATE,          -- 生年月日
ADD COLUMN IF NOT EXISTS address TEXT,           -- 住所
ADD COLUMN IF NOT EXISTS phone TEXT,             -- 電話番号
ADD COLUMN IF NOT EXISTS emergency_contact TEXT, -- 緊急連絡先
ADD COLUMN IF NOT EXISTS notes TEXT,             -- 自由記述メモ
ADD COLUMN IF NOT EXISTS medical_care_detail JSONB, -- 医療的ケア詳細
ADD COLUMN IF NOT EXISTS updated_by UUID,       -- 編集者（RLS用）
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- インデックス作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_care_receivers_updated_at 
  ON care_receivers(updated_at DESC);
```

#### 1.2 RLS（行レベルセキュリティ）ポリシー

```sql
-- 20260203_add_personal_info_rls.sql

-- 基本: 全員が display_name を閲覧可能（既存ポリシー継続）
-- 新規: full_name 等は role に応じた閲覧制限

-- Policy 1: anon は display_name のみ読み取り可能
CREATE POLICY "anon_view_display_name" ON public.care_receivers
  FOR SELECT
  TO anon
  USING (true);
  -- SELECT では display_name のみ返す（VIEW か SELECT で列制限）

-- Policy 2: staff は display_name + medical_care_detail 読み取り可能、編集不可
CREATE POLICY "staff_view_care_details" ON public.care_receivers
  FOR SELECT
  TO staff
  USING (facility_id IN (
    SELECT facility_id FROM public.staff_profiles 
    WHERE id = auth.uid()
  ));

-- Policy 3: nurse/admin は全カラム読み取り可能、編集可能
CREATE POLICY "nurse_admin_edit_personal_info" ON public.care_receivers
  FOR UPDATE
  TO authenticated
  USING (
    -- UPDATE 前提条件: nurse または admin role
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('nurse', 'admin')
    AND facility_id IN (
      SELECT facility_id FROM public.staff_profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    -- UPDATE 後の値も同じ条件でチェック
    auth.jwt() -> 'user_metadata' ->> 'role' IN ('nurse', 'admin')
  );

-- Policy 4: 誰が編集したか記録（トリガー）
CREATE OR REPLACE FUNCTION update_care_receiver_audit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_by = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trig_care_receiver_audit
  BEFORE UPDATE ON care_receivers
  FOR EACH ROW
  EXECUTE FUNCTION update_care_receiver_audit();
```

#### 1.3 API エンドポイント

**既存**:
- `PATCH /api/care-receivers/[id]` で `display_name` 更新済み

**拡張**:
```typescript
// api/care-receivers/[id]/route.ts (PATCH)

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req); // auth check
  const { id } = await context.params;

  // role check: nurse/admin のみ全項目更新可
  if (!['nurse', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: personal info edit requires nurse/admin role' },
      { status: 403 }
    );
  }

  const body = await req.json();
  
  // Validate (Zod)
  const schema = z.object({
    display_name: z.string().optional(),
    full_name: z.string().optional(),
    birthday: z.string().date().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    emergency_contact: z.string().optional(),
    notes: z.string().optional(),
    medical_care_detail: z.record(z.any()).optional(),
  });

  const validated = schema.parse(body);

  // Supabase で更新（RLS が自動チェック）
  const { data, error } = await supabase
    .from('care_receivers')
    .update(validated)
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, careReceiver: data[0] });
}
```

---

### Phase 2: UI（アクセシビリティ）

#### 2.1 EditCareReceiverDialog コンポーネント拡張

```tsx
// components/edit-care-receiver-dialog.tsx

type Props = {
  careReceiver: CareReceiverData;
  userRole?: 'staff' | 'nurse' | 'admin' | 'anon';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditCareReceiverDialog({ 
  careReceiver, 
  userRole = 'staff',
  isOpen, 
  onClose, 
  onSuccess 
}: Props) {
  const [formData, setFormData] = useState({
    display_name: careReceiver.display_name || '',
    full_name: careReceiver.full_name || '',      // ← 新規
    birthday: careReceiver.birthday || '',         // ← 新規
    address: careReceiver.address || '',           // ← 新規
    phone: careReceiver.phone || '',               // ← 新規
    emergency_contact: careReceiver.emergency_contact || '', // ← 新規
    notes: careReceiver.notes || '',
    medical_care_detail: careReceiver.medical_care_detail || {},
  });

  // 権限に応じた表示制御
  const canEditPersonalInfo = ['nurse', 'admin'].includes(userRole);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>利用者情報を編集</DialogTitle>
        </DialogHeader>

        {/* 表示名（全員表示可） */}
        <div>
          <Label htmlFor="display_name">表示名（匿名表示用）</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="例: A・T, User-001"
          />
        </div>

        {/* 本名（nurse/admin のみ表示・編集） */}
        {canEditPersonalInfo && (
          <div>
            <Label htmlFor="full_name">本名</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="例: 山田 太郎"
              disabled={userRole === 'staff'} // staff は読み取り専用
            />
          </div>
        )}

        {/* 生年月日（nurse/admin のみ） */}
        {canEditPersonalInfo && (
          <div>
            <Label htmlFor="birthday">生年月日</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              disabled={userRole === 'staff'}
            />
          </div>
        )}

        {/* 住所（admin のみ） */}
        {userRole === 'admin' && (
          <div>
            <Label htmlFor="address">住所</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="東京都渋谷区..."
            />
          </div>
        )}

        {/* 電話・緊急連絡先（admin のみ） */}
        {userRole === 'admin' && (
          <>
            <div>
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact">緊急連絡先</Label>
              <Textarea
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              />
            </div>
          </>
        )}

        {/* メモ・医療情報は全員表示 */}
        <div>
          <Label htmlFor="notes">メモ</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* 保存ボタン */}
        <Button onClick={handleSubmit} disabled={!canEditPersonalInfo}>
          {canEditPersonalInfo ? '保存' : '表示のみ'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

#### 2.2 利用者詳細ページへのリンク

```tsx
// app/services/[serviceId]/users/[userId]/page.tsx

// 詳細情報編集ボタンを追加
<Button onClick={() => setIsEditDialogOpen(true)}>
  詳細情報を編集
</Button>
```

---

### Phase 3: テスト（検証）

#### 3.1 Unit テスト

```typescript
// tests/unit/personal-info-edit.spec.ts

describe('EditCareReceiverDialog', () => {
  it('anon/staff は full_name フィールドを見えない', () => {
    // render with userRole='staff'
    // expect full_name input to not be visible
  });

  it('nurse/admin は full_name を編集可能', () => {
    // render with userRole='admin'
    // expect full_name input to be enabled
    // expect handleSubmit to include full_name in request
  });

  it('admin のみ address/phone を編集可能', () => {
    // userRole='nurse' → address hidden
    // userRole='admin' → address visible & editable
  });
});
```

#### 3.2 E2E テスト（Playwright）

```typescript
// tests/e2e/personal-info-edit.spec.ts

test('admin が利用者の本名・住所を編集・保存できる', async ({ page }) => {
  // 1. admin でログイン
  await login(page, 'admin@example.com', 'password');

  // 2. 利用者詳細ページへ移動
  await page.goto('/services/life-care/users/AT');

  // 3. 「詳細情報を編集」ボタンをクリック
  await page.click('button:has-text("詳細情報を編集")');

  // 4. full_name を入力
  await page.fill('#full_name', '山田太郎');

  // 5. address を入力
  await page.fill('#address', '東京都渋谷区');

  // 6. 保存ボタンをクリック
  await page.click('button:has-text("保存")');

  // 7. 成功メッセージを確認
  await expect(page.getByText('保存しました')).toBeVisible();

  // 8. Supabase に実際に保存されたか確認
  // SELECT full_name, address FROM care_receivers WHERE id = '...'
});
```

---

## 📝 実装チェックリスト

### DB/API
- [ ] Supabase migration: care_receivers に full_name/birthday/address/phone/emergency_contact/notes/medical_care_detail を追加
- [ ] RLS ポリシー: role に応じた行フィルタリング + 列マスキング
- [ ] 監査トリガー: updated_by/updated_at を自動記録
- [ ] API エンドポイント: PATCH /api/care-receivers/[id] に個人情報を含める
- [ ] バリデーション: Zod で型チェック

### UI/UX
- [ ] EditCareReceiverDialog に new fields を追加
- [ ] 権限に応じた表示制御（role check）
- [ ] アクセシビリティ: `<label>` + `id` で a11y 対応
- [ ] エラーハンドリング: 403 Forbidden を画面に表示

### テスト
- [ ] Unit: form state management & role checks
- [ ] E2E: 実際の保存・リロード後の表示確認
- [ ] RLS: Supabase で role を切り替えて権限テスト

### セキュリティ
- [ ] 個人情報をログに出力しない（log sanitization）
- [ ] RLS を信頼し、API では role check のみ実施
- [ ] Supabase JWT の role claim を信頼

---

## 🚀 次のブランチでの作業フロー

```bash
# 1. 新しいブランチを作成
git checkout -b feat/personal-info-edit

# 2. Phase 1: DB/API を実装
# - migration ファイル作成
# - RLS ポリシー設定
# - API route 実装
# - lint/build テスト

# 3. Phase 2: UI を実装
# - EditCareReceiverDialog を拡張
# - role check を追加
# - lint/build テスト

# 4. Phase 3: テスト
# - Unit + E2E テスト
# - ローカル検証

# 5. PR 作成 & マージ
git push origin feat/personal-info-edit
gh pr create --title "feat: personal info editing with role-based access"
```

---

## 📊 優先度・難易度

| タスク | 優先度 | 難易度 | 見積時間 |
| --- | --- | --- | --- |
| Migration + RLS | 🔴 必須 | ⭐⭐⭐ | 2-3h |
| API 拡張 | 🔴 必須 | ⭐⭐ | 1-2h |
| UI 拡張 | 🟠 高 | ⭐⭐ | 1-2h |
| テスト | 🟠 高 | ⭐⭐⭐ | 2-3h |
| **合計** | - | - | **6-10h** |

---

## 📌 依存関係

- Supabase RLS ポリシーが正しく機能していること
- staff_profiles に role 情報が正しく設定されていること
- 既存の care-receivers CRUD API が正常に動作していること

---

**最終更新**: 2026-01-29
**作成者**: GitHub Copilot
