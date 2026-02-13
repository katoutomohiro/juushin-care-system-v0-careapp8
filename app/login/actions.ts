"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const redirectTo = String(formData.get("redirect") ?? "/")

  const normalizeRedirectPath = (value: string) => {
    if (!value) return "/"
    if (value.startsWith("/")) return value
    try {
      const url = new URL(value)
      const nextPath = `${url.pathname}${url.search}${url.hash}`
      return nextPath || "/"
    } catch {
      return "/"
    }
  }
  const safeRedirectTo = normalizeRedirectPath(redirectTo)

  const buildLoginRedirect = (message: string) => {
    const params = new URLSearchParams({ error: message })
    return redirect(`/login?${params.toString()}`)
  }

  if (!email) {
    return buildLoginRedirect("メールアドレスを入力してください")
  }

  const supabase = await createSupabaseServerClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      const msg = error?.message ?? "ログインに失敗しました"
      return buildLoginRedirect(msg)
    }

    // Successful sign-in: the server client attaches cookies; redirect to target
    return redirect(safeRedirectTo)
  } catch (err) {
    const digest = (err as { digest?: string }).digest
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
      throw err
    }
    const msg = err instanceof Error ? err.message : "エラーが発生しました"
    return buildLoginRedirect(msg)
  }
}
