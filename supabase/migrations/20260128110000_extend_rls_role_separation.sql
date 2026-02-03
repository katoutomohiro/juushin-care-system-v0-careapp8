-- RLS ポリシー拡張: staff / nurse / admin ロール分離
-- Date: 2026-01-28
-- Purpose: 個人情報の権限別アクセス制御

-- ⚠️ 前提: service_staff テーブルが存在すること
--         (user_id, service_id, role: staff|nurse|admin)

-- 1. 既存の RLS ポリシーを全削除（必要に応じて）
DROP POLICY IF EXISTS "authenticated_can_view_care_receivers" ON public.care_receivers;
DROP POLICY IF EXISTS "authenticated_can_update_care_receivers" ON public.care_receivers;
DROP POLICY IF EXISTS "Staff can view" ON public.care_receivers;
DROP POLICY IF EXISTS "Staff can create" ON public.care_receivers;
DROP POLICY IF EXISTS "Staff can update" ON public.care_receivers;

-- 2. care_receivers テーブル: RLS ポリシー再構築

-- 2.1 anon ロール: 全て拒否
CREATE POLICY "anon_deny_all_care_receivers"
  ON public.care_receivers
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- 2.2 staff ロール: 同じサービスの利用者を閲覧のみ
CREATE POLICY "staff_select_care_receivers"
  ON public.care_receivers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_staff
      WHERE service_staff.user_id = auth.uid()
      AND service_staff.service_id = care_receivers.service_id
      AND service_staff.role = 'staff'
    )
  );

-- 2.3 nurse ロール: 同じサービスの利用者を閲覧・編集
CREATE POLICY "nurse_select_care_receivers"
  ON public.care_receivers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_staff
      WHERE service_staff.user_id = auth.uid()
      AND service_staff.service_id = care_receivers.service_id
      AND service_staff.role IN ('nurse', 'admin')
    )
  );

CREATE POLICY "nurse_update_care_receivers"
  ON public.care_receivers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_staff
      WHERE service_staff.user_id = auth.uid()
      AND service_staff.service_id = care_receivers.service_id
      AND service_staff.role IN ('nurse', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_staff
      WHERE service_staff.user_id = auth.uid()
      AND service_staff.service_id = care_receivers.service_id
      AND service_staff.role IN ('nurse', 'admin')
    )
  );

-- 2.4 admin ロール: 全アクション許可（同じサービス内）
CREATE POLICY "admin_all_care_receivers"
  ON public.care_receivers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_staff
      WHERE service_staff.user_id = auth.uid()
      AND service_staff.service_id = care_receivers.service_id
      AND service_staff.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_staff
      WHERE service_staff.user_id = auth.uid()
      AND service_staff.service_id = care_receivers.service_id
      AND service_staff.role = 'admin'
    )
  );

-- 3. care_receiver_audits テーブル: RLS ポリシー

-- 3.1 anon ロール: 全て拒否
CREATE POLICY "anon_deny_all_audits"
  ON public.care_receiver_audits
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- 3.2 staff ロール: アクセス不可（監査ログは看護師以上）
CREATE POLICY "staff_deny_audits"
  ON public.care_receiver_audits
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- 3.3 nurse/admin ロール: 同じサービスの監査ログを閲覧
CREATE POLICY "nurse_select_audits"
  ON public.care_receiver_audits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_staff ss
      JOIN public.care_receivers cr ON cr.id = care_receiver_audits.care_receiver_id
      WHERE ss.user_id = auth.uid()
      AND ss.service_id = cr.service_id
      AND ss.role IN ('nurse', 'admin')
    )
  );

-- 3.4 admin ロール: 監査ログ作成も許可（トリガーから呼び出される）
CREATE POLICY "admin_insert_audits"
  ON public.care_receiver_audits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_staff ss
      JOIN public.care_receivers cr ON cr.id = care_receiver_audits.care_receiver_id
      WHERE ss.user_id = auth.uid()
      AND ss.service_id = cr.service_id
      AND ss.role = 'admin'
    ) OR
    -- または、トリガーから actor が NULL の場合（service_role）
    actor IS NULL
  );

-- 4. トリガー改善: 監査ログ自動記録

CREATE OR REPLACE FUNCTION public.log_care_receiver_change()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_fields text[];
BEGIN
  -- UPDATE 時に変更されたフィールドを記録
  IF TG_OP = 'UPDATE' THEN
    -- 変更されたフィールド名を配列に格納
    IF OLD.display_name != NEW.display_name THEN v_changed_fields := array_append(v_changed_fields, 'display_name'); END IF;
    IF COALESCE(OLD.full_name, '') != COALESCE(NEW.full_name, '') THEN v_changed_fields := array_append(v_changed_fields, 'full_name'); END IF;
    IF COALESCE(OLD.birthday, '') != COALESCE(NEW.birthday, '') THEN v_changed_fields := array_append(v_changed_fields, 'birthday'); END IF;
    IF COALESCE(OLD.address, '') != COALESCE(NEW.address, '') THEN v_changed_fields := array_append(v_changed_fields, 'address'); END IF;
    IF COALESCE(OLD.phone, '') != COALESCE(NEW.phone, '') THEN v_changed_fields := array_append(v_changed_fields, 'phone'); END IF;
    IF COALESCE(OLD.emergency_contact, '') != COALESCE(NEW.emergency_contact, '') THEN v_changed_fields := array_append(v_changed_fields, 'emergency_contact'); END IF;
    IF OLD.medical_care_detail::text != NEW.medical_care_detail::text THEN v_changed_fields := array_append(v_changed_fields, 'medical_care_detail'); END IF;
    
    -- 監査ログを記録
    IF v_changed_fields IS NOT NULL AND array_length(v_changed_fields, 1) > 0 THEN
      INSERT INTO public.care_receiver_audits (
        care_receiver_id,
        action,
        changed_fields,
        actor
      ) VALUES (
        NEW.id,
        'update',
        to_jsonb(v_changed_fields),
        NEW.updated_by
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS trigger_log_care_receiver_change ON public.care_receivers;

-- 新しいトリガーを作成
CREATE TRIGGER trigger_log_care_receiver_change
  AFTER UPDATE ON public.care_receivers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_care_receiver_change();

-- 5. インデックス確認（既存の migration で作成済みのはずだが、念のため）
CREATE INDEX IF NOT EXISTS idx_service_staff_user_id 
  ON public.service_staff(user_id);

CREATE INDEX IF NOT EXISTS idx_service_staff_service_id 
  ON public.service_staff(service_id);

CREATE INDEX IF NOT EXISTS idx_service_staff_role 
  ON public.service_staff(role);
