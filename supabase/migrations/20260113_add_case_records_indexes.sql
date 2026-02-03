-- Indexes to speed up case_records lookups by service and care receiver
CREATE INDEX IF NOT EXISTS case_records_service_care_created_idx
  ON public.case_records (service_id, care_receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS case_records_service_care_record_date_idx
  ON public.case_records (service_id, care_receiver_id, record_date);
