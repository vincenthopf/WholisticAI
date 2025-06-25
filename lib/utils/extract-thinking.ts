/**
 * Extract thinking content from message text
 * Removes <think>...</think> tags and returns both cleaned text and thinking content
 */
export function extractThinkingContent(text: string | null | undefined): {
  cleanedText: string
  thinkingContent: string | null
} {
  if (!text) {
    return { cleanedText: "", thinkingContent: null }
  }
  // Match all <think>...</think> blocks (including multiline)
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g
  
  let thinkingContent = ""
  let cleanedText = text
  
  // Extract all thinking blocks
  let match
  while ((match = thinkRegex.exec(text)) !== null) {
    // Add thinking content (trim to remove extra whitespace)
    const content = match[1].trim()
    if (content) {
      if (thinkingContent) {
        thinkingContent += "\n\n"
      }
      thinkingContent += content
    }
    
    // Remove the entire <think>...</think> block from the text
    cleanedText = cleanedText.replace(match[0], "")
  }
  
  // Clean up any extra whitespace left after removing thinking tags
  cleanedText = cleanedText.trim()
  
  return {
    cleanedText,
    thinkingContent: thinkingContent || null
  }
}

/**
 * Extract thinking content from message text during streaming
 * Handles incomplete <think> tags and returns both cleaned text and thinking content
 */
export function extractThinkingContentStreaming(text: string | null | undefined): {
  cleanedText: string
  thinkingContent: string | null
} {
  if (!text) {
    return { cleanedText: "", thinkingContent: null }
  }

  let cleanedText = ""
  let thinkingContent = ""
  let isInsideThinking = false
  let i = 0

  while (i < text.length) {
    // Check for opening <think> tag
    if (!isInsideThinking && text.substring(i).startsWith("<think>")) {
      isInsideThinking = true
      i += 7 // Skip "<think>"
      continue
    }

    // Check for closing </think> tag
    if (isInsideThinking && text.substring(i).startsWith("</think>")) {
      isInsideThinking = false
      i += 8 // Skip "</think>"
      continue
    }

    // Check for incomplete opening tag at the end
    if (!isInsideThinking && i === text.length - 1 && text[i] === "<") {
      // Don't include incomplete tag in output
      break
    }
    if (!isInsideThinking && text.substring(i).match(/^<t(?:h(?:i(?:n(?:k)?)?)?)?$/)) {
      // Partial <think> tag at the end
      break
    }

    // Add character to appropriate output
    if (isInsideThinking) {
      thinkingContent += text[i]
    } else {
      cleanedText += text[i]
    }
    i++
  }

  // If we're still inside a thinking block, that's fine for streaming
  // The content will be in thinkingContent

  return {
    cleanedText: cleanedText.trim(),
    thinkingContent: thinkingContent.trim() || null
  }
}