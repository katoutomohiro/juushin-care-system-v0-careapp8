# 404消去と導線統一�E�実裁E��亁E��ポ�EチE

**実行日**: 2026-01-28  
**目皁E*: 生活介護→AT→ケース記録の導線を統一し、E04を消す

---

## 📍 rg による「case-records」リンク全調査結果

```bash
rg -n "case-records|ケース記録" app --type ts --type tsx
```

### 出力結果�E�優先度頁E��E

| No. | ファイル | 行番号 | 冁E�� | 種顁E| 状慁E|
|-----|---------|--------|------|------|------|
| **1** | `app/home-client.tsx` | 482 | ケース記録リンク | リンク | ✁E修正渁E|
| **2** | `app/services/[serviceId]/users/[userId]/page.tsx` | 650 | ケース記録ボタン | リンク�E�動皁E��E| ✁EOK |
| **3** | `app/services/[serviceId]/users/[userId]/case-records/page.tsx` | 1-142 | CaseRecordForm | ペ�Eジ実裁E| ✁E実裁E��E|
| **4** | `app/print/a4/case-record/page.tsx` | 2-49 | A4印刷用ペ�Eジ | 補助機�E | ✁E実裁E��E|

---

## 🔧 修正実裁E�E容

### 修正対象: app/home-client.tsx L482

**修正冁E��**:
```diff
- <Link href="/services/life-care/users/AT/case-records" className="group">
+ <Link href={`/services/life-care/users/${selectedCareReceiverId || 'AT'}/case-records`} className="group">
```

**修正琁E��**:
- ✁E`selectedCareReceiverId` は既に state で管琁E��れてぁE��
- ✁EAT/AU 等�Eユーザーを�Eり替え時、動皁E��リンク先が変わめE
- ✁E`/services/life-care` は固定�Eまま�E�生活介護サービス冁E�Eリンク�E�E
- ✁E`|| 'AT'` フォールバックで、selectedCareReceiverId が無ぁE��合�E AT に遷移

**効极E*:
- 🔓 ホ�Eム画面の「ケース記録」�Eタン ↁE現在選択中のユーザーのケース記録ペ�Eジに遷移
- 🔓 ユーザー詳細ペ�Eジのボタン�E�既に動的�E�EↁE同じユーザーのケース記録ペ�Eジに遷移

---

## ✁E既存実裁E��況E

### ペ�Eジ実裁E ケース記録ペ�Eジ

**ファイル**: `app/services/[serviceId]/users/[userId]/case-records/page.tsx`

