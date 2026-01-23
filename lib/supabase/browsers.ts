"use client";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (typeof window !== "undefined") {
  console.log("[Supabase Init] URL:", url ? `${url.slice(0, 30)}...` : "EMPTY");
  console.log("[Supabase Init] Key:", key ? `${key.slice(0, 20)}...` : "EMPTY");
}

if (!url || !key) {
  const errorMsg = `[Supabase] 環境変数が未設定: URL=${!url}, KEY=${!key}`;
  if (typeof window !== "undefined") {
    console.error(errorMsg);
  }
  throw new Error(errorMsg);
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true },
});

if (typeof window !== "undefined") {
  console.log("[Supabase Init] Client created successfully");
}