import { streamText } from 'ai';
import { createAIProvider, AI_MODEL } from '@/app/lib/ai/chat';
import { loadPrompt } from '@/app/lib/ai/prompts/loader';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const openrouter = createAIProvider();
    const systemPrompt = await loadPrompt('digital-twin');
    
    // Prepend system message if not already present
    const messagesWithSystem = messages[0]?.role === 'system' 
      ? messages 
      : [{ role: 'system', content: systemPrompt }, ...messages];
    
    const result = await streamText({
      model: openrouter(AI_MODEL),
      messages: messagesWithSystem,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process chat request', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}