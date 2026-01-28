-- Add personal information columns to care_receivers
-- ⚠️ 重要: 個人情報はログに出力禁止、開発環境では匿名データのみ使用
-- RLS で職員のみアクセス可能にする

-- 1. display_name を復活（UI表示用、匿名表示に使える）
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '';

-- 2. 個人情報カラムを追加
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS full_name text,              -- 実名（RLS で職員のみ、ログ出力禁止）
ADD COLUMN IF NOT EXISTS birthday date,               -- 生年月日
ADD COLUMN IF NOT EXISTS address text,                -- 住所（RLS で職員のみ）
ADD COLUMN IF NOT EXISTS phone text,                  -- 電話番号（RLS で職員のみ）
ADD COLUMN IF NOT EXISTS emergency_contact text,      -- 緊急連絡先（RLS で職員のみ）
ADD COLUMN IF NOT EXISTS notes text,                  -- 自由記述メモ
ADD COLUMN IF NOT EXISTS medical_care_detail jsonb;   -- 医療的ケア詳細（経管/吸引/発作対応など）

-- 3. version カラムを追加（楽観ロック用）
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1;

-- 4. updated_by カラムを追加（編集者記録用）
ALTER TABLE IF EXISTS public.care_receivers
ADD COLUMN IF NOT EXISTS updated_by uuid;

-- 5. version 自動インクリメント用トリガー作成
CREATE OR REPLACE FUNCTION public.increment_care_receiver_version()
RETURNS TRIGGER AS $$
BEGIN
  -- UPDATE 時に version を自動的に +1
  IF TG_OP = 'UPDATE' THEN
    NEW.version = OLD.version + 1;
    NEW.updated_at = now();
    NEW.updated_by = auth.uid();  -- 現在のログインユーザー
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存のトリガーを削除して新しいトリガーを作成
DROP TRIGGER IF EXISTS trigger_increment_care_receiver_version ON public.care_receivers;

CREATE TRIGGER trigger_increment_care_receiver_version
  BEFORE UPDATE ON public.care_receivers
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_care_receiver_version();

-- 6. インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_care_receivers_version 
  ON public.care_receivers(version);

CREATE INDEX IF NOT EXISTS idx_care_receivers_updated_by 
  ON public.care_receivers(updated_by);

-- 7. 監査ログテーブル作成（care_receiver_audits）
CREATE TABLE IF NOT EXISTS public.care_receiver_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_receiver_id uuid NOT NULL REFERENCES public.care_receivers(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changed_fields jsonb,  -- 変更されたフィールド名のみ（値は最小限、個人情報は含めない）
  actor uuid,            -- 編集者（auth.uid）
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. 監査ログのインデックス
CREATE INDEX IF NOT EXISTS idx_care_receiver_audits_care_receiver_id 
  ON public.care_receiver_audits(care_receiver_id);

CREATE INDEX IF NOT EXISTS idx_care_receiver_audits_actor 
  ON public.care_receiver_audits(actor);

CREATE INDEX IF NOT EXISTS idx_care_receiver_audits_created_at 
  ON public.care_receiver_audits(created_at DESC);

-- 9. RLS 有効化（すでに有効の場合はスキップ）
ALTER TABLE public.care_receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_receiver_audits ENABLE ROW LEVEL SECURITY;

-- 10. RLS ポリシー: care_receivers（職員のみアクセス可能）
-- 既存ポリシーを削除
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.care_receivers;
DROP POLICY IF EXISTS "Allow write for authenticated users" ON public.care_receivers;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.care_receivers;

-- 新ポリシー: 認証済みユーザー（職員）のみ SELECT 可能
CREATE POLICY "Staff can view care receivers"
  ON public.care_receivers
  FOR SELECT
  TO authenticated
  USING (true);

-- 新ポリシー: 認証済みユーザー（職員）のみ INSERT 可能
CREATE POLICY "Staff can create care receivers"
  ON public.care_receivers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 新ポリシー: 認証済みユーザー（職員）のみ UPDATE 可能
CREATE POLICY "Staff can update care receivers"
  ON public.care_receivers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 新ポリシー: 認証済みユーザー（職員）のみ DELETE 可能（論理削除推奨）
CREATE POLICY "Staff can delete care receivers"
  ON public.care_receivers
  FOR DELETE
  TO authenticated
  USING (true);

-- 11. RLS ポリシー: care_receiver_audits（職員のみ SELECT/INSERT 可能）
CREATE POLICY "Staff can view audit logs"
  ON public.care_receiver_audits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create audit logs"
  ON public.care_receiver_audits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 12. 監査ログ自動記録用トリガー（UPDATE 時のみ）
CREATE OR REPLACE FUNCTION public.log_care_receiver_update()
RETURNS TRIGGER AS $$
DECLARE
  changed_keys text[];
BEGIN
  -- UPDATE 時のみ監査ログを記録
  IF TG_OP = 'UPDATE' THEN
    -- 変更されたカラム名を抽出（値は含めず、キー名のみ）
    changed_keys := ARRAY(
      SELECT key FROM jsonb_each(to_jsonb(NEW))
      WHERE to_jsonb(NEW)->key IS DISTINCT FROM to_jsonb(OLD)->key
    );

    -- 監査ログに挿入
    INSERT INTO public.care_receiver_audits (
      care_receiver_id,
      action,
      changed_fields,
      actor
    ) VALUES (
      NEW.id,
      'update',
      jsonb_build_object('changed_keys', changed_keys),  -- キー名のみ記録
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_care_receiver_update ON public.care_receivers;

CREATE TRIGGER trigger_log_care_receiver_update
  AFTER UPDATE ON public.care_receivers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_care_receiver_update();

-- 13. コメント追加（スキーマドキュメント）
COMMENT ON COLUMN public.care_receivers.display_name IS 'UI表示名（匿名表示可能、例: AT, User-001）';
COMMENT ON COLUMN public.care_receivers.full_name IS '実名（個人情報、ログ出力禁止、RLSで職員のみ）';
COMMENT ON COLUMN public.care_receivers.birthday IS '生年月日（個人情報）';
COMMENT ON COLUMN public.care_receivers.address IS '住所（個人情報、RLSで職員のみ）';
COMMENT ON COLUMN public.care_receivers.phone IS '電話番号（個人情報、RLSで職員のみ）';
COMMENT ON COLUMN public.care_receivers.emergency_contact IS '緊急連絡先（個人情報、RLSで職員のみ）';
COMMENT ON COLUMN public.care_receivers.medical_care_detail IS '医療的ケア詳細（JSONB: 経管栄養、吸引、発作対応など）';
COMMENT ON COLUMN public.care_receivers.version IS '楽観ロック用バージョン（更新ごとに自動インクリメント）';
COMMENT ON COLUMN public.care_receivers.updated_by IS '最終更新者（auth.uid）';

COMMENT ON TABLE public.care_receiver_audits IS '利用者情報変更の監査ログ（個人情報の値は含まず、変更されたキー名のみ記録）';
