import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { subject, difficulty } = await request.json()

    if (!subject || !difficulty) {
      return NextResponse.json({ error: "Missing subject or difficulty" }, { status: 400 })
    }

    console.log("[v0] Generating topic for:", { subject, difficulty })

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `Generate a ${difficulty} level topic for studying ${subject}. Provide only the topic name, no explanation.`,
        maxOutputTokens: 100,
      })
      console.log("[v0] Topic generated:", text)
      return NextResponse.json({ topic: text.trim() })
    } catch (aiError) {
      console.log("[v0] AI Gateway failed, using mock data:", aiError)
      // Mock data for preview/offline mode
      const mockTopics: Record<string, Record<string, string[]>> = {
        maths: {
          easy: ["Basic Arithmetic", "Fractions", "Decimals"],
          medium: ["Algebra Basics", "Quadratic Equations", "Functions"],
          hard: ["Calculus Fundamentals", "Complex Numbers", "Vector Spaces"],
        },
        english: {
          easy: ["Pronouns", "Verb Tenses", "Parts of Speech"],
          medium: ["Essay Writing", "Figurative Language", "Literary Analysis"],
          hard: ["Rhetoric and Persuasion", "Postmodern Literature", "Critical Theory"],
        },
        science: {
          easy: ["States of Matter", "Basic Cells", "Newton's Laws"],
          medium: ["Photosynthesis", "Genetics", "Chemical Reactions"],
          hard: ["Quantum Mechanics", "Thermodynamics", "Relativity"],
        },
        history: {
          easy: ["Ancient Egypt", "Medieval Europe", "Industrial Revolution"],
          medium: ["World War II", "American Civil War", "French Revolution"],
          hard: ["Cold War Politics", "Fall of Rome", "Ottoman Empire Decline"],
        },
      }

      const subjectTopics = mockTopics[subject.toLowerCase()] || mockTopics.maths
      const levelTopics = subjectTopics[difficulty.toLowerCase()] || subjectTopics.medium
      const topic = levelTopics[Math.floor(Math.random() * levelTopics.length)]

      return NextResponse.json({ topic })
    }
  } catch (error: any) {
    console.error("[v0] Generate topic error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to generate topic", details: error?.toString() },
      { status: 500 },
    )
  }
}
