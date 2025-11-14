"use client";

import { useEffect, useMemo, useState } from "react";

type SeizureType = "強直間代" | "ピク付き" | "上視線" | "ミオクロニー" | "欠神" | "不明";

export default function NewSeizurePage() {
  const [episodeAt, setEpisodeAt] = useState<string>("");
  const [type, setType] = useState<SeizureType>("強直間代");
  const [duration, setDuration] = useState<number | "">("");
  const [triggersRaw, setTriggersRaw] = useState<string>("");
  const [interventionsRaw, setInterventionsRaw] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/lib/supabase/browsers");
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? "";
      setUserId(uid);
    })();
  }, []);

  const toTextArray = (s: string) =>
    s
      .split(/[\s,、，]+/g)
      .map((t) => t.trim())
      .filter(Boolean);

  const typeOptions: SeizureType[] = useMemo(
    () => ["強直間代", "ピク付き", "上視線", "ミオクロニー", "欠神", "不明"],
    []
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase/browsers");
      const { data: auth } = await supabase.auth.getUser();
      const reporterId = auth.user?.id;
      if (!reporterId) {
        setMsg("ログイン情報を取得できません。再ログインしてください。");
        setLoading(false);
        return;
      }
      if (!userId) {
        setMsg("user_id が未指定です。");
        setLoading(false);
        return;
      }
      if (!episodeAt) {
        setMsg("発作日時を入力してください。");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("seizures").insert([
        {
          episode_at: new Date(episodeAt).toISOString(),
          type,
          duration_seconds: duration === "" ? null : Number(duration),
          triggers: toTextArray(triggersRaw),
          interventions: toTextArray(interventionsRaw),
          note: note || null,
          user_id: userId,
          reporter_id: reporterId,
        },
      ]);

      if (error) {
        setMsg(`保存に失敗しました: ${error.message}`);
      } else {
        setMsg("保存しました。/seizures に一覧表示があります。");
        setDuration("");
        setTriggersRaw("");
        setInterventionsRaw("");
        setNote("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-xl font-bold">発作記録（新規）</h1>

      {msg && <div className="rounded bg-blue-50 p-3 text-sm">{msg}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">発作日時</label>
          <input
            type="datetime-local"
            value={episodeAt}
            onChange={(e) => setEpisodeAt(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">タイプ</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SeizureType)}
            className="w-full rounded border px-3 py-2"
          >
            {typeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">経過時間（秒）</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded border px-3 py-2"
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">誘因（カンマ/空白/読点区切り）</label>
          <input
            type="text"
            value={triggersRaw}
            onChange={(e) => setTriggersRaw(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="睡眠不足, 体調不良 など"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">処置（カンマ/空白/読点区切り）</label>
          <input
            type="text"
            value={interventionsRaw}
            onChange={(e) => setInterventionsRaw(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="吸引 体位変換 救急連絡 など"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">備考</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            記録対象者 user_id（暫定。将来はプロフィール選択に差し替え）
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          type="submit"
        >
          {loading ? "保存中…" : "保存する"}
        </button>
      </form>
    </div>
  );
}
