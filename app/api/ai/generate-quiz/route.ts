import { generateObject } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const QuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string(),
})

const QuizSchema = z.object({
  questions: z.array(QuestionSchema),
})

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty } = await request.json()

    if (!topic || !difficulty) {
      return NextResponse.json({ error: "Missing topic or difficulty" }, { status: 400 })
    }

    console.log("[v0] Generating quiz for:", { topic, difficulty })

    const difficultyGuide = {
      easy: "Create 5 straightforward multiple-choice questions suitable for beginners. Questions should test basic understanding and definitions.",
      medium:
        "Create 5 moderate multiple-choice questions that require understanding of concepts and their applications.",
      hard: "Create 5 challenging multiple-choice questions that test deep understanding, analysis, and application of advanced concepts.",
    }

    try {
      const { object } = await generateObject({
        model: "openai/gpt-4o-mini",
        prompt: `Generate a ${difficulty} level quiz with exactly 5 multiple choice questions about "${topic}".

${difficultyGuide[difficulty as keyof typeof difficultyGuide]}

For each question:
- Create a clear, specific question
- Provide 4 plausible answer options (mix correct answer with realistic distractors)
- Mark the correct answer (0-3 index)
- Provide a clear explanation of why the answer is correct

Return valid JSON matching the schema.`,
        schema: QuizSchema,
        maxOutputTokens: 1500,
      })

      console.log("[v0] Quiz generated successfully")
      return NextResponse.json({ questions: object?.questions || [] })
    } catch (aiError: any) {
      console.log("[v0] AI generation failed, using contextual quiz:", aiError?.message)

      const questions = generateContextualQuiz(topic, difficulty)
      return NextResponse.json({ questions })
    }
  } catch (error: any) {
    console.error("[v0] Generate quiz error:", error)
    return NextResponse.json({ error: error?.message || "Failed to generate quiz" }, { status: 500 })
  }
}

