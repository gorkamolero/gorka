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
        console.log('[BootSequence] Loaded conversation:', { 
          hasHistory, 
          conversationLength: savedConversation?.length,
          isProduction: process.env.NODE_ENV === 'production'
        });
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

      // Wait a moment before restoring to ensure messages are displayed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Auto-restore in development, or if no history exists
      if (!isProduction && hasHistory && savedConversation) {
        // Development: automatically restore
        // Replace the boot messages with the saved conversation
        const filteredHistory = savedConversation.filter(Boolean);
        console.log('[BootSequence] Auto-restoring history in development:', filteredHistory.length, 'entries');
        setHistory(filteredHistory);
      } else if (!hasHistory) {
        // No history: add empty line after boot messages
        console.log('[BootSequence] No history to restore');
        setHistory(prev => [...prev, { type: 'output', content: '' }]);
      } else {
        // Production with history: add empty line after boot messages, let parent handle prompt
        console.log('[BootSequence] Production mode - showing prompt for history restore');
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