export async function generateTopic(subject: string, difficulty: string): Promise<string> {
  const response = await fetch("/api/ai/generate-topic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, difficulty }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to generate topic")
  }

  const data = await response.json()
  return data.topic
}

export async function generateTopicSummary(topic: string, difficulty: string): Promise<string> {
  const response = await fetch("/api/ai/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, difficulty }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to generate summary")
  }

  const data = await response.json()
  return data.summary
}

export async function generateQuiz(topic: string, difficulty: string) {
  const response = await fetch("/api/ai/generate-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, difficulty }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to generate quiz")
  }

  const data = await response.json()
  return data.questions
}
