"use client"

import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  // Use environment variables - in preview, hardcoded as fallback
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://knqbseyactkmzjlszejh.supabase.co"
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtucWJzZXlhY3RrbXpqbHN6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjE3OTMsImV4cCI6MjA3OTI5Nzc5M30.8W4ZLDM1moV82dSH50KX77cDQWqlSrUz3n8JmY42LRg"

  if (!supabaseUrl || !supabaseKey) {
    const available = {
      url: !!supabaseUrl,
      key: !!supabaseKey,
    }
    console.error("[v0] Missing Supabase vars:", available)
    throw new Error(`Supabase configuration missing.`)
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)

  return supabaseClient
}
