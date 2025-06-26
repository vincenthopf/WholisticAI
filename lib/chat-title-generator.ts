/**
 * Chat title generation utilities
 * Generates intelligent, topic-based titles for conversations
 */

import { openproviders } from "@/lib/openproviders"
import { generateText } from "ai"

/**
 * Generate a concise, topic-focused title for a chat based on the first user message
 * @param userMessage - The first message from the user
 * @param modelId - The model to use for title generation (optional, defaults to a fast model)
 * @returns A promise that resolves to a concise chat title
 */
export async function generateChatTitle(
  userMessage: string, 
  modelId?: string
): Promise<string> {
  // Fallback for empty or very short messages
  if (!userMessage || userMessage.trim().length < 3) {
    return "New Chat"
  }

  // For very short messages, just clean them up and use as title
  if (userMessage.trim().length < 50) {
    return cleanupTitle(userMessage)
  }

  try {
    // Use a fast, efficient model for title generation
    // Default to GPT-4o mini for speed and cost efficiency
    const titleModel = modelId || "gpt-4o-mini"
    const model = openproviders(titleModel)

    const prompt = `Generate a concise, descriptive title (2-6 words) for a conversation that starts with this message. The title should capture the main topic or intent. Respond with ONLY the title, no quotes or explanations.

User message: "${userMessage.trim()}"`

    const response = await generateText({
      model,
      prompt,
      maxTokens: 20, // Keep it short
      temperature: 0.3, // Lower temperature for more consistent results
    })

    const generatedTitle = response.text.trim()
    
    // Validate and clean up the generated title
    if (generatedTitle && generatedTitle.length > 3 && generatedTitle.length < 100) {
      return cleanupTitle(generatedTitle)
    }
    
    // Fallback to cleaned user message if generation fails
    return cleanupTitle(userMessage)
    
  } catch (error) {
    console.warn("Failed to generate chat title:", error)
    // Fallback to cleaned user message
    return cleanupTitle(userMessage)
  }
}

/**
 * Clean up a title by removing quotes, trimming, and limiting length
 */
function cleanupTitle(title: string): string {
  return title
    .trim()
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 80) // Limit length
    .trim()
}

/**
 * Generate a title from user input without AI - for immediate use
 * This is used as a quick fallback or for real-time title setting
 */
export function generateQuickTitle(userMessage: string): string {
  if (!userMessage || userMessage.trim().length < 3) {
    return "New Chat"
  }

  // For questions, try to extract the main topic
  const cleaned = userMessage.trim()
  
  // If it's a question, try to make it more title-like
  if (cleaned.includes('?')) {
    // Remove question words and simplify
    let title = cleaned
      .replace(/^(how|what|when|where|why|who|can|could|would|should|is|are|do|does|did)\s+/i, '')
      .replace(/\?/g, '')
      .trim()
    
    if (title.length > 3) {
      return cleanupTitle(title)
    }
  }

  // For statements or commands, use first part
  const firstSentence = cleaned.split(/[.!?]/)[0]
  return cleanupTitle(firstSentence)
}