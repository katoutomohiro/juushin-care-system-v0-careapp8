import { createClient } from "@supabase/supabase-js"

type TableCheckResult = {
  name: string
  label: string
  sqlFile: string
  status: "ok" | "missing" | "error"
  message: string
}

const TABLES = [
  { name: "service_users", label: "service_users（利用者デフォルト）", sqlFile: "supabase/sql/2025-11-28-service-users-defaults.sql" },
  { name: "staff_members", label: "staff_members（スタッフマスタ）", sqlFile: "supabase/sql/2025-11-26-staff-members.sql" },
  { name: "case_records", label: "case_records（ケース記録）", sqlFile: "supabase/sql/2025-11-case-records.sql" },
]

const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205", "PGRST114", "PGRST116"])

async function checkTable(name: string): Promise<{ status: "ok" | "missing" | "error"; message: string }> {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  if (!url || !key) {
    return { status: "error", message: "環境変数 NEXT_PUBLIC_SUPABASE_URL / KEY が未設定です" }
  }

  const supabase = createClient(url, key)
  const { error } = await supabase.from(name).select("1", { count: "exact", head: true })
  if (error) {
    if (MISSING_TABLE_CODES.has((error as any).code)) {
      return { status: "missing", message: "テーブルなし（SQL を実行してください）" }
    }
    return { status: "error", message: `エラー: ${error.message}` }
  }
  return { status: "ok", message: "✅ テーブルあり" }
}

export default async function DBHealthPage() {
  const results: TableCheckResult[] = []
  for (const t of TABLES) {
    const res = await checkTable(t.name)
    results.push({ ...t, ...res })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "(未設定)"

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">DBヘルスチェック</h1>
          <p className="text-sm text-muted-foreground mt-2">
            NEXT_PUBLIC_SUPABASE_URL: <span className="font-mono">{url}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            テーブルが missing の場合は該当 SQL ファイルを Supabase Studio の SQL Editor で一度実行してください。
          </p>
        </div>

        <div className="space-y-3">
          {results.map((r) => (
            <div key={r.name} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="text-xs text-muted-foreground break-all">{r.name}</p>
                  <p className="text-xs text-muted-foreground">参照 SQL: {r.sqlFile}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    r.status === "ok" ? "text-green-600" : r.status === "missing" ? "text-red-600" : "text-amber-600"
                  }`}
                >
                  {r.status === "ok" ? "OK" : r.status === "missing" ? "MISSING" : "ERROR"}
                </span>
              </div>
              <p className="text-sm mt-2">{r.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
