"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Play, BarChart3 } from "lucide-react"
import { generateQuiz } from "@/lib/ai-client"
import { Label } from "@/components/ui/label"
import { QuizInterface } from "./quiz-interface"

export function QuizzesTab({ user }: { user: User }) {
  const [topics, setTopics] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [selectedTopic, setSelectedTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true)

  useEffect(() => {
    fetchTopics()
    fetchQuizzes()
  }, [])

  const fetchTopics = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("topics")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setTopics(data || [])
    } catch (error) {
      console.error("Error fetching topics:", error)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("quizzes")
        .select("*, topics(id, title, difficulty_level)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      console.log("[v0] Fetched quizzes:", data)
      setQuizzes(data || [])
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    } finally {
      setIsLoadingQuizzes(false)
    }
  }

  const handleGenerateQuiz = async () => {
    if (!selectedTopic) return

    setIsGenerating(true)
    try {
      const topic = topics.find((t) => t.id === selectedTopic)
      if (!topic) {
        alert("Topic not found")
        return
      }

      const questions = await generateQuiz(topic.title, difficulty)

      const supabase = createClient()
      const { data, error } = await supabase.from("quizzes").insert({
        topic_id: selectedTopic,
        user_id: user.id,
        difficulty_level: difficulty,
        questions,
      })

      if (error) throw error
      setSelectedTopic("")
      setIsOpen(false)
      fetchQuizzes()
    } catch (error) {
      console.error("Error generating quiz:", error)
      alert("Failed to generate quiz. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (activeQuiz) {
    return (
      <QuizInterface
        quiz={activeQuiz}
        user={user}
        onComplete={() => {
          setActiveQuiz(null)
          fetchQuizzes()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Generate Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate AI Quiz</DialogTitle>
              <DialogDescription>Create a quiz for one of your topics</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="topic">Select Topic</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No topics available. Create one first!</div>
                    ) : (
                      topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateQuiz} disabled={isGenerating || !selectedTopic} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {isLoadingQuizzes ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No quizzes yet</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>Generate Your First Quiz</Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="text-lg mb-2">{(quiz.topics as any)?.title || "Untitled"}</CardTitle>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium w-fit ${
                    quiz.difficulty_level === "easy"
                      ? "bg-green-100 text-green-700"
                      : quiz.difficulty_level === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {quiz.difficulty_level}
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{quiz.questions?.length || 0} questions</p>
                <Button onClick={() => setActiveQuiz(quiz)} className="w-full gap-2">
                  <Play className="w-4 h-4" />
                  Take Quiz
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
