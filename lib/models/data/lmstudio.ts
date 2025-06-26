import { openproviders } from "@/lib/openproviders";
import { ModelConfig } from "../types";

// Common medical models that might be loaded in LM Studio
const COMMON_LM_STUDIO_MODELS: ModelConfig[] = [
  {
    id: "lm-studio:ii-medical-8b-1706",
    name: "Medical 8B Model",
    providerId: "lm-studio",
    provider: "LM Studio", 
    baseProviderId: "lm-studio",
    icon: "lm-studio",
    tags: ["medical", "local", "8B", "private"],
    contextWindow: 8192,
    description: "Medical-focused language model for healthcare conversations",
    inputCost: 0,
    outputCost: 0,
    accessible: true,
    apiSdk: (apiKey?: string) => openproviders("lm-studio:ii-medical-8b-1706", undefined, apiKey),
  },
  {
    id: "lm-studio:OpenBioLLM-8B",
    name: "OpenBioLLM-8B",
    providerId: "lm-studio", 
    provider: "LM Studio",
    baseProviderId: "lm-studio",
    icon: "lm-studio",
    tags: ["medical", "local", "8B", "open-source", "private"],
    contextWindow: 8192,
    description: "Medical-focused language model optimized for healthcare conversations",
    inputCost: 0,
    outputCost: 0,
    accessible: true,
    apiSdk: (apiKey?: string) => openproviders("lm-studio:OpenBioLLM-8B", undefined, apiKey),
  },
  {
    id: "lm-studio:custom",
    name: "Custom Local Model",
    providerId: "lm-studio",
    provider: "LM Studio",
    baseProviderId: "lm-studio", 
    icon: "lm-studio",
    tags: ["local", "custom", "private"],
    contextWindow: 4096,
    description: "Any custom model loaded in LM Studio",
    inputCost: 0,
    outputCost: 0,
    accessible: true,
    apiSdk: (apiKey?: string) => openproviders("lm-studio:custom", undefined, apiKey),
  },
];

// Export static models for immediate availability
export const lmStudioModels = COMMON_LM_STUDIO_MODELS;

// Dynamic model detection for LM Studio
export async function getLMStudioModels(): Promise<ModelConfig[]> {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return COMMON_LM_STUDIO_MODELS;
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
      console.warn('LM Studio not available, using common models as fallback');
      return COMMON_LM_STUDIO_MODELS;
    }

    const data = await response.json();
    const detectedModels = data.data || [];

    // Map detected models to ModelConfig format
    const dynamicModels: ModelConfig[] = detectedModels.map((model: any) => {
      return {
        id: `lm-studio:${model.id}`,
        name: model.id,
        providerId: "lm-studio",
        provider: "LM Studio",
        baseProviderId: "lm-studio",
        icon: "lm-studio",
        tags: ["local", "detected", "private"],
        contextWindow: model.context_length || 4096,
        description: `Local model: ${model.id}`,
        inputCost: 0,
        outputCost: 0,
        accessible: true,
        apiSdk: (apiKey?: string) => openproviders(`lm-studio:${model.id}`, undefined, apiKey),
      };
    });

    // Merge common models with detected models, avoiding duplicates
    const allModels = [...COMMON_LM_STUDIO_MODELS];
    dynamicModels.forEach(dynamicModel => {
      if (!allModels.some(m => m.id === dynamicModel.id)) {
        allModels.push(dynamicModel);
      }
    });

    return allModels;
  } catch (error) {
    console.warn('Error fetching LM Studio models, using common models as fallback:', error);
    return COMMON_LM_STUDIO_MODELS;
  }
}