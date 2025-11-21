"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, BookOpen, Zap, X } from "lucide-react"
import { generateTopicSummary } from "@/lib/ai-client"

export function TopicsTab({ user, subjects }: { user: User; subjects: any[] }) {
  const [topics, setTopics] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [userTopicInput, setUserTopicInput] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null)
  const [isLoadingTopicDetail, setIsLoadingTopicDetail] = useState(false)

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("topics")
        .select("*, topic_summaries(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setTopics(data || [])
    } catch (error) {
      console.error("Error fetching topics:", error)
    }
  }

  const handleCreateTopic = async () => {
    if (!selectedSubject || !userTopicInput.trim()) {
      alert("Please select a subject and enter a topic name")
      return
    }

    setIsGenerating(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("topics").insert({
        subject_id: selectedSubject,
        user_id: user.id,
        title: userTopicInput.trim(),
        difficulty_level: difficulty,
      })

      if (error) throw error

      setUserTopicInput("")
      setSelectedSubject("")
      setIsOpen(false)
      fetchTopics()
    } catch (error: any) {
      console.error("Error creating topic:", error.message)
      alert("Failed to create topic. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOpenTopic = async (topic: any) => {
    setIsLoadingTopicDetail(true)
    try {
      const supabase = createClient()
      const { data: summaryData } = await supabase.from("topic_summaries").select("*").eq("topic_id", topic.id).single()

      setSelectedTopic({
        ...topic,
        summary: summaryData,
      })
    } catch (error) {
      setSelectedTopic(topic)
    } finally {
      setIsLoadingTopicDetail(false)
    }
  }

  const handleGenerateSummary = async (topicId: string, topicTitle: string) => {
    setIsLoadingSummary(topicId)
    try {
      const summary = await generateTopicSummary(topicTitle, difficulty)

      const supabase = createClient()
      const { data: existing } = await supabase.from("topic_summaries").select("id").eq("topic_id", topicId).single()

      if (existing) {
        await supabase.from("topic_summaries").update({ summary }).eq("topic_id", topicId)
      } else {
        await supabase.from("topic_summaries").insert({
          topic_id: topicId,
          user_id: user.id,
          summary,
        })
      }

      if (selectedTopic?.id === topicId) {
        setSelectedTopic({
          ...selectedTopic,
          summary: { summary },
        })
      }

      fetchTopics()
    } catch (error: any) {
      console.error("Error generating summary:", error.message)
      alert("Failed to generate summary. Please try again.")
    } finally {
      setIsLoadingSummary(null)
    }
  }

  const filteredTopics = selectedSubject ? topics.filter((t) => t.subject_id === selectedSubject) : topics

  const topicsBySubject = subjects.map((subject) => ({
    ...subject,
    topics: topics.filter((t) => t.subject_id === subject.id),
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Topics</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Zap className="w-4 h-4" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Topic</DialogTitle>
              <DialogDescription>Add a topic to your selected subject for studying</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Select Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="topicName">Topic Name</Label>
                <Input
                  id="topicName"
                  placeholder="e.g., Photosynthesis, World War II, Calculus"
                  value={userTopicInput}
                  onChange={(e) => setUserTopicInput(e.target.value)}
                />
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
              <Button
                onClick={handleCreateTopic}
                disabled={isGenerating || !selectedSubject || !userTopicInput.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Topic"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedTopic && (
        <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <DialogTitle>{selectedTopic.title}</DialogTitle>
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedTopic.difficulty_level === "easy"
                        ? "bg-green-100 text-green-700"
                        : selectedTopic.difficulty_level === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedTopic.difficulty_level}
                  </span>
                </div>
                <button onClick={() => setSelectedTopic(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {isLoadingTopicDetail ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : selectedTopic.summary?.summary ? (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedTopic.summary.summary}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No summary yet. Generate one to see topic details!</p>
                  <Button
                    onClick={() => handleGenerateSummary(selectedTopic.id, selectedTopic.title)}
                    disabled={isLoadingSummary === selectedTopic.id}
                    className="gap-2"
                  >
                    {isLoadingSummary === selectedTopic.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-6">
        {topicsBySubject.map(
          (subject) =>
            subject.topics.length > 0 && (
              <div key={subject.id}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{subject.name}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {subject.topics.map((topic: any) => (
                    <Card
                      key={topic.id}
                      className="hover:shadow-lg transition cursor-pointer"
                      onClick={() => handleOpenTopic(topic)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{topic.title}</CardTitle>
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                topic.difficulty_level === "easy"
                                  ? "bg-green-100 text-green-700"
                                  : topic.difficulty_level === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {topic.difficulty_level}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {topic.topic_summaries && topic.topic_summaries.length > 0 && (
                          <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-gray-700 max-h-24 overflow-hidden">
                            {topic.topic_summaries[0].summary.substring(0, 150)}...
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateSummary(topic.id, topic.title)
                          }}
                          disabled={isLoadingSummary === topic.id}
                          className="w-full gap-2"
                        >
                          {isLoadingSummary === topic.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </>
                          ) : topic.topic_summaries && topic.topic_summaries.length > 0 ? (
                            <>
                              <BookOpen className="w-4 h-4" />
                              Update Summary
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-4 h-4" />
                              Generate Summary
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ),
        )}
        {topics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No topics yet</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>Add Your First Topic</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Topic</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Select Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="topicName">Topic Name</Label>
                    <Input
                      id="topicName"
                      placeholder="e.g., Photosynthesis"
                      value={userTopicInput}
                      onChange={(e) => setUserTopicInput(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateTopic}
                    disabled={isGenerating || !selectedSubject || !userTopicInput.trim()}
                    className="w-full"
                  >
                    Add Topic
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}
