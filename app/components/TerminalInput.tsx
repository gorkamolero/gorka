'use client';

import { forwardRef, KeyboardEvent, useState, useEffect } from 'react';

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  showPlaceholder?: boolean;
  disabled?: boolean;
}

const CudaSpinner = () => {
  const [dots, setDots] = useState(['●', '∙', '∙']);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        const activeIndex = prevDots.findIndex(dot => dot === '●');
        const newDots = ['∙', '∙', '∙'];
        newDots[(activeIndex + 1) % 3] = '●';
        return newDots;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return <span>[{dots.join('')}]</span>;
};

const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ value, onChange, onKeyDown, showPlaceholder = false, disabled = false }, ref) => {
    return (
      <div className="flex items-center">
        <span className="mr-2" style={{ color: 'var(--color-input)' }}>{'>'}</span>
        <div className="flex-1 relative">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent outline-none caret-transparent"
            style={{ color: 'var(--color-primary)' }}
            placeholder={showPlaceholder ? "type /help or just chat..." : ""}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={disabled}
          />
          <span className="absolute top-0 pointer-events-none" style={{ left: `${value.length}ch`, color: 'var(--color-primary)' }}>
            {disabled ? (
              <CudaSpinner />
            ) : (
              <span className="inline-block w-2 h-5 animate-pulse" style={{ backgroundColor: 'var(--color-cursor)' }}></span>
            )}
          </span>
        </div>
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';

export default TerminalInput;