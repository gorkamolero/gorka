import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const createAIProvider = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('OpenRouter API key:', apiKey ? `${apiKey.slice(0, 10)}...` : 'NOT FOUND');
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }
  
  return createOpenRouter({
    apiKey,
  });
};

export const AI_MODEL = 'moonshotai/kimi-k2';