import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export async function getApiUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    return null
  }

  return data.user
}
