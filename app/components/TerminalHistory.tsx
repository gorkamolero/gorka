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
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + entry.content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 10);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, entry.content, shouldTypewrite]);
  
  return (
    <div 
      className={clsx(
        'whitespace-pre-wrap mb-1',
        entry.type === 'input' ? 'text-yellow-300' : 'text-green-400'
      )}
    >
      {shouldTypewrite ? displayedText : entry.content}
      {shouldTypewrite && currentIndex < entry.content.length && (
        <span className="inline-block w-2 h-5 bg-green-400 animate-pulse" />
      )}
    </div>
  );
}