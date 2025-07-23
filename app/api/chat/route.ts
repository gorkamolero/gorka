import { streamText } from 'ai';
import { createAIProvider, AI_MODEL } from '@/app/lib/ai/chat';
import { loadPrompt } from '@/app/lib/ai/prompts/loader';

interface HistoryEntry {
  type: 'input' | 'output';
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, history = [] }: { prompt: string; history: HistoryEntry[] } = body;
    
    const openrouter = createAIProvider();
    const systemPrompt = await loadPrompt('digital-twin');
    
    // Convert history to AI SDK message format
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    
    // Add system prompt
    messages.push({
      role: 'system' as const,
      content: systemPrompt
    });
    
    // Add conversation history (last 20 messages to avoid token limits)
    const recentHistory = history.slice(-20);
    recentHistory.forEach((entry) => {
      const content = entry.content.replace(/^> /, '');
      messages.push({
        role: entry.type === 'input' ? 'user' as const : 'assistant' as const,
        content
      });
    });
    
    // Add current user message
    messages.push({
      role: 'user' as const,
      content: prompt
    });
    
    const result = await streamText({
      model: openrouter(AI_MODEL),
      messages,
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