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
import { Trash2, Plus } from "lucide-react"

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
            <Card key={subject.id} className="hover:shadow-lg transition">
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
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
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
