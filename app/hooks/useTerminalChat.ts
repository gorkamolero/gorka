'use client';

import { useChat } from '@ai-sdk/react';
import { useCallback, useEffect, useRef } from 'react';
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

  // Track the last processed message to avoid duplicates
  const lastProcessedMessageRef = useRef<string>('');
  
  // Watch for message updates and report them
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        let textContent = '';
        
        // Extract text from parts array
        if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
          textContent = lastMessage.parts
            .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
            .map(part => part.text)
            .join('');
        }
        
        // Only call onMessage if this is actually new content
        if (textContent && textContent !== lastProcessedMessageRef.current) {
          lastProcessedMessageRef.current = textContent;
          onMessage(textContent, true);
        }
      }
    }
  }, [messages, onMessage]);

  // Initialize with conversation history
  const initializeWithHistory = useCallback((history: Array<{ type: 'input' | 'output'; content: string }>) => {
    const uiMessages = history
      .filter(entry => entry && entry.content && entry.content.trim())
      .map(entry => {
        const text = entry.content.replace(/^> /, '').trim();
        return text ? {
          id: Math.random().toString(36).substring(7),
          role: entry.type === 'input' ? 'user' as const : 'assistant' as const,
          parts: [{
            type: 'text' as const,
            text: text
          }]
        } : null;
      })
      .filter((msg): msg is NonNullable<typeof msg> => msg !== null);
    
    if (uiMessages.length > 0) {
      setMessages(uiMessages);
    }
  }, [setMessages]);

  return {
    sendMessage: sendChatMessage,
    initializeWithHistory,
  };
}