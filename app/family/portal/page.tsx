import "server-only";
import { createClient } from "@supabase/supabase-js";

export default async function FamilyPortalPage() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  let todaySeizureCount = 0;
  let seizureError: string | null = null;
  let nightSeizureCount = 0;
  let nightError: string | null = null;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });

      // 今日の0:00〜23:59:59（日本時間）を計算
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // 昨夜〜今朝（前日21時〜当日9時）の期間を計算
      const nightEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 59, 59);
      const nightStart = new Date(nightEnd);
      nightStart.setDate(nightEnd.getDate() - 1);
      nightStart.setHours(21, 0, 0, 0);

      // 今日の発作件数を取得
      const { error: todayError, count: todayCount } = await supabase
        .from("seizures")
        .select("*", { count: "exact", head: true })
        .gte("episode_at", startOfDay.toISOString())
        .lte("episode_at", endOfDay.toISOString());

      if (todayError) {
        console.error("[FamilyPortal] Supabase seizure count error:", todayError);
        seizureError = todayError.message;
      } else {
        todaySeizureCount = todayCount || 0;
      }

      // 夜間の発作件数を取得
      const { error: nightQueryError, count: nightCount } = await supabase
        .from("seizures")
        .select("*", { count: "exact", head: true })
        .gte("episode_at", nightStart.toISOString())
        .lte("episode_at", nightEnd.toISOString());

      if (nightQueryError) {
        console.error("[FamilyPortal] Night seizure count error:", nightQueryError);
        nightError = nightQueryError.message;
      } else {
        nightSeizureCount = nightCount || 0;
      }
    } catch (err) {
      console.error("[FamilyPortal] Unexpected error fetching seizure counts:", err);
      seizureError = String(err);
      nightError = String(err);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">家族連携・デジタル連絡帳（構想中）</h1>
        <p className="text-xs text-gray-600">
          ※まだダミー画面です。将来、生活介護・放デイ・グループホーム・重度訪問介護の情報をまとめて家族へ共有する予定です。
        </p>
      </header>

      {/* 今日の発作サマリーカード */}
      <section className="rounded-lg border bg-white p-4 shadow-sm space-y-2">
        <h2 className="text-base font-semibold flex items-center gap-2">📊 今日の発作サマリー</h2>
        {seizureError ? (
          <p className="text-sm text-gray-700">発作サマリーを取得できませんでした（サンプル表示のみ）</p>
        ) : todaySeizureCount === 0 ? (
          <p className="text-sm text-gray-700">本日の発作記録はありません</p>
        ) : (
          <p className="text-sm text-gray-700">本日の発作：{todaySeizureCount}件</p>
        )}
      </section>

      {/* 昨夜〜今朝の発作サマリーカード */}
      <section className="rounded-lg border bg-white p-4 shadow-sm space-y-2">
        <h2 className="text-base font-semibold flex items-center gap-2">🌙 昨夜〜今朝の発作サマリー</h2>
        <p className="text-xs text-gray-500">
          前日21時〜当日9時までのあいだに記録された発作の件数を表示します（β版）。
        </p>
        {nightError ? (
          <p className="text-sm text-gray-700">夜間の発作サマリーを取得できませんでした（サンプル表示のみ）</p>
        ) : nightSeizureCount === 0 ? (
          <p className="text-sm text-gray-700">昨夜〜今朝の発作記録はありません</p>
        ) : (
          <p className="text-sm text-gray-700">昨夜〜今朝の発作：{nightSeizureCount}件</p>
        )}
      </section>

      <div className="space-y-4">
        <section className="rounded-lg border bg-white p-4 shadow-sm space-y-2">
          <h2 className="font-semibold flex items-center gap-2">🏠 日中の様子（生活介護・放デイ）</h2>
          <p className="text-sm text-gray-700">
            ここに、日中の活動・バイタル・発作・医療的ケアなどの記録を、家族向けに分かりやすく表示する予定です。
          </p>
        </section>
        <section className="rounded-lg border bg-white p-4 shadow-sm space-y-2">
          <h2 className="font-semibold flex items-center gap-2">🌙 夜間・在宅の様子（グループホーム・重度訪問介護）</h2>
          <p className="text-sm text-gray-700">
            ここに、グループホームや重度訪問介護の夜間の様子、自宅での体調などを共有する予定です。
          </p>
        </section>
        <section className="rounded-lg border bg-white p-4 shadow-sm space-y-2">
          <h2 className="font-semibold flex items-center gap-2">💬 保護者メッセージ／デジタル連絡帳</h2>
          <p className="text-sm text-gray-700">
            ここに、紙の連絡帳の代わりとなるメッセージ機能、既読管理、簡単なスタンプやコメントなどを実装していく予定です。
          </p>
        </section>
      </div>
    </div>
  );
}
