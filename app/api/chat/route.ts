import { streamText } from 'ai';
import { createAIProvider, AI_MODEL } from '@/app/lib/ai/chat';
import { loadPrompt } from '@/app/lib/ai/prompts/loader';

export async function POST(req: Request) {
  console.log('API route called');
  
  try {
    const body = await req.json();
    console.log('Request body:', body);
    const { prompt } = body;
    
    console.log('Creating OpenRouter provider...');
    const openrouter = createAIProvider();
    
    console.log('Loading system prompt...');
    const systemPrompt = await loadPrompt('digital-twin');
    console.log('System prompt loaded, length:', systemPrompt.length);

    console.log('Calling streamText with model:', AI_MODEL);
    const result = await streamText({
      model: openrouter(AI_MODEL),
      prompt: `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`,
    });

    console.log('streamText result received, creating response...');
    // Return text stream response for useCompletion
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error - Full details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return new Response(JSON.stringify({ error: 'Failed to process chat request', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}