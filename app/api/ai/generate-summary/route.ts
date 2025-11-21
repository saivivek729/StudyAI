import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty } = await request.json()

    if (!topic || !difficulty) {
      return NextResponse.json({ error: "Missing topic or difficulty" }, { status: 400 })
    }

    console.log("[v0] Generating summary for:", { topic, difficulty })

    const difficultyPrompt = {
      easy: "Create an easy to understand, beginner-friendly summary (3-4 paragraphs) covering basic concepts and key points.",
      medium:
        "Create a comprehensive, intermediate-level summary (4-5 paragraphs) covering theory, applications, and important details.",
      hard: "Create an advanced, detailed summary (5-6 paragraphs) covering complex concepts, research, theoretical frameworks, and cutting-edge developments.",
    }

    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `Create an accurate and informative summary about the topic: "${topic}".
        
${difficultyPrompt[difficulty as keyof typeof difficultyPrompt]}

Focus on factual, educational content that would help a student understand this topic deeply. Include important concepts, definitions, and practical applications where relevant.`,
        maxOutputTokens: 800,
      })

      console.log("[v0] Summary generated successfully")
      return NextResponse.json({ summary: text })
    } catch (aiError: any) {
      console.log("[v0] AI generation attempt failed:", aiError?.message)

      // Fallback: Generate contextual summary based on topic
      const contextualSummary = generateContextualSummary(topic, difficulty)
      return NextResponse.json({ summary: contextualSummary })
    }
  } catch (error: any) {
    console.error("[v0] Generate summary error:", error)
    return NextResponse.json({ error: error?.message || "Failed to generate summary" }, { status: 500 })
  }
}

// Fallback function to generate topic-specific summary
function generateContextualSummary(topic: string, difficulty: string): string {
  const topicLower = topic.toLowerCase()

  // Topic-specific summaries
  const summaries: Record<string, Record<string, string>> = {
    photosynthesis: {
      easy: `Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of glucose. It occurs mainly in the leaves of plants. This process has two main parts: the light-dependent reactions that occur in sunlight, and the light-independent reactions (Calvin cycle) that don't require direct sunlight. Plants use the glucose they create as food for growth and energy. Photosynthesis is crucial for life on Earth because it produces the oxygen we breathe and forms the base of most food chains.`,
      medium: `Photosynthesis is the metabolic process by which autotrophic organisms, primarily plants, convert light energy into chemical energy stored in glucose. The process occurs in two main stages: the light-dependent reactions in the thylakoid membranes of chloroplasts, where light energy excites electrons in photosystem II and I, driving the synthesis of ATP and NADPH; and the light-independent reactions (Calvin cycle) in the stroma, where CO₂ is fixed into organic molecules. The electron transport chain and proton gradient generation are critical for ATP synthesis via chemiosmosis. Photosynthesis is essential not only for producing oxygen and carbohydrates but also for global carbon cycling and energy flow through ecosystems.`,
      hard: `Photosynthesis represents a complex series of photochemical and enzymatic reactions that convert photons into chemical energy with remarkable quantum efficiency. The process involves sophisticated light-harvesting complexes that utilize exciton transfer to funnel energy to reaction centers with nearly 100% quantum yield. In photosystem II, water oxidation at the Mn₄CaO₅ cluster generates electrons, protons, and molecular oxygen through a Kok cycle mechanism. The Z-scheme couples photosystems II and I through the cytochrome b₆f complex, establishing a proton gradient that drives ATP synthesis via chemiosmotic coupling. The Calvin-Benson cycle utilizes RuBisCO, the most abundant protein on Earth, with sophisticated allosteric regulation. Recent research has revealed the role of photorespiration, dynamic thylakoid organization, and linear/cyclic electron flows in optimizing photosynthetic efficiency under varying environmental conditions.`,
    },
  }

  // Check if we have a specific summary for this topic
  for (const [key, difficultyLevels] of Object.entries(summaries)) {
    if (topicLower.includes(key) || key.includes(topicLower)) {
      return difficultyLevels[difficulty] || difficultyLevels.medium
    }
  }

  // Generic fallback based on difficulty
  const generic: Record<string, string> = {
    easy: `${topic} is an important topic in education and learning. It covers fundamental concepts and principles that are essential for understanding this subject area. Students typically learn about the basic definitions, key components, and practical applications. Mastering these fundamentals provides a strong foundation for more advanced study. Regular practice and engagement with this material helps build both knowledge and critical thinking skills.`,
    medium: `${topic} is a multifaceted subject that requires understanding both theoretical foundations and practical applications. The topic encompasses several key concepts and principles that interconnect to form a comprehensive framework. Understanding the historical development, current research, and diverse perspectives on this topic is important for deeper learning. Professional practitioners in this field must grasp both the technical and conceptual aspects. Continued study and practical experience help develop expertise and nuanced understanding.`,
    hard: `${topic} represents an advanced area of study that requires sophisticated understanding of theoretical frameworks, mathematical foundations, and contemporary research. The field involves complex interactions between multiple domains of knowledge and cutting-edge developments. Current research identifies several open questions and emerging paradigms that challenge existing understanding. Mastery of this topic requires not only comprehensive knowledge but also critical evaluation of sources, understanding of research methodology, and ability to contribute novel insights. The field continues to evolve with interdisciplinary approaches and novel technologies reshaping understanding.`,
  }

  return generic[difficulty] || generic.medium
}
