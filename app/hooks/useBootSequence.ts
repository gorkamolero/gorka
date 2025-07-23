import { useEffect, useState } from 'react';
import { conversationStorage } from '../lib/storage/conversationStorage';

interface HistoryEntry {
  type: 'input' | 'output';
  content: string;
  typewriter?: boolean;
}

export function useBootSequence(userCity: string, onBootComplete?: (hasHistory: boolean) => void) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!userCity) return;

    const typeMessage = async (message: string, index: number) => {
      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[index] = { type: 'output', content: '', typewriter: true };
        return newHistory;
      });

      for (let i = 0; i <= message.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 25));
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[index] = { type: 'output', content: message.substring(0, i), typewriter: true };
          return newHistory;
        });
      }

      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[index] = { type: 'output', content: message, typewriter: false };
        return newHistory;
      });
    };

    const bootSequence = async () => {
      // Just show blinking cursor
      setHistory([{ type: 'output', content: '>', typewriter: false }]);
      setShowCursor(true);
      
      // Simulate loading various systems (this is where real loading would happen)
      const loadingSystems = [
        { name: 'core modules', duration: 300 },
        { name: 'command parser', duration: 200 },
        { name: 'security protocols', duration: 400 },
        { name: 'user location', duration: 300 },
        { name: 'terminal interface', duration: 200 }
      ];

      // Let cursor blink for a moment
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Load systems in background
      for (const system of loadingSystems) {
        await new Promise(resolve => setTimeout(resolve, system.duration));
      }
      
      // Check for existing conversation history
      let savedConversation: HistoryEntry[] | null = null;
      let hasHistory = false;
      try {
        savedConversation = await conversationStorage.loadConversation();
        hasHistory = !!(savedConversation && savedConversation.length > 0);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
      
      // Hide cursor and start messages
      setShowCursor(false);
      setHistory([]);
      
      // Different behavior based on environment
      const isProduction = process.env.NODE_ENV === 'production';
      const finalMessage = (isProduction && hasHistory) 
        ? '> 1. restore previous session\n> 2. start new session'
        : '> speak';
      
      const messages = [
        '> connection established',
        '> you\'ve found the terminal',
        `> another visitor from ${userCity}`,
        finalMessage
      ];

      setHistory(messages.map(() => ({ type: 'output', content: '', typewriter: false })));

      for (let i = 0; i < messages.length; i++) {
        await typeMessage(messages[i], i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Auto-restore in development, or if no history exists
      if (!isProduction && hasHistory) {
        // Development: automatically restore
        // Filter out any undefined entries before setting
        const filteredHistory = (savedConversation || []).filter(Boolean);
        setHistory(filteredHistory);
      } else if (!hasHistory) {
        // No history: show normal prompt
        setHistory(prev => [...prev, { type: 'output', content: '' }]);
      } else {
        // Production with history: just show the boot messages, let parent handle prompt
        setHistory(prev => [...prev, { type: 'output', content: '' }]);
      }
      
      setIsBooting(false);
      
      // Notify parent component about boot completion
      if (onBootComplete) {
        onBootComplete(isProduction && hasHistory);
      }
    };

    bootSequence();
  }, [userCity, onBootComplete]);

  return { history, setHistory, isBooting, showCursor };
}