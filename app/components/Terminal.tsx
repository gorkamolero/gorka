'use client';

import { useEffect, useRef, KeyboardEvent, useCallback } from 'react';
import { useBootSequence } from '../hooks/useBootSequence';
import { useCommandHistory } from '../hooks/useCommandHistory';
import { useGeolocation } from '../hooks/useGeolocation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTerminalNavigation } from '../hooks/useTerminalNavigation';
import { TerminalProvider, useTerminalContext } from '../contexts/TerminalContext';
import { useCommandExecutor } from '../hooks/useCommandExecutor';
import CRTEffect from './CRTEffect';
import TypewriterText from './TypewriterText';
import clsx from 'clsx';
import { useTheme } from '../contexts/ThemeContext';
import TerminalInput from './TerminalInput';
import MusicPlayer from './MusicPlayer';
import WorkBrowser, { formatWorkBrowser } from './WorkBrowser';
import VimMode from './VimMode';
import { useTerminalAI } from '../hooks/useTerminalAI';
import { conversationStorage } from '../lib/storage/conversationStorage';

function TerminalContent() {  
  const {
    input, setInput,
    hasInteracted, setHasInteracted,
    isWaitingForResponse, setIsWaitingForResponse,
    musicPlayerVisible, setMusicPlayerVisible,
    selectedTrack,
    workBrowserActive,
    workBrowserVisible, setWorkBrowserVisible,
    selectedProject,
    vimModeActive, setVimModeActive,
    showResetConfirmation, setShowResetConfirmation,
    showHistoryPrompt, setShowHistoryPrompt,
    savedHistory, setSavedHistory,
    closeAllBrowsers
  } = useTerminalContext();
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const userCity = useGeolocation();
  
  const handleBootComplete = useCallback(async (hasHistory: boolean) => {
    if (hasHistory) {
      setShowHistoryPrompt(true);
      try {
        const savedConversation = await conversationStorage.loadConversation();
        // Filter out any undefined entries
        const filteredConversation = savedConversation?.filter(Boolean) || null;
        setSavedHistory(filteredConversation);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    }
  }, [setShowHistoryPrompt, setSavedHistory]);
  
  const { history, setHistory, isBooting, showCursor } = useBootSequence(userCity, handleBootComplete);
  const { addCommand, navigateHistory } = useCommandHistory();
  const { setTheme } = useTheme();
  
  const { handleShortcut } = useKeyboardShortcuts({ input, setInput, setHistory, inputRef, closeAllBrowsers });
  
  const streamingIndexRef = useRef<number | null>(null);
  
  const { sendMessage } = useTerminalAI({
    onMessage: (content, isAI) => {
      if (isAI) {
        setHistory(prev => {
          const newHistory = [...prev];
          
          if (streamingIndexRef.current !== null && streamingIndexRef.current < newHistory.length) {
            newHistory[streamingIndexRef.current] = {
              type: 'output',
              content: `> ${content}`
            };
          } else {
            newHistory.push({ type: 'output', content: `> ${content}` });
            streamingIndexRef.current = newHistory.length - 1;
          }
          
          return newHistory;
        });
      }
    },
    onLoading: (loading) => {
      setIsWaitingForResponse(loading);
      if (!loading) {
        streamingIndexRef.current = null;
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  });

  const { executeCommand, replaceLastHistory } = useCommandExecutor(setHistory, setTheme, sendMessage);

  // Save conversation history when it changes
  useEffect(() => {
    const saveHistory = async () => {
      if (history.length > 0 && !isBooting) {
        try {
          await conversationStorage.saveConversation(history);
        } catch (error) {
          console.error('Failed to save conversation history:', error);
        }
      }
    };

    // Debounce saves to avoid excessive IndexedDB operations
    const timeoutId = setTimeout(saveHistory, 1000);
    return () => clearTimeout(timeoutId);
  }, [history, isBooting]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (terminalRef.current) {
      const element = terminalRef.current;
      element.scrollTop = element.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Also scroll after delays to catch typewriter and other async renders
    const timeouts = [
      setTimeout(scrollToBottom, 50),
      setTimeout(scrollToBottom, 100),
      setTimeout(scrollToBottom, 200),
      setTimeout(scrollToBottom, 500)
    ];
    
    return () => timeouts.forEach(clearTimeout);
  }, [history]);
  
  // Also scroll on any DOM mutations (for typewriter effect)
  useEffect(() => {
    if (!terminalRef.current) return;
    
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });
    
    observer.observe(terminalRef.current, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    return () => observer.disconnect();
  }, []);


  // Focus input after boot completes
  useEffect(() => {
    if (!isBooting && !workBrowserActive) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isBooting, workBrowserActive]);

  const { handleNavigation } = useTerminalNavigation(
    setHistory,
    executeCommand,
    replaceLastHistory,
    setTheme,
    inputRef,
    isBooting
  );


  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Prevent input while waiting for AI response
    if (isWaitingForResponse && e.key !== 'Escape') {
      e.preventDefault();
      return;
    }
    
    // Use the navigation hook for all browser navigation
    if (handleNavigation(e)) {
      return;
    }

    if (handleShortcut(e)) {
      return;
    }

    if (e.key === 'Enter') {
      if (input.trim()) {
        const trimmedInput = input.trim();
        
        if (!hasInteracted) setHasInteracted(true);

        // Handle history prompt
        if (showHistoryPrompt) {
          setHistory(prev => [...prev, { type: 'input', content: `> ${trimmedInput}` }]);
          
          if (trimmedInput === '1') {
            // Restore previous session
            if (savedHistory && savedHistory.length > 0) {
              // Filter out any undefined entries before restoring
              const filteredHistory = savedHistory.filter(Boolean);
              setHistory(filteredHistory);
              setHistory(prev => [...prev, { type: 'output', content: '> Previous session restored.' }]);
            }
          } else if (trimmedInput === '2') {
            // Start new session
            setHistory(prev => [...prev, { type: 'output', content: '> Starting new session.' }]);
          } else {
            setHistory(prev => [...prev, { type: 'output', content: '> Invalid option. Please choose 1 or 2.' }]);
            setInput('');
            return;
          }
          
          setShowHistoryPrompt(false);
          setSavedHistory(null);
          setInput('');
          return;
        }

        // Handle reset confirmation
        if (showResetConfirmation) {
          setHistory(prev => [...prev, { type: 'input', content: `> ${trimmedInput}` }]);
          
          if (trimmedInput.toLowerCase() === 'y' || trimmedInput.toLowerCase() === 'yes') {
            // Clear conversation history
            setHistory([]);
            conversationStorage.clearConversation().catch(console.error);
            setHistory(prev => [...prev, { type: 'output', content: '> Conversation history cleared.' }]);
          } else {
            setHistory(prev => [...prev, { type: 'output', content: '> Reset cancelled.' }]);
          }
          
          setShowResetConfirmation(false);
          setInput('');
          return;
        }

        setHistory(prev => [...prev, { type: 'input', content: `> ${trimmedInput}` }]);
        addCommand(trimmedInput);
        executeCommand(trimmedInput);
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
          className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide focus-blur"
        >
            {/* Boot sequence with blinking cursor */}
            {isBooting && showCursor && (
              <div className="flex items-center">
                <span className="mr-2">{'>'}</span>
                <span className="inline-block w-2 h-5 bg-green-400 animate-pulse"></span>
              </div>
            )}

            {/* Terminal history */}
            {!showCursor && history.filter(Boolean).map((entry, index) => (
              <div 
                key={index}
                className={clsx(
                  'whitespace-pre-wrap mb-1',
                  entry.type === 'input' ? 'text-yellow-300' : 'text-green-400'
                )}
              >
                {entry.typewriter && entry.type === 'output' ? (
                  <TypewriterText text={entry.content} />
                ) : (
                  entry.content
                )}
              </div>
            ))}
            
            {/* Input line */}
            {!isBooting && !workBrowserActive && (
              <TerminalInput
                ref={inputRef}
                value={input}
                onChange={setInput}
                onKeyDown={handleKeyDown}
                showPlaceholder={!hasInteracted && !showHistoryPrompt && !showResetConfirmation}
                disabled={isWaitingForResponse}
              />
            )}
            
            {/* Hidden focusable element for work browser navigation */}
            {!isBooting && workBrowserActive && !workBrowserVisible && (
              <div className="flex items-center text-yellow-300">
                <span className="mr-2">{'>'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 bg-transparent outline-none text-yellow-300 caret-transparent"
                  onKeyDown={handleKeyDown}
                  value=""
                  readOnly
                  autoFocus
                  onBlur={(e) => {
                    // Refocus if blur wasn't intentional (e.g., clicking elsewhere)
                    if (!e.relatedTarget) {
                      setTimeout(() => e.target.focus(), 0);
                    }
                  }}
                />
              </div>
            )}
        </div>
      </div>
      
      {/* Music Player */}
      <MusicPlayer 
        isActive={musicPlayerVisible}
        initialTrack={selectedTrack}
        onClose={() => setMusicPlayerVisible(false)}
      />
      
      {/* Work Browser */}
      <WorkBrowser
        isActive={workBrowserVisible}
        selectedProject={selectedProject}
        onClose={() => {
          setWorkBrowserVisible(false);
          // Go back to project list
          replaceLastHistory(formatWorkBrowser(selectedProject, false));
        }}
        setHistory={setHistory}
      />
      
      {/* Vim Mode */}
      <VimMode
        isActive={vimModeActive}
        onClose={() => {
          setVimModeActive(false);
          setHistory(prev => [...prev, { type: 'output', content: '> Exited vim.' }]);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      />
    </CRTEffect>
  );
}

export default function Terminal() {
  return (
    <TerminalProvider>
      <TerminalContent />
    </TerminalProvider>
  );
}