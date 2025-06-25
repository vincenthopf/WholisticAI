import { OpenAI } from 'openai';
import { LLMModel } from '@/lib/models/types';

/**
 * LM Studio configuration for local medical AI
 */
export const LM_STUDIO_CONFIG = {
  baseURL: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
  apiKey: process.env.LM_STUDIO_API_KEY || 'not-needed-for-local',
  model: process.env.LM_STUDIO_MODEL || 'OpenBioLLM-8B',
  temperature: 0.7,
  maxTokens: 2048,
  streamingEnabled: true,
};

/**
 * LM Studio models configuration
 */
export const LM_STUDIO_MODELS: LLMModel[] = [
  {
    id: 'lm-studio:OpenBioLLM-8B',
    name: 'OpenBioLLM-8B (Local)',
    provider: 'lm-studio',
    description: 'Medical-focused language model running locally via LM Studio',
    contextWindow: 8192,
    maxTokens: 2048,
    inputCost: 0,
    outputCost: 0,
    tags: ['medical', 'local', 'open-source', 'private'],
    isNew: true,
    tier: 'free',
    supportsStreaming: true,
    supportsTools: false,
    supportedFeatures: ['chat', 'medical'],
  },
  {
    id: 'lm-studio:custom',
    name: 'Custom Model (Local)',
    provider: 'lm-studio',
    description: 'Any custom model loaded in LM Studio',
    contextWindow: 4096,
    maxTokens: 2048,
    inputCost: 0,
    outputCost: 0,
    tags: ['local', 'custom', 'private'],
    tier: 'free',
    supportsStreaming: true,
    supportsTools: false,
    supportedFeatures: ['chat'],
  }
];

/**
 * Create LM Studio OpenAI client
 */
export function createLMStudioClient(): OpenAI {
  return new OpenAI({
    baseURL: LM_STUDIO_CONFIG.baseURL,
    apiKey: LM_STUDIO_CONFIG.apiKey,
    dangerouslyAllowBrowser: false, // Only server-side
  });
}

/**
 * Check if LM Studio is available
 */
export async function checkLMStudioHealth(): Promise<{
  available: boolean;
  models?: string[];
  error?: string;
}> {
  try {
    const response = await fetch(`${LM_STUDIO_CONFIG.baseURL}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data?.map((model: any) => model.id) || [];
    
    return {
      available: true,
      models,
    };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get available LM Studio models dynamically
 */
export async function getLMStudioModels(): Promise<LLMModel[]> {
  try {
    const health = await checkLMStudioHealth();
    
    if (!health.available || !health.models) {
      return LM_STUDIO_MODELS;
    }

    // Map discovered models to LLMModel format
    const dynamicModels: LLMModel[] = health.models.map((modelId: string) => ({
      id: `lm-studio:${modelId}`,
      name: `${modelId} (Local)`,
      provider: 'lm-studio',
      description: `Local model ${modelId} running via LM Studio`,
      contextWindow: 4096, // Default, can be overridden
      maxTokens: 2048,
      inputCost: 0,
      outputCost: 0,
      tags: ['local', 'private'],
      tier: 'free',
      supportsStreaming: true,
      supportsTools: false,
      supportedFeatures: ['chat'],
    }));

    // Merge with predefined models, avoiding duplicates
    const allModels = [...LM_STUDIO_MODELS];
    
    dynamicModels.forEach(dynamicModel => {
      if (!allModels.some(m => m.id === dynamicModel.id)) {
        allModels.push(dynamicModel);
      }
    });

    return allModels;
  } catch (error) {
    console.error('Error fetching LM Studio models:', error);
    return LM_STUDIO_MODELS;
  }
}

/**
 * Stream handler for LM Studio responses
 */
export async function* streamLMStudioResponse(
  messages: any[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    onToken?: (token: string) => void;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const client = createLMStudioClient();
  
  try {
    const stream = await client.chat.completions.create({
      model: options.model || LM_STUDIO_CONFIG.model,
      messages,
      temperature: options.temperature || LM_STUDIO_CONFIG.temperature,
      max_tokens: options.maxTokens || LM_STUDIO_CONFIG.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        if (options.onToken) {
          options.onToken(token);
        }
        yield token;
      }
    }
  } catch (error) {
    console.error('LM Studio streaming error:', error);
    throw new Error('Failed to stream from LM Studio');
  }
}

/**
 * Non-streaming completion for LM Studio
 */
export async function getLMStudioCompletion(
  messages: any[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  const client = createLMStudioClient();
  
  try {
    const completion = await client.chat.completions.create({
      model: options.model || LM_STUDIO_CONFIG.model,
      messages,
      temperature: options.temperature || LM_STUDIO_CONFIG.temperature,
      max_tokens: options.maxTokens || LM_STUDIO_CONFIG.maxTokens,
      stream: false,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage,
    };
  } catch (error) {
    console.error('LM Studio completion error:', error);
    throw new Error('Failed to get completion from LM Studio');
  }
}

/**
 * Medical-specific completion with safety checks
 */
export async function getMedicalCompletion(
  messages: any[],
  options: {
    conversationType?: string;
    severity?: string;
    userId?: string;
  } = {}
): Promise<{
  content: string;
  severity: string;
  metadata: Record<string, any>;
}> {
  // Add medical safety checks
  const medicalMessages = [
    {
      role: 'system',
      content: `You are a medical AI assistant. Always include appropriate disclaimers and never provide definitive diagnoses. Current conversation type: ${options.conversationType || 'general'}. Severity level: ${options.severity || 'unknown'}.`
    },
    ...messages
  ];

  const completion = await getLMStudioCompletion(medicalMessages);
  
  // Post-process for safety
  const processedContent = ensureMedicalSafety(completion.content);
  
  return {
    content: processedContent,
    severity: options.severity || 'low',
    metadata: {
      model: LM_STUDIO_CONFIG.model,
      conversationType: options.conversationType,
      timestamp: new Date().toISOString(),
      userId: options.userId,
    }
  };
}

/**
 * Ensure medical safety in responses
 */
function ensureMedicalSafety(content: string): string {
  // Check if disclaimer is present
  const hasDisclaimer = content.toLowerCase().includes('not medical advice') || 
                       content.toLowerCase().includes('consult') ||
                       content.toLowerCase().includes('healthcare professional');
  
  if (!hasDisclaimer) {
    // Prepend safety disclaimer if missing
    return `**Important:** This information is for educational purposes only and not medical advice. Please consult a healthcare professional for proper diagnosis and treatment.\n\n${content}`;
  }
  
  return content;
}