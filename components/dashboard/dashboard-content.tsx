"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { SubjectsTab } from "./subjects-tab"
import { TopicsTab } from "./topics-tab"
import { QuizzesTab } from "./quizzes-tab"
import { Sidebar } from "./sidebar"

export function DashboardContent({ user }: { user: User }) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [totalQuizzesAttempted, setTotalQuizzesAttempted] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [scoresBySubject, setScoresBySubject] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient()

      // Fetch subjects
      const { data: subjectsData } = await supabase.from("subjects").select("*").eq("user_id", user.id)

      setSubjects(subjectsData || [])

      // Fetch quiz attempts for analytics
      const { data: attemptsData } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes(topics(subject_id))")
        .eq("user_id", user.id)

      if (attemptsData && attemptsData.length > 0) {
        const total = attemptsData.length
        const avg = attemptsData.reduce((sum, a) => sum + (a.score || 0), 0) / total
        setTotalQuizzesAttempted(total)
        setAverageScore(Math.round(avg * 100) / 100)

        // Calculate scores by subject
        const scoreMap: { [key: string]: { total: number; count: number } } = {}
        for (const attempt of attemptsData) {
          const subjectName =
            subjects.find((s) => s.id === (attempt.quizzes as any)?.topics?.subject_id)?.name || "Unknown"

          if (!scoreMap[subjectName]) {
            scoreMap[subjectName] = { total: 0, count: 0 }
          }
          scoreMap[subjectName].total += attempt.score || 0
          scoreMap[subjectName].count += 1
        }

        const bySubject = Object.entries(scoreMap).map(([name, { total, count }]) => ({
          name,
          average: Math.round((total / count) * 100) / 100,
        }))
        setScoresBySubject(bySubject)
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-transparent z-30" onClick={() => setSidebarOpen(false)} />}

      <div
        className={`fixed left-0 top-0 h-screen z-40 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          user={user}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onTabChange={handleTabChange}
        />
      </div>

      <div className="flex-1 w-full">
        {/* Header with Welcome and Hamburger Menu */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex-1 ml-4">
              Welcome back, <span className="text-blue-600">{user.email?.split("@")[0]}</span>! 👋
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === "overview" && (
            <>
              {/* Stats Section */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Subjects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{subjects.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Active subjects</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Quizzes Taken</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{totalQuizzesAttempted}</div>
                    <p className="text-xs text-gray-500 mt-1">Total attempts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}%</div>
                    <p className="text-xs text-gray-500 mt-1">Across all quizzes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Learning Streak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">7</div>
                    <p className="text-xs text-gray-500 mt-1">Days active</p>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Section */}
              {scoresBySubject.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Score by Subject</CardTitle>
                      <CardDescription>Your average performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={scoresBySubject}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="average" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Distribution</CardTitle>
                      <CardDescription>Your study focus</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={subjects} dataKey="id" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {subjects.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {activeTab === "subjects" && <SubjectsTab user={user} onSubjectCreated={fetchDashboardData} />}

          {activeTab === "topics" && <TopicsTab user={user} subjects={subjects} />}

          {activeTab === "quizzes" && <QuizzesTab user={user} />}
        </div>
      </div>
    </div>
  )
}
