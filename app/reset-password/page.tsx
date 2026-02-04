"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [supabase] = useState(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error("Supabase credentials are missing");
    }

    return createClient(url, key);
  });

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // URL ハッシュから recovery token を取得し、セッションを確立
  useEffect(() => {
    const initializeRecovery = async () => {
      try {
        const hash = window.location.hash ?? "";
        const params = new URLSearchParams(hash.substring(1));
        const type = params.get("type");
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (type !== "recovery") {
          setError("This link is not a password recovery link.");
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
          return;
        }

        if (!accessToken) {
          setError("Access token not found in recovery link.");
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
          return;
        }

        if (!refreshToken) {
          setError("Refresh token not found in recovery link.");
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
          return;
        }

        // recovery token を使ってセッションを確立
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
          return;
        }

        setReady(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      }
    };

    initializeRecovery();
  }, [supabase, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください");
      return;
    }

    if (password !== password2) {
      setError("確認用パスワードが一致していません");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(`パスワード更新失敗: ${updateError.message}`);
        return;
      }

      setSuccess(true);
      setError(null);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "パスワード更新に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div style={{ padding: "24px", maxWidth: "420px", margin: "0 auto" }}>
        {error ? (
          <p style={{ color: "#d32f2f", marginBottom: "16px" }}>{error}</p>
        ) : (
          <p style={{ color: "#666" }}>Loading...</p>
        )}
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ padding: "24px", maxWidth: "420px", margin: "0 auto" }}>
        <p style={{ color: "#388e3c" }}>
          パスワード更新完了！ログイン画面へ移動します...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "420px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "24px" }}>パスワード再設定</h2>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "8px" }}
          >
            新しいパスワード
          </label>
          <input
            id="password"
            type="password"
            placeholder="8文字以上"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
              opacity: loading ? 0.6 : 1,
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="password2"
            style={{ display: "block", marginBottom: "8px" }}
          >
            新しいパスワード（確認）
          </label>
          <input
            id="password2"
            type="password"
            placeholder="確認用"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
              opacity: loading ? 0.6 : 1,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: loading ? "#ccc" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "更新中..." : "更新"}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: "16px", color: "#d32f2f", fontSize: "14px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
