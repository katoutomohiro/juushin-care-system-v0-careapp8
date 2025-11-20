import "server-only";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

interface UserDailyLogTimelineProps {
  userId?: string;
  heading?: string;
  date?: string; // YYYY-MM-DD など
  showUserSelector?: boolean;
  searchParamsUser?: string;
}

export async function UserDailyLogTimeline({
  userId,
  heading = "日誌タイムライン",
  showUserSelector = false,
  searchParamsUser,
}: UserDailyLogTimelineProps) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // 複数ログソースから統合
  const logEvents: Array<{
    id: string;
    timestamp: string;
    category: string;
    icon: string;
    description: string;
    color: string;
  }> = [];

  let errorMessage: string | null = null;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });

      // 発作ログ取得
      let seizureQuery = supabase
        .from("seizure_logs")
        .select("id, recorded_at, seizure_type, duration_seconds, note")
        .order("recorded_at", { ascending: false })
        .limit(5);

      if (userId) {
        seizureQuery = seizureQuery.eq("user_id", userId);
      }

      const { data: seizures, error: seizureError } = await seizureQuery;

      if (!seizureError && seizures) {
        seizures.forEach((s: any) => {
          logEvents.push({
            id: `seizure-${s.id}`,
            timestamp: s.recorded_at,
            category: "発作記録",
            icon: "⚡",
            description: `${s.seizure_type}（${s.duration_seconds || "不明"}秒）${s.note ? ` - ${s.note}` : ""}`,
            color: "bg-red-50 border-red-200",
          });
        });
      }

      // 表情・反応ログ取得
      let expressionQuery = supabase
        .from("expression_logs")
        .select("id, recorded_at, expression_type, note")
        .order("recorded_at", { ascending: false })
        .limit(5);

      if (userId) {
        expressionQuery = expressionQuery.eq("user_id", userId);
      }

      const { data: expressions, error: expressionError } = await expressionQuery;

      if (!expressionError && expressions) {
        expressions.forEach((e: any) => {
          logEvents.push({
            id: `expression-${e.id}`,
            timestamp: e.recorded_at,
            category: "表情・反応",
            icon: "😊",
            description: `${e.expression_type}${e.note ? ` - ${e.note}` : ""}`,
            color: "bg-amber-50 border-amber-200",
          });
        });
      }
    } catch (err) {
      console.error("[UserDailyLogTimeline] Error fetching logs:", err);
      errorMessage = String(err);
    }
  }

  // タイムスタンプ順にソート
  logEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 直近10件に制限
  const displayEvents = logEvents.slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <header className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <Link
          href="/daily-log"
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
        >
          ← 日誌トップへ
        </Link>
      </header>

      {showUserSelector && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <form method="GET" className="flex items-center gap-4">
            <label htmlFor="user-select" className="text-sm font-medium">
              利用者で絞り込み:
            </label>
            <select
              id="user-select"
              name="user"
              defaultValue={searchParamsUser || ""}
              className="rounded border px-3 py-2 text-sm"
              onChange={(e) => {
                const form = e.currentTarget.form;
                if (form) form.submit();
              }}
            >
              <option value="">全利用者</option>
              <option value="user-a">利用者A（ダミー）</option>
              <option value="user-b">利用者B（ダミー）</option>
              <option value="user-c">利用者C（ダミー）</option>
            </select>
            <p className="text-xs text-gray-500">
              ※将来的に実際のUUIDで絞り込み可能になります
            </p>
          </form>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          日誌記録の取得中にエラーが発生しました: {errorMessage}
        </div>
      )}

      {displayEvents.length === 0 && !errorMessage && (
        <div className="rounded-lg border bg-gray-50 p-8 text-center">
          <p className="text-gray-600">
            {userId
              ? "この利用者の日誌記録はまだありません"
              : "日誌記録がまだありません"}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            発作記録・表情記録などを入力すると、ここに時系列で表示されます。
          </p>
        </div>
      )}

      {displayEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">直近の記録（{displayEvents.length}件）</h2>
          {displayEvents.map((event) => (
            <div
              key={event.id}
              className={`rounded-lg border p-4 shadow-sm ${event.color}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{event.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{event.category}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString("ja-JP")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold">💡 タイムライン機能について</p>
        <p className="mt-1">
          発作記録・表情記録などの日誌イベントを時系列で表示しています。
          将来的には、バイタル・排泄・活動など全カテゴリを統合表示する予定です。
        </p>
      </div>
    </div>
  );
}
