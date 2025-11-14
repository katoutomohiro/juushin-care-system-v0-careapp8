"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  episode_at: string;
  type: string;
  duration_seconds: number | null;
  triggers: string[] | null;
  interventions: string[] | null;
  note: string | null;
};

export default function SeizuresListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      // クライアントサイドでのみ supabase をインポート
      const { supabase } = await import("@/lib/supabase/browsers");
      const { data, error } = await supabase
        .from("seizures")
        .select("id,episode_at,type,duration_seconds,triggers,interventions,note")
        .order("episode_at", { ascending: false })
        .limit(20);
      if (error) setMsg(error.message);
      else setRows((data ?? []) as Row[]);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-xl font-bold">発作記録（直近20件）</h1>
      {msg && <div className="rounded bg-red-50 p-3 text-sm">{msg}</div>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="rounded border p-3">
            <div className="text-sm opacity-70">
              {new Date(r.episode_at).toLocaleString()}
            </div>
            <div className="font-semibold">{r.type}</div>
            {r.duration_seconds != null && <div>経過: {r.duration_seconds}s</div>}
            {r.triggers && r.triggers.length > 0 && <div>誘因: {r.triggers.join(" / ")}</div>}
            {r.interventions && r.interventions.length > 0 && (
              <div>処置: {r.interventions.join(" / ")}</div>
            )}
            {r.note && <div className="text-sm">備考: {r.note}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
