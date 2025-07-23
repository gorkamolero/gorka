'use client';

import { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react';
import { handleCommand } from '../lib/commands';
import { useBootSequence } from '../hooks/useBootSequence';
import { useCommandHistory } from '../hooks/useCommandHistory';
import { useGeolocation } from '../hooks/useGeolocation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import CRTEffect from './CRTEffect';
import TypewriterText from './TypewriterText';
import clsx from 'clsx';
import { useTheme } from '../contexts/ThemeContext';
import { THEMES, Theme } from '../lib/themes';
import TerminalInput from './TerminalInput';
import MusicPlayer from './MusicPlayer';
import WorkBrowser, { formatWorkBrowser } from './WorkBrowser';
import { formatHelpBrowser } from './HelpBrowser';
import { formatResumeBrowser, RESUME_FORMATS } from './ResumeBrowser';
import VimMode from './VimMode';
import { useTerminalAI } from '../hooks/useTerminalAI';
import { formatMusicPlayer } from '../lib/terminal/formatters';
import { handleBrowserNavigation } from '../lib/terminal/browserHandlers';
import { ALL_COMMANDS } from '../lib/commands/availableCommands';
import { MUSIC_TRACKS } from '../lib/constants/music';
import { PROJECTS } from './WorkBrowser';
import { formatThemeBrowser, THEME_LIST } from './ThemeBrowser';
import { conversationStorage } from '../lib/storage/conversationStorage';

export default function Terminal() {
  const [input, setInput] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [musicPlayerActive, setMusicPlayerActive] = useState(false);
  const [musicPlayerVisible, setMusicPlayerVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [workBrowserActive, setWorkBrowserActive] = useState(false);
  const [workBrowserVisible, setWorkBrowserVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(0);
  const [helpBrowserActive, setHelpBrowserActive] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(0);
  const [resumeBrowserActive, setResumeBrowserActive] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [vimModeActive, setVimModeActive] = useState(false);
  const [themeBrowserActive, setThemeBrowserActive] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showHistoryPrompt, setShowHistoryPrompt] = useState(false);
  const [savedHistory, setSavedHistory] = useState<Array<{ type: 'input' | 'output'; content: string; typewriter?: boolean }> | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const userCity = useGeolocation();
  
  const handleBootComplete = useCallback(async (hasHistory: boolean) => {
    if (hasHistory) {
      setShowHistoryPrompt(true);
      try {
        const savedConversation = await conversationStorage.loadConversation();
        setSavedHistory(savedConversation);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    }
  }, []);
  
  const { history, setHistory, isBooting, showCursor } = useBootSequence(userCity, handleBootComplete);
  const { addCommand, navigateHistory } = useCommandHistory();
  const { setTheme } = useTheme();
  
  const closeAllBrowsers = () => {
    setHelpBrowserActive(false);
    // Don't close work browser - it should persist
    // setWorkBrowserActive(false);
    // setWorkBrowserVisible(false);
    setMusicPlayerActive(false);
    setResumeBrowserActive(false);
    setVimModeActive(false);
    setThemeBrowserActive(false);
  };
  
  const { handleShortcut } = useKeyboardShortcuts({ input, setInput, setHistory, inputRef, closeAllBrowsers });
  
  const streamingIndexRef = useRef<number | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  
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

  // This effect was removed - history loading is now handled through boot sequence

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


  useEffect(() => {
    if (!isBooting) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isBooting]);

  const executeCommand = (command: string) => {
    addCommand(command);
    const output = handleCommand(command);
    
    if (output === 'CLEAR_TERMINAL') {
      setHistory([]);
    } else if (output === 'SHOW_MUSIC_PLAYER') {
      closeAllBrowsers();
      setMusicPlayerActive(true);
      setSelectedTrack(0);
      const musicDisplay = formatMusicPlayer(0);
      replaceLastHistory(`> ${command}`);
      setHistory(prev => [...prev, { type: 'output', content: musicDisplay }]);
    } else if (output === 'SHOW_WORK_BROWSER') {
      closeAllBrowsers();
      setWorkBrowserActive(true);
      setSelectedProject(0);
      const workDisplay = formatWorkBrowser(0, false);
      replaceLastHistory(`> ${command}`);
      setHistory(prev => [...prev, { type: 'output', content: workDisplay }]);
    } else if (output === 'SHOW_HELP_BROWSER') {
      closeAllBrowsers();
      setHelpBrowserActive(true);
      setSelectedCommand(0);
      const helpDisplay = formatHelpBrowser(0);
      replaceLastHistory(`> ${command}`);
      setHistory(prev => [...prev, { type: 'output', content: helpDisplay }]);
    } else if (output === 'SHOW_RESUME_BROWSER') {
      closeAllBrowsers();
      setResumeBrowserActive(true);
      setSelectedFormat(0);
      const resumeDisplay = formatResumeBrowser(0);
      replaceLastHistory(`> ${command}`);
      setHistory(prev => [...prev, { type: 'output', content: resumeDisplay }]);
    } else if (output === 'SHOW_VIM_MODE') {
      closeAllBrowsers();
      setVimModeActive(true);
      setHistory(prev => [...prev, { type: 'output', content: '> Entering vim...' }]);
    } else if (output === 'SHOW_THEME_BROWSER') {
      closeAllBrowsers();
      setThemeBrowserActive(true);
      setSelectedTheme(0);
      const themeDisplay = formatThemeBrowser(0);
      replaceLastHistory(`> ${command}`);
      setHistory(prev => [...prev, { type: 'output', content: themeDisplay }]);
    } else if (output && typeof output === 'string' && output.startsWith('CHANGE_THEME:')) {
      const themeName = output.split(':')[1] as Theme;
      if (THEMES[themeName]) {
        setTheme(themeName);
        setHistory(prev => [...prev, { 
          type: 'output', 
          content: `> Theme changed to ${THEMES[themeName].name}\n> ${THEMES[themeName].description}` 
        }]);
      } else {
        setHistory(prev => [...prev, { 
          type: 'output', 
          content: `> Invalid theme: ${themeName}\n> Use /themes to see available themes` 
        }]);
      }
    } else if (output === 'RESET_CONVERSATION') {
      setShowResetConfirmation(true);
      setHistory(prev => [...prev, { type: 'output', content: '> Are you sure you want to clear all conversation history? (y/n)' }]);
    } else if (output && typeof output === 'object' && 'typewriter' in output) {
      setHistory(prev => [...prev, { type: 'output', content: output.content, typewriter: true }]);
    } else if (output) {
      setHistory(prev => [...prev, { type: 'output', content: output }]);
    } else {
      sendMessage(command);
    }
  };

  const replaceLastHistory = (content: string) => {
    setHistory(prev => {
      const newHistory = [...prev];
      if (newHistory.length > 0) {
        newHistory[newHistory.length - 1] = { type: 'output', content };
      }
      return newHistory;
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Prevent input while waiting for AI response
    if (isWaitingForResponse && e.key !== 'Escape') {
      e.preventDefault();
      return;
    }
    
    if (themeBrowserActive) {
      if (handleBrowserNavigation({
        e,
        selected: selectedTheme,
        setSelected: setSelectedTheme,
        setActive: setThemeBrowserActive,
        setHistory,
        formatter: formatThemeBrowser,
        maxItems: THEME_LIST.length,
        onEnter: () => {
          const themeName = THEME_LIST[selectedTheme];
          setThemeBrowserActive(false);
          setHistory(prev => [...prev, { 
            type: 'output', 
            content: `> ${THEMES[themeName].loadingMessage}` 
          }]);
          
          setTimeout(() => {
            setTheme(themeName);
            setHistory(prev => [...prev, { 
              type: 'output', 
              content: `> Theme changed to ${THEMES[themeName].name}` 
            }]);
          }, 1500);
        },
        onNumberKey: (index) => {
          const themeName = THEME_LIST[index];
          setThemeBrowserActive(false);
          setHistory(prev => [...prev, { 
            type: 'output', 
            content: `> ${THEMES[themeName].loadingMessage}` 
          }]);
          
          setTimeout(() => {
            setTheme(themeName);
            setHistory(prev => [...prev, { 
              type: 'output', 
              content: `> Theme changed to ${THEMES[themeName].name}` 
            }]);
          }, 1500);
        }
      })) {
        return;
      }
    }
    
    if (resumeBrowserActive) {
      if (handleBrowserNavigation({
        e,
        selected: selectedFormat,
        setSelected: setSelectedFormat,
        setActive: setResumeBrowserActive,
        setHistory,
        formatter: formatResumeBrowser,
        maxItems: RESUME_FORMATS.length,
        onEnter: () => {
          const format = RESUME_FORMATS[selectedFormat].id;
          setResumeBrowserActive(false);
          executeCommand(`/resume ${format}`);
        },
        onNumberKey: (index) => {
          const format = RESUME_FORMATS[index].id;
          setResumeBrowserActive(false);
          executeCommand(`/resume ${format}`);
        }
      })) {
        return;
      }
    }
    
    if (helpBrowserActive) {
      if (handleBrowserNavigation({
        e,
        selected: selectedCommand,
        setSelected: setSelectedCommand,
        setActive: setHelpBrowserActive,
        setHistory,
        formatter: formatHelpBrowser,
        maxItems: ALL_COMMANDS.length,
        onEnter: () => {
          setHelpBrowserActive(false);
          executeCommand(ALL_COMMANDS[selectedCommand]);
        },
        onNumberKey: (index) => {
          setHelpBrowserActive(false);
          executeCommand(ALL_COMMANDS[index]);
        }
      })) {
        return;
      }
    }
    
    if (workBrowserActive && !workBrowserVisible) {
      // Custom navigation for work browser that doesn't close on escape
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const newSelection = Math.max(0, selectedProject - 1);
        setSelectedProject(newSelection);
        replaceLastHistory(formatWorkBrowser(newSelection, false));
        return;
      }
      
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const newSelection = Math.min(PROJECTS.length - 1, selectedProject + 1);
        setSelectedProject(newSelection);
        replaceLastHistory(formatWorkBrowser(newSelection, false));
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        // Show project details in terminal
        replaceLastHistory(formatWorkBrowser(selectedProject, true));
        setWorkBrowserVisible(true);
        return;
      }
      
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < PROJECTS.length) {
          setSelectedProject(index);
          // Show project details in terminal
          replaceLastHistory(formatWorkBrowser(index, true));
          setWorkBrowserVisible(true);
          return;
        }
      }
      
      // Note: No escape/q handling - work browser stays persistent
    }
    
    if (musicPlayerActive) {
      if (handleBrowserNavigation({
        e,
        selected: selectedTrack,
        setSelected: setSelectedTrack,
        setActive: setMusicPlayerActive,
        setHistory,
        formatter: formatMusicPlayer,
        maxItems: MUSIC_TRACKS.length,
        onEnter: () => {
          const track = MUSIC_TRACKS[selectedTrack];
          setMusicPlayerVisible(true);
          setMusicPlayerActive(false);
          replaceLastHistory(`> Now playing: ${track.name}`);
        },
        onNumberKey: (index) => {
          const track = MUSIC_TRACKS[index];
          setSelectedTrack(index);
          setMusicPlayerVisible(true);
          setMusicPlayerActive(false);
          replaceLastHistory(`> Now playing: ${track.name}`);
        }
      })) {
        return;
      }
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
              setHistory(savedHistory);
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

        const output = handleCommand(trimmedInput);
        
        if (output === 'CLEAR_TERMINAL') {
          setHistory([]);
        } else if (output === 'SHOW_MUSIC_PLAYER') {
          closeAllBrowsers();
          setMusicPlayerActive(true);
          setSelectedTrack(0);
          const musicDisplay = formatMusicPlayer(0);
          setHistory(prev => {
            const newHistory = [...prev];
            // Remove any existing browser displays (those with box characters ╔═══)
            while (newHistory.length > 0 && 
                   newHistory[newHistory.length - 1].content.includes('╔═══')) {
              newHistory.pop();
            }
            newHistory.push({ type: 'output', content: musicDisplay });
            return newHistory;
          });
        } else if (output === 'SHOW_WORK_BROWSER') {
          closeAllBrowsers();
          setWorkBrowserActive(true);
          setSelectedProject(0);
          const workDisplay = formatWorkBrowser(0, false);
          setHistory(prev => {
            const newHistory = [...prev];
            // Remove any existing browser displays (those with box characters ╔═══)
            while (newHistory.length > 0 && 
                   newHistory[newHistory.length - 1].content.includes('╔═══')) {
              newHistory.pop();
            }
            newHistory.push({ type: 'output', content: workDisplay });
            return newHistory;
          });
        } else if (output === 'SHOW_HELP_BROWSER') {
          closeAllBrowsers();
          setHelpBrowserActive(true);
          setSelectedCommand(0);
          const helpDisplay = formatHelpBrowser(0);
          setHistory(prev => {
            const newHistory = [...prev];
            // Remove any existing browser displays (those with box characters ╔═══)
            while (newHistory.length > 0 && 
                   newHistory[newHistory.length - 1].content.includes('╔═══')) {
              newHistory.pop();
            }
            newHistory.push({ type: 'output', content: helpDisplay });
            return newHistory;
          });
        } else if (output === 'SHOW_RESUME_BROWSER') {
          closeAllBrowsers();
          setResumeBrowserActive(true);
          setSelectedFormat(0);
          const resumeDisplay = formatResumeBrowser(0);
          setHistory(prev => {
            const newHistory = [...prev];
            // Remove any existing browser displays (those with box characters ╔═══)
            while (newHistory.length > 0 && 
                   newHistory[newHistory.length - 1].content.includes('╔═══')) {
              newHistory.pop();
            }
            newHistory.push({ type: 'output', content: resumeDisplay });
            return newHistory;
          });
        } else if (output === 'SHOW_VIM_MODE') {
          closeAllBrowsers();
          setVimModeActive(true);
          setHistory(prev => [...prev, { type: 'output', content: '> Entering vim...' }]);
        } else if (output === 'SHOW_THEME_BROWSER') {
          closeAllBrowsers();
          setThemeBrowserActive(true);
          setSelectedTheme(0);
          const themeDisplay = formatThemeBrowser(0);
          setHistory(prev => {
            const newHistory = [...prev];
            // Remove any existing browser displays (those with box characters ╔═══)
            while (newHistory.length > 0 && 
                   newHistory[newHistory.length - 1].content.includes('╔═══')) {
              newHistory.pop();
            }
            newHistory.push({ type: 'output', content: themeDisplay });
            return newHistory;
          });
        } else if (output && typeof output === 'string' && output.startsWith('CHANGE_THEME:')) {
          const themeName = output.split(':')[1] as Theme;
          if (THEMES[themeName]) {
            setTheme(themeName);
            setHistory(prev => [...prev, { 
              type: 'output', 
              content: `> Theme changed to ${THEMES[themeName].name}\n> ${THEMES[themeName].description}` 
            }]);
          } else {
            setHistory(prev => [...prev, { 
              type: 'output', 
              content: `> Invalid theme: ${themeName}\n> Use /themes to see available themes` 
            }]);
          }
        } else if (output === 'RESET_CONVERSATION') {
          setShowResetConfirmation(true);
          setHistory(prev => [...prev, { type: 'output', content: '> Are you sure you want to clear all conversation history? (y/n)' }]);
        } else if (output && typeof output === 'object' && 'typewriter' in output) {
          setHistory(prev => [...prev, { type: 'output', content: output.content, typewriter: true }]);
        } else if (output) {
          setHistory(prev => [...prev, { type: 'output', content: output }]);
        } else {
          sendMessage(trimmedInput);
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
            {!showCursor && history.map((entry, index) => (
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
            {!isBooting && !workBrowserVisible && (
              <TerminalInput
                ref={inputRef}
                value={input}
                onChange={setInput}
                onKeyDown={handleKeyDown}
                showPlaceholder={!hasInteracted && !showHistoryPrompt && !showResetConfirmation}
                disabled={isWaitingForResponse}
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