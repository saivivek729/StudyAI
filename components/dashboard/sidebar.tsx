"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { LogOut, BookOpen, Zap, HelpCircle, Home } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function Sidebar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Overview", href: "#overview", id: "overview" },
    { icon: BookOpen, label: "Subjects", href: "#subjects", id: "subjects" },
    { icon: Zap, label: "Topics", href: "#topics", id: "topics" },
    { icon: HelpCircle, label: "Quizzes", href: "#quizzes", id: "quizzes" },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    onLogout()
    router.push("/")
  }

  return (
    <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-blue-700">
        <h2 className="text-2xl font-bold text-white">StudyAI</h2>
        <p className="text-blue-100 text-sm mt-1">Learn Smart</p>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center font-bold text-blue-900">
            {user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.email?.split("@")[0]}</p>
            <p className="text-xs text-blue-200 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              const element = document.getElementById(item.id)
              element?.scrollIntoView({ behavior: "smooth" })
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition text-blue-100 hover:text-white"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-700">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2 bg-blue-500 hover:bg-blue-700 text-white border-0"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
