import "server-only";
import { createClient } from "@supabase/supabase-js";

// anon key を用いたサーバーサイド読み取り (service role は使用しない)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function SeizuresListPage() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <div className="mx-auto max-w-3xl p-6 space-y-4">
        <h1 className="text-xl font-bold">発作記録（直近20件）</h1>
        <p className="text-sm text-red-500">環境変数が未設定です (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)</p>
      </div>
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data: seizures, error } = await supabase
    .from("seizures")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-xl font-bold">発作記録（直近20件）</h1>
      {error ? (
        <p className="text-sm text-red-500">読み込みエラー: {error.message}</p>
      ) : !seizures || seizures.length === 0 ? (
        <p className="text-sm text-gray-500">まだ発作記録はありません。</p>
      ) : (
        <pre className="mt-4 text-xs whitespace-pre-wrap">{JSON.stringify(seizures, null, 2)}</pre>
      )}
    </div>
  );
}
