'use client';

import { useChat } from '@ai-sdk/react';
import { useCallback, useEffect } from 'react';
import { DefaultChatTransport } from 'ai';

interface UseTerminalChatProps {
  onMessage: (content: string, isAI: boolean) => void;
  onLoading: (loading: boolean) => void;
}

export function useTerminalChat({ onMessage, onLoading }: UseTerminalChatProps) {

  const {
    messages,
    sendMessage: sendChatMessage,
    setMessages,
    status,
    error,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  // Track loading state
  const isLoading = status === 'streaming' || status === 'submitted';
  
  // Update loading state
  useEffect(() => {
    onLoading(isLoading);
  }, [isLoading, onLoading]);
  
  // Report errors
  useEffect(() => {
    if (error) {
      onMessage(`Error: ${error.message}`, true);
    }
  }, [error, onMessage]);

  // Watch for message updates and report them
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Extract text from message parts
        const textParts = lastMessage.parts
          .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
          .map(part => part.text)
          .join('');
        if (textParts) {
          onMessage(textParts, true);
        }
      }
    }
  }, [messages, onMessage]);

  // Send message function that wraps sendChatMessage
  const sendMessage = useCallback(async (content: string) => {
    await sendChatMessage({
      role: 'user' as const,
      parts: [{
        type: 'text' as const,
        text: content,
      }],
    });
  }, [sendChatMessage]);

  // Initialize conversation with history from terminal
  const initializeWithHistory = useCallback((history: Array<{ type: 'input' | 'output'; content: string }>) => {
    const aiMessages = history
      .filter(entry => entry && entry.content)
      .map(entry => ({
        id: Math.random().toString(36).substring(7),
        role: entry.type === 'input' ? 'user' as const : 'assistant' as const,
        parts: [{
          type: 'text' as const,
          text: entry.content.replace(/^> /, ''),
        }],
      }));

    setMessages(aiMessages);
  }, [setMessages]);

  return {
    sendMessage,
    initializeWithHistory,
  };
}