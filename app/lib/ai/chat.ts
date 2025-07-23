import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const createAIProvider = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }
  
  return createOpenRouter({
    apiKey,
  });
};

export const AI_MODEL = process.env.NODE_ENV === 'production' ? 'moonshotai/kimi-k2:free' : 'moonshotai/kimi-k2';