// Fallback function to generate topic-specific quiz
function generateContextualQuiz(topic: string, difficulty: string) {
  const topicLower = topic.toLowerCase()

  // Topic-specific quizzes
  if (topicLower.includes("photosynthesis")) {
    const quizzes: Record<string, any[]> = {
      easy: [
        {
          question: "What are the three main inputs required for photosynthesis?",
          options: [
            "Sunlight, water, and carbon dioxide",
            "Oxygen, glucose, and nitrogen",
            "Chlorophyll, nitrogen, and phosphorus",
            "Heat, light, and soil nutrients",
          ],
          correctAnswer: 0,
          explanation:
            "Photosynthesis requires sunlight (light energy), water (H₂O), and carbon dioxide (CO₂) as inputs to produce glucose and oxygen.",
        },
        {
          question: "In which part of the plant does photosynthesis primarily occur?",
          options: ["Roots", "Stems", "Leaves", "Seeds"],
          correctAnswer: 2,
          explanation:
            "Photosynthesis primarily occurs in the leaves of plants, which contain chloroplasts with the pigment chlorophyll.",
        },
        {
          question: "What is the main product of photosynthesis that plants use for energy?",
          options: ["Oxygen", "Water", "Glucose", "Carbon dioxide"],
          correctAnswer: 2,
          explanation:
            "Glucose is the main product that plants create through photosynthesis and use as an energy source for growth and metabolism.",
        },
        {
          question: "Which gas do plants release as a byproduct of photosynthesis?",
          options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
          correctAnswer: 2,
          explanation: "Plants release oxygen as a byproduct of photosynthesis, which is essential for life on Earth.",
        },
        {
          question: "In what organelle does photosynthesis take place?",
          options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
          correctAnswer: 1,
          explanation:
            "Photosynthesis occurs in chloroplasts, which contain thylakoids and stroma where the light and dark reactions take place.",
        },
      ],
      medium: [
        {
          question: "What is the primary function of the light-dependent reactions?",
          options: ["To fix carbon dioxide", "To produce ATP and NADPH", "To create glucose", "To break down glucose"],
          correctAnswer: 1,
          explanation:
            "The light-dependent reactions capture light energy and convert it to chemical energy in the form of ATP and NADPH, which are then used in the Calvin cycle.",
        },
        {
          question: "Which pigment is primarily responsible for absorbing light energy in photosynthesis?",
          options: ["Carotenoid", "Chlorophyll a and b", "Xanthophyll", "Anthocyanin"],
          correctAnswer: 1,
          explanation:
            "Chlorophyll a and b are the primary photosynthetic pigments that absorb light energy, particularly in the blue and red wavelengths.",
        },
        {
          question: "What is the Calvin cycle also known as?",
          options: [
            "Light-dependent reactions",
            "Electron transport chain",
            "Light-independent reactions",
            "Krebs cycle",
          ],
          correctAnswer: 2,
          explanation:
            "The Calvin cycle is called the light-independent reactions because it doesn't directly require light energy, though it depends on ATP and NADPH produced by light reactions.",
        },
        {
          question: "In the thylakoid membrane, what is the role of the electron transport chain?",
          options: [
            "To produce glucose",
            "To create a proton gradient for ATP synthesis",
            "To absorb sunlight",
            "To break down water molecules",
          ],
          correctAnswer: 1,
          explanation:
            "The electron transport chain moves electrons and pumps protons across the thylakoid membrane, creating a gradient that drives ATP synthesis.",
        },
        {
          question: "How many carbon atoms does RuBP have, the compound that begins the Calvin cycle?",
          options: ["3 carbons", "5 carbons", "6 carbons", "7 carbons"],
          correctAnswer: 1,
          explanation:
            "RuBP (ribulose-1,5-bisphosphate) has 5 carbon atoms and is the compound that combines with CO₂ in the first step of the Calvin cycle.",
        },
      ],
      hard: [
        {
          question: "What is the quantum yield of photosynthesis, and what does it indicate?",
          options: [
            "The ratio of O₂ produced to light absorbed; near 100% efficiency",
            "The amount of ATP per glucose; typically 18",
            "The ratio of glucose to CO₂; always 1:6",
            "The electron transport rate; measured in mV",
          ],
          correctAnswer: 0,
          explanation:
            "Quantum yield approaches 100%, meaning nearly every photon absorbed by the light-harvesting complex contributes to the photochemical reactions.",
        },
        {
          question: "Explain the role of the Mn₄CaO₅ cluster in photosystem II.",
          options: [
            "It absorbs light energy",
            "It catalyzes water oxidation through the Kok cycle",
            "It transports electrons to PSII",
            "It produces NADPH",
          ],
          correctAnswer: 1,
          explanation:
            "The Mn₄CaO₅ cluster (water-oxidizing complex) catalyzes the stepwise oxidation of water to molecular oxygen through the Kok cycle in PSII.",
        },
        {
          question: "How does photorespiration affect photosynthetic efficiency?",
          options: [
            "It increases ATP production",
            "It reduces net CO₂ fixation by 20-50% in C3 plants",
            "It eliminates the need for the Calvin cycle",
            "It enhances oxygen production",
          ],
          correctAnswer: 1,
          explanation:
            "Photorespiration occurs when RuBisCO fixes O₂ instead of CO₂, reducing net photosynthetic efficiency by 20-50% in C3 plants, particularly at high temperatures.",
        },
        {
          question: "What is the chemiosmotic mechanism in photosynthesis?",
          options: [
            "Direct conversion of photons to ATP",
            "Proton gradient drives ATP synthesis through chemiosmosis",
            "Light directly phosphorylates ADP",
            "Electron transport directly produces NADPH",
          ],
          correctAnswer: 1,
          explanation:
            "Chemiosmosis couples the electron transport chain to proton pumping, establishing a gradient across the thylakoid membrane that drives ATP synthesis through ATP synthase.",
        },
        {
          question: "How do C4 and CAM plants differ from C3 plants in photosynthetic efficiency?",
          options: [
            "They have more chloroplasts",
            "They concentrate CO₂ to minimize photorespiration",
            "They have no thylakoids",
            "They don't use the Calvin cycle",
          ],
          correctAnswer: 1,
          explanation:
            "C4 and CAM plants have evolved mechanisms to concentrate CO₂ around RuBisCO, significantly reducing photorespiration and improving efficiency in hot or dry conditions.",
        },
      ],
    }

    return quizzes[difficulty] || quizzes.medium
  }

  // Generic fallback quiz
  const generic: Record<string, any[]> = {
    easy: [
      {
        question: `What is the primary purpose of studying ${topic}?`,
        options: [
          "To pass exams",
          "To understand fundamental concepts and build foundational knowledge",
          "To memorize facts",
          "For entertainment",
        ],
        correctAnswer: 1,
        explanation:
          "Understanding fundamental concepts in this topic provides the foundation for deeper learning and practical application.",
      },
      {
        question: `Which of the following is a key component of ${topic}?`,
        options: [
          "Advanced theory",
          "Basic definitions and foundational principles",
          "Complex mathematics",
          "Specialized equipment",
        ],
        correctAnswer: 1,
        explanation:
          "Basic definitions and foundational principles are essential starting points for understanding this topic.",
      },
      {
        question: `How is ${topic} commonly applied in practice?`,
        options: [
          "Only in theoretical contexts",
          "In real-world situations and practical applications",
          "Never applied",
          "Only by experts",
        ],
        correctAnswer: 1,
        explanation: "This topic has practical applications in many real-world scenarios that learners encounter.",
      },
      {
        question: `What should a beginner focus on when learning ${topic}?`,
        options: ["Advanced theories", "Basic concepts and key definitions", "Historical facts", "Mathematical proofs"],
        correctAnswer: 1,
        explanation:
          "Beginners should focus on understanding basic concepts and key definitions before moving to advanced material.",
      },
      {
        question: `Why is ${topic} important?`,
        options: [
          "It's not important",
          "It provides essential knowledge and understanding in this field",
          "Only for specialists",
          "It was important historically",
        ],
        correctAnswer: 1,
        explanation:
          "This topic is important because it provides essential knowledge and understanding in its field of study.",
      },
    ],
    medium: [
      {
        question: `How do the main concepts of ${topic} interconnect?`,
        options: [
          "They don't relate",
          "They form an integrated framework with multiple interactions",
          "Only sequentially",
          "In circular patterns only",
        ],
        correctAnswer: 1,
        explanation:
          "The concepts in this topic are interconnected and form an integrated framework for understanding.",
      },
      {
        question: `What current developments are shaping ${topic}?`,
        options: [
          "None - the field is static",
          "New research and emerging technologies",
          "Only historical developments",
          "Political changes",
        ],
        correctAnswer: 1,
        explanation: "Contemporary research and emerging technologies continue to shape and advance this field.",
      },
      {
        question: `How do researchers approach problems in ${topic}?`,
        options: [
          "Through guessing",
          "Using systematic methodology and controlled approaches",
          "No standard method",
          "By intuition only",
        ],
        correctAnswer: 1,
        explanation: "Professional researchers use systematic and controlled methodological approaches.",
      },
      {
        question: `What are common misconceptions about ${topic}?`,
        options: [
          "There are none",
          "People often oversimplify complex interactions",
          "Everyone understands it correctly",
          "Misconceptions only exist in history",
        ],
        correctAnswer: 1,
        explanation: "Common misconceptions often arise from oversimplification of complex interactions in this topic.",
      },
      {
        question: `How has understanding of ${topic} evolved?`,
        options: [
          "It hasn't changed",
          "It has progressed with new discoveries and evidence",
          "It has declined",
          "Only dramatically in recent years",
        ],
        correctAnswer: 1,
        explanation:
          "Like all scientific fields, understanding has evolved as new evidence and research methods emerged.",
      },
    ],
    hard: [
      {
        question: `What theoretical frameworks compete in ${topic}?`,
        options: [
          "No frameworks exist",
          "Multiple competing frameworks with different assumptions",
          "Only one framework",
          "Frameworks from other fields",
        ],
        correctAnswer: 1,
        explanation:
          "Multiple theoretical frameworks with different foundational assumptions exist in this advanced topic.",
      },
      {
        question: `How do recent empirical findings challenge existing models in ${topic}?`,
        options: [
          "They don't",
          "New findings suggest limitations and necessary revisions",
          "Findings only confirm models",
          "Empirical study is irrelevant",
        ],
        correctAnswer: 1,
        explanation: "Current research regularly identifies limitations and suggests necessary model refinements.",
      },
      {
        question: `What mathematical or formal foundations underpin ${topic}?`,
        options: [
          "None are needed",
          "Complex mathematical frameworks and formal systems",
          "Simple arithmetic only",
          "Mathematics is contradictory",
        ],
        correctAnswer: 1,
        explanation: "Advanced understanding requires sophisticated mathematical and formal frameworks.",
      },
      {
        question: `How do multi-scale mechanisms operate in ${topic}?`,
        options: [
          "Only at one scale",
          "Multiple scales with emergent properties and complex causality",
          "Scales are independent",
          "Scale effects are negligible",
        ],
        correctAnswer: 1,
        explanation: "Advanced systems exhibit multi-scale interactions that create emergent properties.",
      },
      {
        question: `What unresolved questions drive current research in ${topic}?`,
        options: [
          "All questions are solved",
          "Major theoretical gaps continue to drive innovation",
          "Research has stalled",
          "Only trivial questions remain",
        ],
        correctAnswer: 1,
        explanation: "Active research areas focus on unresolved theoretical challenges and open questions.",
      },
    ],
  }

  return generic[difficulty] || generic.medium
}
