import {
  BookOpenText,
  Brain,
  Code,
  Lightbulb,
  Notepad,
  PaintBrush,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr"

export const NON_AUTH_DAILY_MESSAGE_LIMIT = 5
export const AUTH_DAILY_MESSAGE_LIMIT = 1000
export const REMAINING_QUERY_ALERT_THRESHOLD = 2
export const DAILY_FILE_UPLOAD_LIMIT = 5
export const DAILY_LIMIT_PRO_MODELS = 500

export const FREE_MODELS_IDS = [
  "openrouter:deepseek/deepseek-r1:free",
  "openrouter:meta-llama/llama-3.3-8b-instruct:free",
  "pixtral-large-latest",
  "mistral-large-latest",
  "gpt-4.1-nano",
]

export const MODEL_DEFAULT = "gpt-4.1-nano"

export const APP_NAME = "WholisticAI"
export const APP_DOMAIN = "https://wholisticai.health"

export const SUGGESTIONS = [
  {
    label: "General Health",
    highlight: "Tell me about",
    prompt: `Tell me about`,
    items: [
      "Tell me about maintaining a healthy sleep schedule",
      "Tell me about the benefits of regular exercise",
      "Tell me about stress management techniques",
      "Tell me about proper nutrition basics",
    ],
    icon: Notepad,
  },
  {
    label: "Symptoms",
    highlight: "What could cause",
    prompt: `What could cause`,
    items: [
      "What could cause frequent headaches",
      "What could cause fatigue and low energy",
      "What could cause digestive issues",
      "What could cause sleep difficulties",
    ],
    icon: Brain,
  },
  {
    label: "Medications",
    highlight: "Information about",
    prompt: `Information about`,
    items: [
      "Information about common pain relievers",
      "Information about allergy medications",
      "Information about vitamins and supplements",
      "Information about medication side effects",
    ],
    icon: Sparkle,
  },
  {
    label: "Prevention",
    highlight: "How to prevent",
    prompt: `How to prevent`,
    items: [
      "How to prevent common cold and flu",
      "How to prevent back pain from desk work",
      "How to prevent dehydration",
      "How to prevent vitamin deficiencies",
    ],
    icon: BookOpenText,
  },
  {
    label: "Wellness",
    highlight: "Tips for",
    prompt: `Tips for`,
    items: [
      "Tips for improving mental health",
      "Tips for better posture at work",
      "Tips for healthy meal planning",
      "Tips for staying active at home",
    ],
    icon: Lightbulb,
  },
  {
    label: "Understanding",
    highlight: "Explain",
    prompt: `Explain`,
    items: [
      "Explain how the immune system works",
      "Explain what blood pressure numbers mean",
      "Explain the importance of hydration",
      "Explain how stress affects the body",
    ],
    icon: Code,
  },
  {
    label: "When to Seek Care",
    highlight: "When should I",
    prompt: `When should I`,
    items: [
      "When should I see a doctor for a cough",
      "When should I be concerned about a fever",
      "When should I seek help for anxiety",
      "When should I get a health checkup",
    ],
    icon: PaintBrush,
  },
]

export const SYSTEM_PROMPT_DEFAULT = `You are WholisticAI, a thoughtful and clear assistant. Your tone is calm, minimal, and human. You write with intention—never too much, never too little. You avoid clichés, speak simply, and offer helpful, grounded answers. When needed, you ask good questions. You don’t try to impress—you aim to clarify. You may use metaphors if they bring clarity, but you stay sharp and sincere. You're here to help the user think clearly and move forward, not to overwhelm or overperform.`

export const MESSAGE_MAX_LENGTH = 10000
