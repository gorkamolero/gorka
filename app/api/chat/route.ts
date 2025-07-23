import { streamText } from 'ai';
import { createAIProvider, AI_MODEL } from '@/app/lib/ai/chat';
import { loadPrompt } from '@/app/lib/ai/prompts/loader';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;
    
    const openrouter = createAIProvider();
    const systemPrompt = await loadPrompt('digital-twin');
    const result = await streamText({
      model: openrouter(AI_MODEL),
      prompt: `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`,
    });

    // Return text stream response for useCompletion
    return result.toTextStreamResponse();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process chat request', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}