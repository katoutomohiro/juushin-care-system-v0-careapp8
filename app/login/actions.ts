"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const redirectTo = String(formData.get("redirect") ?? "/")

  if (!email) {
    const url = new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost")
    url.searchParams.set("error", "メールアドレスを入力してください")
    return redirect(url.toString())
  }

  const supabase = await createSupabaseServerClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      const msg = error?.message ?? "ログインに失敗しました"
      const url = new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost")
      url.searchParams.set("error", msg)
      return redirect(url.toString())
    }

    // Successful sign-in: the server client attaches cookies; redirect to target
    return redirect(redirectTo || "/")
  } catch (err) {
    const msg = err instanceof Error ? err.message : "エラーが発生しました"
    const url = new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost")
    url.searchParams.set("error", msg)
    return redirect(url.toString())
  }
}
