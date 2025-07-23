import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  onComplete?: () => void;
}

export default function TypewriterText({ text, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      // Add variable delays for more authentic terminal feel
      const baseDelay = 25;
      const variation = Math.random() * 20; // 0-20ms variation
      const currentChar = text[currentIndex];
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
      const burstLength = shouldBurst ? Math.min(2 + Math.floor(Math.random() * 2), text.length - currentIndex) : 1;
      
      const timeout = setTimeout(() => {
        const charsToAdd = text.slice(currentIndex, currentIndex + burstLength);
        setDisplayedText(prev => prev + charsToAdd);
        setCurrentIndex(prev => prev + burstLength);
      }, delay);
      
      return () => clearTimeout(timeout);
    } else if (onComplete && currentIndex === text.length && displayedText === text) {
      onComplete();
    }
  }, [currentIndex, text, onComplete, displayedText]);
  
  return (
    <>
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-2 bg-green-400 animate-pulse" 
              style={{ height: '1em', verticalAlign: 'text-bottom' }} />
      )}
    </>
  );
}