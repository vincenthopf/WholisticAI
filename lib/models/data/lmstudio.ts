import { openproviders } from "@/lib/openproviders";
import { ModelConfig } from "../types";

// Get the default model from environment variable
const defaultModel = process.env.LM_STUDIO_MODEL || 'OpenBioLLM-8B';

export const lmStudioModels: ModelConfig[] = [
  {
    id: "lm-studio:OpenBioLLM-8B",
    name: "OpenBioLLM-8B",
    providerId: "lm-studio",
    provider: "LM Studio",
    icon: "lm-studio", // Added icon property
    tags: ["medical", "local", "8B", "open-source", "private"],
    context_length: 8192,
    description: "Medical-focused language model optimized for healthcare conversations",
    price_per_million_input_tokens: 0,
    price_per_million_output_tokens: 0,
    max_tokens: 2048,
    features: ["medical", "chat"],
    accessible: true,
    isNew: true,
    apiSdk: (apiKey?: string) => openproviders("lm-studio:OpenBioLLM-8B", undefined, apiKey),
  },
  {
    id: "lm-studio:custom",
    name: "Custom Local Model",
    providerId: "lm-studio",
    provider: "LM Studio",
    icon: "lm-studio", // Added icon property
    tags: ["local", "custom", "private"],
    context_length: 4096,
    description: "Any custom model loaded in LM Studio",
    price_per_million_input_tokens: 0,
    price_per_million_output_tokens: 0,
    max_tokens: 2048,
    features: ["chat"],
    accessible: true,
    apiSdk: (apiKey?: string) => openproviders("lm-studio:custom", undefined, apiKey),
  },
];

// Add the environment-specified model if it's not already in the list
if (defaultModel && !lmStudioModels.some(m => m.id === `lm-studio:${defaultModel}`)) {
  lmStudioModels.unshift({
    id: `lm-studio:${defaultModel}`,
    name: defaultModel,
    providerId: "lm-studio",
    provider: "LM Studio",
    icon: "lm-studio", // Added icon property
    tags: ["medical", "local", "configured", "private"],
    context_length: 8192,
    description: `Configured model: ${defaultModel}`,
    price_per_million_input_tokens: 0,
    price_per_million_output_tokens: 0,
    max_tokens: 2048,
    features: ["medical", "chat"],
    accessible: true,
    isNew: true,
    apiSdk: (apiKey?: string) => openproviders(`lm-studio:${defaultModel}`, undefined, apiKey),
  });
}

// Dynamic model detection for LM Studio
export async function getLMStudioModels(): Promise<ModelConfig[]> {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return lmStudioModels;
  }

  try {
    const baseURL = process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1';
    const response = await fetch(`${baseURL}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('LM Studio not available, using default models');
      return lmStudioModels;
    }

    const data = await response.json();
    const detectedModels = data.data || [];

    // Map detected models to ModelConfig format
    const dynamicModels: ModelConfig[] = detectedModels.map((model: any) => {
      const modelId = model.id.toLowerCase();
      
      return {
        id: `lm-studio:${model.id}`,
        name: model.id,
        providerId: "lm-studio",
        provider: "LM Studio",
        icon: "lm-studio", // Added icon property
        tags: ["local", "detected", "private"],
        context_length: model.context_length || 4096,
        description: `Local model: ${model.id}`,
        price_per_million_input_tokens: 0,
        price_per_million_output_tokens: 0,
        max_tokens: model.max_tokens || 2048,
        features: ["chat"],
        accessible: true,
        apiSdk: (apiKey?: string) => openproviders(`lm-studio:${model.id}`, undefined, apiKey),
      };
    });

    // Merge with predefined models, avoiding duplicates
    const allModels = [...lmStudioModels];
    
    dynamicModels.forEach(dynamicModel => {
      if (!allModels.some(m => m.id === dynamicModel.id)) {
        allModels.push(dynamicModel);
      }
    });

    return allModels;
  } catch (error) {
    console.error('Error fetching LM Studio models:', error);
    return lmStudioModels;
  }
}