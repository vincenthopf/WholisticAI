/**
 * Background chat title improvement system
 * Improves chat titles after the first exchange using AI
 */

import { updateChatTitle } from "@/lib/chat-store/chats/api"
import { generateChatTitle } from "@/lib/chat-title-generator"
import { getModelInfo } from "@/lib/models"

/**
 * Improve a chat title in the background after the first exchange
 * @param chatId - The chat ID to update
 * @param userMessage - The user's first message
 * @param assistantResponse - The assistant's response (optional, for context)
 * @param modelId - The model used for the conversation
 */
export async function improveChatTitleInBackground(
  chatId: string,
  userMessage: string,
  assistantResponse?: string,
  modelId?: string
): Promise<void> {
  try {
    // Don't improve very short messages or if no chat ID
    if (!chatId || !userMessage || userMessage.trim().length < 10) {
      return
    }

    // Use a fast model for title generation if the current model is expensive/slow
    let titleGenerationModel = modelId
    
    // If using an expensive model, switch to a cheaper one for title generation
    if (modelId) {
      const modelInfo = getModelInfo(modelId)
      if (modelInfo && (modelInfo.inputCost || 0) > 1.0) {
        // Use GPT-4o mini for expensive models
        titleGenerationModel = "gpt-4o-mini"
      }
    }

    // Generate improved title using AI
    const improvedTitle = await generateChatTitle(userMessage, titleGenerationModel)
    
    // Only update if the title is meaningfully different and better
    if (improvedTitle && 
        improvedTitle !== "New Chat" && 
        improvedTitle.length > 3 &&
        improvedTitle.length < 100) {
      
      await updateChatTitle(chatId, improvedTitle)
      console.log(`Improved chat title: "${improvedTitle}"`)
    }
    
  } catch (error) {
    // Silently fail for background operations
    console.warn("Background title improvement failed:", error)
  }
}

/**
 * Check if a chat should have its title improved
 * @param currentTitle - Current chat title
 * @param messageCount - Number of messages in the chat
 * @returns Whether the title should be improved
 */
export function shouldImproveTitle(currentTitle: string, messageCount: number): boolean {
  // Only improve titles for new chats (1-2 messages)
  if (messageCount > 2) return false
  
  // Improve if it's still "New Chat" or looks like raw user input
  if (currentTitle === "New Chat") return true
  
  // Improve if title is very long (likely raw user input)
  if (currentTitle.length > 50) return true
  
  // Improve if title contains question marks or seems unprocessed
  if (currentTitle.includes('?') && currentTitle.length > 30) return true
  
  return false
}