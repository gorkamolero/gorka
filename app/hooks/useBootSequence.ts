import { useEffect, useState } from 'react';
import { conversationStorage } from '../lib/storage/conversationStorage';

interface HistoryEntry {
  type: 'input' | 'output';
  content: string;
  isTyping?: boolean;
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
        newHistory[index] = { type: 'output', content: '', isTyping: true };
        return newHistory;
      });

      for (let i = 0; i <= message.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 25));
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[index] = { type: 'output', content: message.substring(0, i), isTyping: true };
          return newHistory;
        });
      }

      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[index] = { type: 'output', content: message, isTyping: false };
        return newHistory;
      });
    };

    const bootSequence = async () => {
      // Just show blinking cursor
      setHistory([{ type: 'output', content: '>', isTyping: false }]);
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
      let hasHistory = false;
      try {
        hasHistory = await conversationStorage.hasConversation();
      } catch (error) {
        console.error('Failed to check conversation history:', error);
      }
      
      // Hide cursor and start messages
      setShowCursor(false);
      setHistory([]);
      
      const finalMessage = hasHistory 
        ? '> 1. restore previous session\n> 2. start new session'
        : '> speak';
      
      const messages = [
        '> connection established',
        '> you\'ve found the terminal',
        `> another visitor from ${userCity}`,
        finalMessage
      ];

      setHistory(messages.map(() => ({ type: 'output', content: '', isTyping: false })));

      for (let i = 0; i < messages.length; i++) {
        await typeMessage(messages[i], i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setHistory(prev => [...prev, { type: 'output', content: '' }]);
      setIsBooting(false);
      
      // Notify parent component about boot completion
      if (onBootComplete) {
        onBootComplete(hasHistory);
      }
    };

    bootSequence();
  }, [userCity, onBootComplete]);

  return { history, setHistory, isBooting, showCursor };
}