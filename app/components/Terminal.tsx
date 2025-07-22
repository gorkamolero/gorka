'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { handleCommand } from '../lib/commands';
import { useBootSequence } from '../hooks/useBootSequence';
import { useCommandHistory } from '../hooks/useCommandHistory';
import { useGeolocation } from '../hooks/useGeolocation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import CRTEffect from './CRTEffect';
import TerminalHistory from './TerminalHistory';
import TerminalInput from './TerminalInput';
import { MUSIC_TRACKS } from '../lib/constants/music';
import MusicPlayer from './MusicPlayer';

export default function Terminal() {
  const [input, setInput] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [musicPlayerActive, setMusicPlayerActive] = useState(false);
  const [musicPlayerVisible, setMusicPlayerVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  // Custom hooks
  const userCity = useGeolocation();
  const { history, setHistory, isBooting, showCursor } = useBootSequence(userCity);
  const { addCommand, navigateHistory } = useCommandHistory();
  const { handleShortcut } = useKeyboardShortcuts({ input, setInput, setHistory, inputRef });

  // Format music player display
  const formatMusicPlayer = (selected: number): string => {
    let display = `╔═══════════════════════════════════════════╗
║              MUSIC                        ║
╚═══════════════════════════════════════════╝

`;
    
    MUSIC_TRACKS.forEach((track, index) => {
      const isSelected = index === selected;
      const prefix = isSelected ? '▶' : ' ';
      display += `${prefix} [${index + 1}] ${track.name}\n`;
      if (isSelected) {
        display += `     └─ ${track.description}\n`;
      }
    });
    
    display += `
> [↑/↓ or j/k] Navigate | [Enter] Play | [q] Exit`;
    
    return display;
  };

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
    // Handle music player navigation
    if (musicPlayerActive) {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const newSelection = Math.max(0, selectedTrack - 1);
        setSelectedTrack(newSelection);
        // Update the last output in history
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { type: 'output', content: formatMusicPlayer(newSelection) };
          return newHistory;
        });
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const newSelection = Math.min(MUSIC_TRACKS.length - 1, selectedTrack + 1);
        setSelectedTrack(newSelection);
        // Update the last output in history
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { type: 'output', content: formatMusicPlayer(newSelection) };
          return newHistory;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const track = MUSIC_TRACKS[selectedTrack];
        setMusicPlayerVisible(true);
        setMusicPlayerActive(false);
        setHistory(prev => [...prev, { type: 'output', content: `> Now playing: ${track.name}` }]);
      } else if (e.key === 'q' || e.key === 'Escape') {
        e.preventDefault();
        setMusicPlayerActive(false);
        setHistory(prev => [...prev, { type: 'output', content: '> Music player closed.' }]);
      } else if (e.key >= '1' && e.key <= '9') {
        const trackIndex = parseInt(e.key) - 1;
        if (trackIndex < MUSIC_TRACKS.length) {
          const track = MUSIC_TRACKS[trackIndex];
          setSelectedTrack(trackIndex);
          setMusicPlayerVisible(true);
          setMusicPlayerActive(false);
          setHistory(prev => [...prev, { type: 'output', content: `> Now playing: ${track.name}` }]);
        }
      }
      return;
    }

    // Handle shortcuts first
    if (handleShortcut(e)) {
      return;
    }

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
        } else if (output === 'SHOW_MUSIC_PLAYER') {
          setMusicPlayerActive(true);
          setSelectedTrack(0);
          const musicDisplay = formatMusicPlayer(0);
          setHistory(prev => [...prev, { type: 'output', content: musicDisplay }]);
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
        className="min-h-screen bg-black text-green-400 font-mono p-2 sm:p-4 overflow-hidden text-xs sm:text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        <div 
          ref={terminalRef}
          className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide"
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
      
      {/* Music Player */}
      <MusicPlayer 
        isActive={musicPlayerVisible}
        initialTrack={selectedTrack}
        onClose={() => setMusicPlayerVisible(false)}
      />
    </CRTEffect>
  );
}