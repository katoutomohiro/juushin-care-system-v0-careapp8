"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import LoginPage from "./login/page"

export default function Page() {
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "unauthenticated" | "authenticated">("checking")

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session?.user) {
        setStatus("unauthenticated")
        return
      }
      setStatus("authenticated")
      router.replace("/services/life-care/users")
    })
  }, [router])

  if (status === "checking") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>
  }

  if (status === "authenticated") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Redirecting...</div>
  }

  return <LoginPage />
}
