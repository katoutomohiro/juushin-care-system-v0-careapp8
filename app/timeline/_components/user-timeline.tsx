import "server-only";
import { createClient } from "@supabase/supabase-js";

type SeizureTimelineEntry = {
  episode_at: string;
  type: string | null;
  duration_seconds: number | null;
};

const SAMPLE_EVENTS: { time: string; text: string }[] = [
  { time: "09:30", text: "送迎車で登所（生活介護）" },
  { time: "12:00", text: "経管栄養注入（サンプル）" },
  { time: "16:30", text: "送迎車で帰宅" },
  { time: "20:00", text: "グループホーム：就寝前の様子（サンプル）" },
];

interface UserTimelineProps {
  /**
   * UUID文字列。指定があればその利用者に絞る、なければ全体。
   * 前提: /services/[serviceId]/users/[userId] の [userId] が
   * public.seizures.user_id と一致する設計（現時点で一致していなくても、DB側を揃えれば動く）
   */
  userId?: string;
  /** h1 またはセクションタイトルとして表示するテキスト */
  heading?: string;
  /** /timeline では true、/services/... では false */
  showUserSelector?: boolean;
  /** /timeline の「?user=...」を渡すための補助用 */
  searchParamsUser?: string;
}

export async function UserTimeline({
  userId,
  heading = "利用者タイムライン",
  showUserSelector = false,
  searchParamsUser = "",
}: UserTimelineProps) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  let seizureEntries: SeizureTimelineEntry[] = [];
  let seizureError: string | null = null;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });

      let query = supabase
        .from("seizures")
        .select("episode_at, type, duration_seconds")
        .order("episode_at", { ascending: false })
        .limit(3);

      // userId が指定されている場合は、その利用者に絞る
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[UserTimeline] Supabase seizure fetch error:", error);
        seizureError = error.message;
      } else {
        seizureEntries = (data || []) as SeizureTimelineEntry[];
      }
    } catch (err) {
      console.error("[UserTimeline] Unexpected error fetching seizures:", err);
      seizureError = String(err);
    }
  }

  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  const emptyMessage = userId
    ? "この利用者の最近の発作記録はありません（サンプル表示のみ）"
    : "最近の発作記録はありません（サンプル表示のみ）";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <p className="text-xs text-gray-600">
          ※まだダミー画面です。将来、生活介護・放デイ・グループホーム・重度訪問介護などの記録を時間順に並べて表示する予定です。
        </p>
      </header>

      {/* 利用者選択セクション（ダミー） - showUserSelector が true の場合のみ表示 */}
      {showUserSelector && (
        <section className="rounded-lg border bg-white p-4 shadow-sm space-y-2">
          <h2 className="text-sm font-semibold">利用者選択（ダミー）</h2>
          <p className="text-xs text-gray-600">
            ※まだダミーです。将来、生活介護・放デイ・グループホーム・重度訪問介護の利用者ごとに絞り込める予定です。
          </p>
          <form method="get" className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="user-select" className="block text-xs font-medium text-gray-700 mb-1">
                利用者を選択
              </label>
              <select
                id="user-select"
                name="user"
                defaultValue={searchParamsUser}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm p-2 border"
              >
                <option value="">全利用者（ダミー）</option>
                <option value="user-a">利用者A（ダミー）</option>
                <option value="user-b">利用者B（ダミー）</option>
                <option value="user-c">利用者C（ダミー）</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              表示
            </button>
          </form>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">今日のサンプルタイムライン</h2>
        <ul className="space-y-2">
          {seizureError ? (
            <li className="flex items-start gap-4 rounded border bg-yellow-50 p-3 shadow-sm">
              <span className="text-sm text-yellow-800">
                ⚠️ 発作データの取得に失敗したため、サンプルのみ表示しています。
              </span>
            </li>
          ) : seizureEntries.length === 0 ? (
            <li className="flex items-start gap-4 rounded border bg-gray-50 p-3 shadow-sm">
              <span className="text-sm text-gray-600">{emptyMessage}</span>
            </li>
          ) : (
            seizureEntries.map((s, idx) => (
              <li key={`seizure-${idx}`} className="flex items-start gap-4 rounded border bg-rose-50 p-3 shadow-sm">
                <span className="font-mono text-xs text-rose-600 w-14 flex-shrink-0 pt-0.5">
                  {formatTime(s.episode_at)}
                </span>
                <span className="text-sm text-rose-900">
                  発作: {s.type || "不明"}
                  {s.duration_seconds != null ? ` (${s.duration_seconds}秒)` : ""}
                </span>
              </li>
            ))
          )}

          {SAMPLE_EVENTS.map((e) => (
            <li key={e.time} className="flex items-start gap-4 rounded border bg-white p-3 shadow-sm">
              <span className="font-mono text-xs text-gray-500 w-14 flex-shrink-0 pt-0.5">{e.time}</span>
              <span className="text-sm text-gray-800">{e.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
