"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export function QuizInterface({
  quiz,
  user,
  onComplete,
}: {
  quiz: any
  user: User
  onComplete: () => void
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null))
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const questions: Question[] = quiz.questions
  const question = questions[currentQuestion]

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    setShowResults(true)

    // Calculate score
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++
      }
    })

    const score = (correct / questions.length) * 100

    // Save attempt to database
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      await supabase.from("quiz_attempts").insert({
        quiz_id: quiz.id,
        user_id: user.id,
        score: score / 100,
        total_questions: questions.length,
        answers: answers,
      })
    } catch (error) {
      console.error("Error saving quiz attempt:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showResults) {
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++
      }
    })
    const score = (correct / questions.length) * 100

    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {score >= 70 ? (
                <CheckCircle className="w-16 h-16 text-green-600" />
              ) : (
                <XCircle className="w-16 h-16 text-orange-600" />
              )}
            </div>
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <p className="text-2xl font-bold text-gray-900 mt-4">Score: {Math.round(score)}%</p>
            <p className="text-gray-600 mt-2">
              You got {correct} out of {questions.length} questions correct
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-3">
                  {index + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === q.correctAnswer
                    const userAnswered = answers[index]
                    const isUserAnswer = optionIndex === userAnswered

                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded border ${
                          isCorrect && isUserAnswer
                            ? "bg-green-50 border-green-200"
                            : !isCorrect && isUserAnswer
                              ? "bg-red-50 border-red-200"
                              : isCorrect
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {!isCorrect && isUserAnswer && <XCircle className="w-5 h-5 text-red-600" />}
                          <span
                            className={
                              isCorrect
                                ? "text-green-700"
                                : !isCorrect && isUserAnswer
                                  ? "text-red-700"
                                  : "text-gray-600"
                            }
                          >
                            {option}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-3 italic">Explanation: {q.explanation}</p>
              </div>
            ))}
            <Button onClick={onComplete} className="w-full">
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={onComplete} className="gap-2 bg-transparent">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <span className="text-sm font-medium text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion]?.toString() ?? ""}
            onValueChange={(value) => handleAnswer(Number.parseInt(value))}
          >
            <div className="space-y-4">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="mt-8 flex gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={answers.includes(null) || isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                className="flex-1"
              >
                Next
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex gap-1 flex-wrap">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded text-xs font-medium transition ${
                    index === currentQuestion
                      ? "bg-blue-600 text-white"
                      : answers[index] !== null
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