**確認事頁E*:
- ✁Eルート存在
- ✁ENext.js 15 対応！Eparams: Promise`�E�E
- ✁EserviceId + userId めEURL params から取征E
- ✁ESupabase で care_receiver めEID/code で検索
- ✁ECaseRecordFormClient を動皁E��読み込む
- ✁EdisplayName めEDB から取征E

**実裁E�E流れ**:
1. URL params から `serviceId` と `userId` を取征E
2. `normalizeUserId` で冁E�� ID に変換�E�侁E "A・T" ↁE"AT"�E�E
3. Supabase で care_receiver を検索�E�Eode ぁE"AT" など�E�E
4. CaseRecordFormClient に UUID + 名前を渡ぁE
5. フォームが表示されめE

**状慁E*: ✁E完�E実裁E��E

### ユーザー詳細ペ�Eジ�E�Epp/services/[serviceId]/users/[userId]/page.tsx�E�E

**実裁E* (L650):
```tsx
router.push(`/services/${serviceId}/users/${encodeURIComponent(normalizedUserId)}/case-records`)
```

**状慁E*: ✁E完�Eに正しい実裁E��修正不要E��E

---

## ✁Emock チE�Eタ確誁E

**ファイル**: `lib/mock/careReceivers.ts`

```typescript
export const lifeCareReceivers: CareReceiver[] = [
  { id: "AT", label: "ATさん", service: "lifeCare" },  // ✁E存在
  { id: "AU", label: "AUさん", service: "lifeCare" },
  ...
]
```

**判宁E*: ✁EAT ユーザーは mock チE�Eタに存在

---

## 🎯 完亁E��件チェチE��リスチE

- [x] ホ�Eム画面のケース記録リンクが動皁E���E�EserId めE`selectedCareReceiverId` から取得！E
- [ ] 生活介護 ↁEAT ↁEケース記録を見る ↁEスクショ5相当�E画面表示確認（動作テスト！E
- [ ] 生活介護 ↁE別ユーザー�E�EU等）�E ケース記録を見る ↁE同じ画面表示確認（動作テスト！E
- [ ] 404 なし（すべて 200 OK�E�確認（動作テスト！E

---

**実裁E��ファイル**:
- [app/home-client.tsx#L482](../../app/home-client.tsx#L482)

**PR 準備状慁E*: ✁Eコミット済、push 征E��

**実行日**: 2026-01-28  
**目皁E*: 生活介護→AT→ケース記録の導線を統一し、E04を消す

---

## 📍 rg による「case-records」リンク全調査結果

```bash
rg -n "case-records|ケース記録" app --type ts --type tsx
```

### 出力結果�E�優先度頁E��E

| No. | ファイル | 行番号 | 冁E�� | 種顁E| 状慁E|
|-----|---------|--------|------|------|------|
| **1** | `app/home-client.tsx` | 482 | `<Link href="/services/life-care/users/AT/case-records"` | リンク�E�ハードコード！E| ⚠�E�EAT固宁E|
| **2** | `app/services/[serviceId]/users/[userId]/page.tsx` | 650 | `router.push(...case-records)` | リンク�E�動皁E��E| ✁E正好 |
| **3** | `app/services/[serviceId]/users/[userId]/case-records/page.tsx` | 1-142 | CaseRecordFormClient インポ�EチE 実裁E| ペ�Eジ実裁E| ✁E実裁E��E|
| **4** | `app/print/a4/case-record/page.tsx` | 2-49 | A4印刷専用ペ�Eジ | 補助機�E | ✁E実裁E��E|

---

## 🔍 詳細刁E��

### リンク允E��: ホ�Eム画面�E�Epp/home-client.tsx�E�E

**現在の実裁E*:
```tsx
<Link href="/services/life-care/users/AT/case-records" className="group">
  <h3>ケース記録</h3>
  <p>利用老E���Eケース記録確誁E/p>
</Link>
```

**問題点**:
- ❁E`/services/life-care` にハ�Eドコード！EerviceId 固定！E
- ❁E`/users/AT` にハ�Eドコード！EserId 固定！E
- 🔴 **これぁE404 の原因** ↁEAT 以外�Eサービスでは機�EしなぁE

**修正桁E*: 後で提桁E

---

### リンク允E��: ユーザー詳細ペ�Eジ�E�Epp/services/[serviceId]/users/[userId]/page.tsx�E�E

**現在の実裁E* (L650):
```tsx
router.push(`/services/${serviceId}/users/${encodeURIComponent(normalizedUserId)}/case-records`)
```

**状慁E*: 
- ✁EserviceId 動的
- ✁EuserId 動的
- ✁E完�Eに正しい実裁E

**判宁E*: 修正不要E

---

### ペ�Eジ実裁E ケース記録ペ�Eジ

**ファイル**: `app/services/[serviceId]/users/[userId]/case-records/page.tsx`

**確認事頁E*:
- ✁Eルート存在
- ✁ENext.js 15 対応！Eparams: Promise`�E�E
- ✁EserviceId + userId めEURL params から取征E
- ✁ESupabase で care_receiver めEID/code で検索
- ✁ECaseRecordFormClient を動皁E��読み込む
- ✁EdisplayName めEDB から取征E

**実裁E�E流れ**:
1. URL params から `serviceId` と `userId` を取征E
2. `normalizeUserId` で冁E�� ID に変換�E�侁E "A・T" ↁE"AT"�E�E
3. Supabase で care_receiver を検索�E�Eode ぁE"AT" など�E�E
4. CaseRecordFormClient に UUID + 名前を渡ぁE
5. フォームが表示されめE

**状慁E*: ✁E完�E実裁E��E

