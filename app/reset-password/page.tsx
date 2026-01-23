"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browsers";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash ?? "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");

    if (type !== "recovery") {
      setMsg("This link is not a password recovery link.");
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [router]);

  const onSubmit = async () => {
    setMsg(null);

    if (password.length < 8) {
      setMsg("パスワードは8文字以上にしてね");
      return;
    }
    if (password !== password2) {
      setMsg("確認用パスワードが一致してない");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMsg(`更新失敗: ${error.message}`);
      return;
    }

    setMsg("パスワード更新OK！ログイン画面へ戻ります。");
    setTimeout(() => {
      router.replace("/login");
    }, 1500);
  };

  if (!ready) return <div style={{ padding: 24 }}>{msg ?? "Loading..."}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2>パスワード再設定</h2>

      <input
        type="password"
        placeholder="新しいパスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 12, marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="新しいパスワード（確認）"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <button onClick={onSubmit} style={{ width: "100%", padding: 10 }}>
        更新
      </button>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
