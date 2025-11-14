"use client";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!url || !key) {
  if (typeof window !== "undefined") {
    console.warn("[Supabase] NEXT_PUBLIC_SUPABASE_URL / ANON_KEY が未設定です。");
  }
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true },
});