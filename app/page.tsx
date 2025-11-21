"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, Brain, BarChart3 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          router.push("/dashboard")
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.log("[v0] Env vars not loaded yet, showing landing page")
        setIsLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">StudyAI</span>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/auth/login")}>
            Login
          </Button>
          <Button onClick={() => router.push("/auth/sign-up")}>Sign Up</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
              Learn Smarter with <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 text-pretty">
              Create personalized study guides with AI-generated topics, comprehensive summaries, and adaptive quizzes
              based on your learning level.
            </p>
            <Button size="lg" onClick={() => router.push("/auth/sign-up")} className="bg-blue-600 hover:bg-blue-700">
              Start Learning Today
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <Sparkles className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">AI Topics</h3>
              <p className="text-sm text-gray-600">Generate custom topics based on your subject</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <BookOpen className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Summaries</h3>
              <p className="text-sm text-gray-600">Get instant AI-powered topic summaries</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <Brain className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Smart Quizzes</h3>
              <p className="text-sm text-gray-600">Test knowledge with difficulty levels</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <BarChart3 className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Track progress with detailed insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-gray-200 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Choose StudyAI?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Learning</h3>
              <p className="text-gray-600">
                Tailor your study materials to your specific subjects and difficulty levels.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Summaries</h3>
              <p className="text-gray-600">Get comprehensive summaries of complex topics in seconds.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Monitor your learning journey with detailed analytics and insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to transform your learning?</h2>
        <Button size="lg" onClick={() => router.push("/auth/sign-up")} className="bg-blue-600 hover:bg-blue-700">
          Create Your Account Now
        </Button>
      </section>
    </div>
  )
}
