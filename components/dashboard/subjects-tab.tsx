"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Plus, X } from "lucide-react"

export function SubjectsTab({
  user,
  onSubjectCreated,
}: {
  user: User
  onSubjectCreated: () => void
}) {
  const [subjects, setSubjects] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [subjectName, setSubjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null)
  const [topicsInSubject, setTopicsInSubject] = useState<any[]>([])
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.from("subjects").select("*").eq("user_id", user.id)
      setSubjects(data || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectName.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("subjects").insert({
        user_id: user.id,
        name: subjectName,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      })

      if (error) throw error
      setSubjectName("")
      setIsOpen(false)
      fetchSubjects()
      onSubjectCreated()
    } catch (error) {
      console.error("Error creating subject:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    try {
      const supabase = createClient()
      await supabase.from("subjects").delete().eq("id", id)
      fetchSubjects()
    } catch (error) {
      console.error("Error deleting subject:", error)
    }
  }

  const handleOpenSubject = async (subject: any) => {
    setSelectedSubject(subject)
    setIsLoadingTopics(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("topics")
        .select("*, topic_summaries(*)")
        .eq("subject_id", subject.id)
        .eq("user_id", user.id)
      setTopicsInSubject(data || [])
    } catch (error) {
      console.error("Error fetching topics:", error)
      setTopicsInSubject([])
    } finally {
      setIsLoadingTopics(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Subjects</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subject</DialogTitle>
              <DialogDescription>Add a new subject to organize your study materials</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  placeholder="e.g., Biology, History, Mathematics"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Creating..." : "Create Subject"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {selectedSubject && (
        <Dialog open={!!selectedSubject} onOpenChange={(open) => !open && setSelectedSubject(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{selectedSubject.name} - Topics</DialogTitle>
                <button onClick={() => setSelectedSubject(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {isLoadingTopics ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
                </div>
              ) : topicsInSubject.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No topics in this subject yet</p>
                </div>
              ) : (
                topicsInSubject.map((topic) => (
                  <Card key={topic.id} className="hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{topic.title}</h4>
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
                          {topic.topic_summaries && topic.topic_summaries.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {topic.topic_summaries[0].summary.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No subjects yet</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>Create Your First Subject</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subject</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subjectName">Subject Name</Label>
                    <Input
                      id="subjectName"
                      placeholder="e.g., Biology"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    Create Subject
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          subjects.map((subject) => (
            <Card
              key={subject.id}
              className="hover:shadow-lg transition cursor-pointer"
              onClick={() => handleOpenSubject(subject)}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: subject.color + "20" }}>
                  <div
                    className="w-full h-full flex items-center justify-center text-xl font-bold"
                    style={{ color: subject.color }}
                  >
                    {subject.name[0]}
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{subject.name}</h3>
                {subject.description && <p className="text-sm text-gray-600 mb-4">{subject.description}</p>}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Click to view topics</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSubject(subject.id)
                    }}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
