import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://knqbseyactkmzjlszejh.supabase.co"
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtucWJzZXlhY3RrbXpqbHN6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjE3OTMsImV4cCI6MjA3OTI5Nzc5M30.8W4ZLDM1moV82dSH50KX77cDQWqlSrUz3n8JmY42LRg"

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignored - setAll can be called from a server component
        }
      },
    },
  })
}
