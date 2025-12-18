import "server-only";
import { createClient } from "@supabase/supabase-js";

type Seizure = {
  id: string;
  episode_at: string | null;
  type: string | null;
  duration_seconds: number | null;
  triggers: string[] | null;
  interventions: string[] | null;
  note: string | null;
  created_at: string | null;
};

// anon key を用いたサーバーサイド読み取り (service role は使用しない)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function formatDateTime(isoString: string | null): string {
  if (!isoString) return "日時不明";
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  } catch {
    return "日時不明";
  }
}

export default async function SeizuresListPage() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 p-4">
        <h1 className="text-2xl font-bold">発作記録一覧（MVP）</h1>
        <p className="text-sm text-red-500">
          環境変数が未設定です (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)
        </p>
      </main>
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  let seizures: Seizure[] = [];
  let errorMessage: string | null = null;

  try {
    const { data, error } = await supabase
      .from("seizures")
      .select("*")
      .order("episode_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[Seizures List] Fetch error:", error);
      errorMessage = error.message;
    } else {
      seizures = (data || []) as Seizure[];
    }
  } catch (err) {
    console.error("[Seizures List] Unexpected error:", err);
    errorMessage = String(err);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4">
      {/* タイトル・説明 */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">発作記録一覧（MVP）</h1>
        <p className="text-sm text-gray-600">
          最近の発作記録を最大20件まで表示しています。
          記録の追加は <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">/seizures/new</code> から行えます。
        </p>
        <p className="text-sm text-gray-600">
          将来的には利用者選択・日付範囲フィルタ・詳細ビューなどの機能を拡張予定です。
        </p>
      </header>

      {/* エラー表示 */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">読み込みエラー: {errorMessage}</p>
        </div>
      )}

      {/* 発作カード一覧 */}
      {seizures.length === 0 ? (
        <div className="rounded-lg border bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">
            まだ発作記録がありません。/seizures/new から記録を追加できます。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {seizures.map((seizure) => {
            const displayTriggers = seizure.triggers?.slice(0, 2) || [];
            const remainingTriggersCount = (seizure.triggers?.length || 0) - displayTriggers.length;
            const displayInterventions = seizure.interventions?.slice(0, 2) || [];
            const remainingInterventionsCount =
              (seizure.interventions?.length || 0) - displayInterventions.length;
            const truncatedNote =
              seizure.note && seizure.note.length > 60
                ? seizure.note.slice(0, 60) + "…"
                : seizure.note;

            return (
              <div key={seizure.id} className="rounded-lg border bg-white p-3 shadow-sm space-y-2">
                {/* 上段: 日時と発作情報 */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {formatDateTime(seizure.episode_at)}
                  </span>
                  <span className="text-sm text-gray-600">
                    発作: {seizure.type ?? "不明"}（{seizure.duration_seconds ?? 0}秒）
                  </span>
                </div>

                {/* 中段: トリガー・対応 */}
                {(displayTriggers.length > 0 || displayInterventions.length > 0) && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {displayTriggers.map((trigger) => (
                      <span
                        key={`${seizure.id}-trigger-${trigger}`}
                        className="inline-block rounded bg-amber-100 px-2 py-0.5 text-amber-800"
                      >
                        🔔 {trigger}
                      </span>
                    ))}
                    {remainingTriggersCount > 0 && (
                      <span className="text-gray-500">…ほか{remainingTriggersCount}件</span>
                    )}
                    {displayInterventions.map((intervention) => (
                      <span
                        key={`${seizure.id}-intervention-${intervention}`}
                        className="inline-block rounded bg-blue-100 px-2 py-0.5 text-blue-800"
                      >
                        💊 {intervention}
                      </span>
                    ))}
                    {remainingInterventionsCount > 0 && (
                      <span className="text-gray-500">…ほか{remainingInterventionsCount}件</span>
                    )}
                  </div>
                )}

                {/* 下段: メモ */}
                {truncatedNote && (
                  <p className="text-sm text-gray-600 leading-relaxed">{truncatedNote}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* デバッグ用 JSON セクション */}
      <details className="rounded-lg border bg-gray-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">
          開発者向け: JSON を表示
        </summary>
        <pre className="mt-2 overflow-auto text-xs text-gray-800 whitespace-pre-wrap">
          {JSON.stringify(seizures, null, 2)}
        </pre>
      </details>
    </main>
  );
}
