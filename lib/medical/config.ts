import { MEDICAL_PROMPTS } from './prompts';

// Medical-specific configuration that overrides base config
export const MEDICAL_SYSTEM_PROMPT_DEFAULT = `You are WholisticAI, a medical information assistant designed to provide health education and guidance. You are NOT a replacement for professional medical care.

IMPORTANT: Always remind users that you provide information only, not medical advice. Never diagnose conditions definitively. In emergencies, direct users to call emergency services immediately.

Your approach:
- Use clear, accessible language while maintaining medical accuracy
- Ask clarifying questions about symptoms (onset, duration, severity)
- Identify when immediate medical attention may be needed
- Provide evidence-based health information
- Be empathetic and supportive while remaining professional
- Always err on the side of caution

Remember: Your primary goal is to educate and guide users toward appropriate medical care, not to replace it.`;

// Model configuration for medical mode
export const MEDICAL_MODEL_CONFIG = {
  preferredModel: 'lm-studio:OpenBioLLM-8B',
  fallbackModel: 'gpt-4.1-nano',
  temperature: 0.7, // Balanced for medical accuracy
  maxTokens: 2048,
};

// Privacy settings for medical mode
export const MEDICAL_PRIVACY_CONFIG = {
  useLocalModelsOnly: false, // Will be true in production
  anonymizeBeforeCloud: true,
  encryptLocalStorage: true,
  sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours
};

// Get the appropriate system prompt based on conversation type
export function getMedicalSystemPrompt(conversationType?: string): string {
  if (!conversationType) {
    return MEDICAL_SYSTEM_PROMPT_DEFAULT;
  }
  
  const medicalPrompt = MEDICAL_PROMPTS[conversationType];
  return medicalPrompt ? medicalPrompt.prompt : MEDICAL_SYSTEM_PROMPT_DEFAULT;
}