import { NextResponse } from 'next/server';
import { checkLMStudioHealth, LM_STUDIO_CONFIG } from '@/lib/providers/lm-studio';

export async function GET() {
  try {
    const health = await checkLMStudioHealth();
    
    if (!health.available) {
      return NextResponse.json({
        status: 'unhealthy',
        error: health.error || 'LM Studio not accessible',
        config: {
          baseURL: LM_STUDIO_CONFIG.baseURL,
          configuredModel: LM_STUDIO_CONFIG.model,
        },
        instructions: {
          message: 'LM Studio is not running or not accessible',
          steps: [
            '1. Ensure LM Studio is installed and running',
            '2. Load the OpenBioLLM-8B model (or configure a different model)',
            '3. Check that the server is running on the configured port',
            `4. Verify the base URL is correct: ${LM_STUDIO_CONFIG.baseURL}`,
          ]
        }
      }, { status: 503 });
    }
    
    // Check if the configured model is available
    const modelAvailable = health.models?.includes(LM_STUDIO_CONFIG.model) || false;
    
    return NextResponse.json({
      status: 'healthy',
      models: health.models || [],
      config: {
        baseURL: LM_STUDIO_CONFIG.baseURL,
        configuredModel: LM_STUDIO_CONFIG.model,
        modelAvailable,
      },
      performance: {
        expectedTokensPerSecond: 26,
        streaming: LM_STUDIO_CONFIG.streamingEnabled,
        maxTokens: LM_STUDIO_CONFIG.maxTokens,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('LM Studio health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        baseURL: LM_STUDIO_CONFIG.baseURL,
        configuredModel: LM_STUDIO_CONFIG.model,
      }
    }, { status: 500 });
  }
}