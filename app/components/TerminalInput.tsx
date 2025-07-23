'use client';

import { forwardRef, KeyboardEvent } from 'react';

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  showPlaceholder?: boolean;
  disabled?: boolean;
}

const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ value, onChange, onKeyDown, showPlaceholder = false, disabled = false }, ref) => {
    return (
      <div className="flex items-center">
        <span className="mr-2 text-yellow-300">{'>'}</span>
        <div className="flex-1 relative">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent outline-none text-green-400 caret-transparent placeholder-green-700"
            placeholder={showPlaceholder ? "type /help or just chat..." : ""}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={disabled}
          />
          <span className="absolute top-0 pointer-events-none text-green-400" style={{ left: `${value.length}ch` }}>
            {disabled ? (
              <span className="inline-block">
                <span className="inline-block mr-1">...</span>
                <span className="inline-block animate-pulse">thinking</span>
              </span>
            ) : (
              <span className="inline-block w-2 h-5 bg-green-400 animate-pulse"></span>
            )}
          </span>
        </div>
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';

export default TerminalInput;