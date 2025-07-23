import clsx from 'clsx';
import { useState, useEffect } from 'react';

interface HistoryEntry {
  type: 'input' | 'output';
  content: string;
  typewriter?: boolean;
}

interface TerminalHistoryProps {
  history: HistoryEntry[];
}

export default function TerminalHistory({ history }: TerminalHistoryProps) {
  return (
    <>
      {history.map((entry, index) => (
        <TerminalLine key={index} entry={entry} />
      ))}
    </>
  );
}

function TerminalLine({ entry }: { entry: HistoryEntry }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const shouldTypewrite = entry.typewriter && entry.type === 'output';
  
  useEffect(() => {
    if (!shouldTypewrite) {
      setDisplayedText(entry.content);
      return;
    }
    
    if (currentIndex < entry.content.length) {
      // Add variable delays for more authentic terminal feel
      const baseDelay = 25;
      const variation = Math.random() * 20; // 0-20ms variation
      const currentChar = entry.content[currentIndex];
      const isPunctuation = /[.,!?;:]/.test(currentChar);
      const isSpace = currentChar === ' ';
      const isNewline = currentChar === '\n';
      
      // Longer delays after punctuation, shorter for spaces
      let delay = baseDelay + variation;
      if (isPunctuation) delay += 60; // Extra pause after punctuation
      if (isSpace) delay = 8; // Quick spaces
      if (isNewline) delay += 80; // Pause at line breaks
      
      // Occasionally type 2-3 characters at once for authenticity
      const shouldBurst = Math.random() < 0.15 && !isPunctuation && !isNewline;
      const burstLength = shouldBurst ? Math.min(2 + Math.floor(Math.random() * 2), entry.content.length - currentIndex) : 1;
      
      const timeout = setTimeout(() => {
        const charsToAdd = entry.content.slice(currentIndex, currentIndex + burstLength);
        setDisplayedText(prev => prev + charsToAdd);
        setCurrentIndex(prev => prev + burstLength);
      }, delay);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, entry.content, shouldTypewrite]);
  
  return (
    <div 
      className={clsx(
        'whitespace-pre-wrap mb-1 relative',
        entry.type === 'input' ? 'text-yellow-300' : 'text-green-400'
      )}
    >
      {shouldTypewrite ? (
        <>
          {displayedText}
          {currentIndex < entry.content.length && (
            <span className="inline-block w-2 bg-green-400 animate-pulse" 
                  style={{ height: '1em', verticalAlign: 'text-bottom' }} />
          )}
        </>
      ) : (
        entry.content
      )}
    </div>
  );
}