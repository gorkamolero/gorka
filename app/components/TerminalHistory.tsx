import clsx from 'clsx';

interface HistoryEntry {
  type: 'input' | 'output';
  content: string;
  isTyping?: boolean;
}

interface TerminalHistoryProps {
  history: HistoryEntry[];
}

export default function TerminalHistory({ history }: TerminalHistoryProps) {
  return (
    <>
      {history.map((entry, index) => (
        <div 
          key={index} 
          className={clsx(
            'whitespace-pre-wrap mb-1',
            entry.type === 'input' ? 'text-yellow-300' : 'text-green-400'
          )}
        >
          {entry.content}
          {entry.isTyping && (
            <span className="inline-block w-2 h-5 bg-green-400 animate-pulse ml-0.5" />
          )}
        </div>
      ))}
    </>
  );
}