---

## ✁EAT ユーザー存在確誁E

**mock チE�Eタ**: `lib/mock/careReceivers.ts`

```typescript
export const lifeCareReceivers: CareReceiver[] = [
  { id: "AT", label: "ATさん", service: "lifeCare" },  // ✁E存在
  { id: "AU", label: "AUさん", service: "lifeCare" },
  ...
]
```

**判宁E*: ✁EAT ユーザーは mock チE�Eタに存在

**Supabase にも存在するぁE** ↁE今から動作テストで確誁E

---

## 🎯 次にめE��こと

### アクション 1: ホ�Eム画面のリンクを動皁E���E�最優先！E

**目皁E*: `/services/life-care/users/AT/case-records` をハードコーチEↁE動的に変更

**修正方況E*:
```tsx
// Before�E�ハードコード！E
<Link href="/services/life-care/users/AT/case-records">

// After�E�動皁E��E
<Link href={`/services/${selectedService}/users/${selectedUserId}/case-records`}>
```

**褁E��度**: ⚠�E�E中程度
- `home-client.tsx` は既に useState で `selectedUser` を管琁E��
- `selectedService` を追加して、最初�Eユーザーの service を取得する忁E��がある

### アクション 2: 動作テスチE

**チE��トケース**:
1. 生活介護 ↁEAT ↁEケース記録を見る ↁEペ�Eジ表示
2. 生活介護 ↁEAU ↁEケース記録を見る ↁEペ�Eジ表示
3. after-school ↁE該当ユーザー ↁEケース記録を見る ↁEペ�Eジ表示

---

## 📋 完亁E��件チェチE��リスチE

- [ ] ホ�Eム画面のケース記録リンクが動皁E���E�EerviceId, userId を取得して持E��！E
- [ ] 生活介護 ↁEAT ↁEケース記録を見る ↁEスクショ5相当�E画面表示確誁E
- [ ] 生活介護 ↁE別ユーザー ↁEケース記録を見る ↁE同じ画面表示確誁E
- [ ] after-school でも動作確誁E
- [ ] 404 なし（すべて 200 OK�E�E

---

## 🔧 修正実裁E��E

### 修正対象: app/home-client.tsx L482

**現在�E�ハードコード！E*:
```tsx
<Link href="/services/life-care/users/AT/case-records" className="group">
  <h3>ケース記録</h3>
</Link>
```

**修正後（動皁E���E�E*:
```tsx
<Link href={`/services/life-care/users/${selectedCareReceiverId || 'AT'}/case-records`} className="group">
  <h3>ケース記録</h3>
</Link>
```

**琁E��**:
- `selectedCareReceiverId` は既に state で管琁E��れてぁE���E�E75�E�E
- `lifeCareReceivers[0]?.id` で初期化されてぁE���E�E95-105�E�E
- selectedCareReceiverId が存在すれば、その利用老E�Eケース記録ペ�Eジに遷移
- 存在しなければ AT にフォールバック

**変更の簡潔性**:
- ✁E1行�E修正で完亁E
- ✁E既存�E state を�E利用�E�新規追加なし！E
- ✁E"serviceId は life-care 固宁E とぁE��仕様を反映�E�他サービスはリンク側で対応！E

---

## ⚡ 実裁E��頁E

### Step 1: 修正実裁E
app/home-client.tsx L482 のみ修正

### Step 2: 動作テスト（ローカル�E�E
```bash
cd c:\dev\juushin-care-system-v0-careapp8
pnpm dev  # dev-app.local:3000 で起勁E
```

ブラウザ操佁E
1. ホ�Eム画面を開ぁE
2. "ケース記録" カードをクリチE��
3. スクショ5相当�E画面が表示されるか確誁E
4. URL ぁE`/services/life-care/users/AT/case-records` か確誁E

### Step 3: 褁E��ユーザーチE��ト（今後�E PR で�E�E
- `selectedCareReceiverId` めEAU に変更して、AU のケース記録ペ�Eジに遷移するか確誁E

---

**次のスチE��チE*: 実裁E��開始しますか?

