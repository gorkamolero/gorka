import { useState } from 'react';

interface UseTerminalAIProps {
  onMessage: (content: string, isAI: boolean) => void;
  onLoading: (loading: boolean) => void;
}

export function useTerminalAI({ onMessage, onLoading }: UseTerminalAIProps) {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    onLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          onMessage(fullText, true);
        }
      }
    } catch (error) {
      onMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
}