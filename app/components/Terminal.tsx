'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { handleCommand } from '../lib/commands';
import { useBootSequence } from '../hooks/useBootSequence';
import { useCommandHistory } from '../hooks/useCommandHistory';
import { useGeolocation } from '../hooks/useGeolocation';
import CRTEffect from './CRTEffect';
import TerminalHistory from './TerminalHistory';
import TerminalInput from './TerminalInput';

export default function Terminal() {
  const [input, setInput] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Custom hooks
  const userCity = useGeolocation();
  const { history, setHistory, isBooting, showCursor } = useBootSequence(userCity);
  const { addCommand, navigateHistory } = useCommandHistory();

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input after boot
  useEffect(() => {
    if (!isBooting) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isBooting]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        const trimmedInput = input.trim();
        
        // Mark as interacted
        if (!hasInteracted) setHasInteracted(true);
        
        // Add to history
        setHistory(prev => [...prev, { type: 'input', content: `> ${trimmedInput}` }]);
        addCommand(trimmedInput);
        
        // Process command
        const output = handleCommand(trimmedInput);
        if (output === 'CLEAR_TERMINAL') {
          setHistory([]);
        } else {
          setHistory(prev => [...prev, { type: 'output', content: output }]);
        }
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const command = navigateHistory('up');
      if (command !== null) setInput(command);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const command = navigateHistory('down');
      if (command !== null) setInput(command);
    }
  };

  return (
    <CRTEffect>
      <div 
        className="min-h-screen bg-black text-green-400 font-mono p-4 overflow-hidden"
        onClick={() => inputRef.current?.focus()}
      >
        <div 
          ref={terminalRef}
          className="h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide"
        >
          {/* Boot sequence with blinking cursor */}
          {isBooting && showCursor && (
            <div className="flex items-center">
              <span className="mr-2">{'>'}</span>
              <span className="inline-block w-2 h-5 bg-green-400 animate-pulse"></span>
            </div>
          )}

          {/* Terminal history */}
          {!showCursor && (
            <TerminalHistory history={history} />
          )}
          
          {/* Input line */}
          {!isBooting && (
            <TerminalInput
              ref={inputRef}
              value={input}
              onChange={setInput}
              onKeyDown={handleKeyDown}
              showPlaceholder={!hasInteracted}
            />
          )}
        </div>
      </div>
    </CRTEffect>
  );
}