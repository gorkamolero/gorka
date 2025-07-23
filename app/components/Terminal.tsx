'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
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
  const [showThemeSpinner, setShowThemeSpinner] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const userCity = useGeolocation();
  const { history, setHistory, isBooting, showCursor } = useBootSequence(userCity);
  const { addCommand, navigateHistory } = useCommandHistory();
  const { theme, setTheme } = useTheme();
  
  const closeAllBrowsers = () => {
    setHelpBrowserActive(false);
    setWorkBrowserActive(false);
    setWorkBrowserVisible(false);
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

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);


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
      if (handleBrowserNavigation({
        e,
        selected: selectedProject,
        setSelected: setSelectedProject,
        setActive: (active) => {
          setWorkBrowserActive(active);
          setWorkBrowserVisible(active);
        },
        setHistory,
        formatter: (sel) => formatWorkBrowser(sel, false),
        maxItems: PROJECTS.length,
        onEnter: () => {
          // Show project details in terminal
          replaceLastHistory(formatWorkBrowser(selectedProject, true));
          setWorkBrowserVisible(true);
          // Keep workBrowserActive true so WorkBrowser can handle keyboard events
        },
        onNumberKey: (index) => {
          setSelectedProject(index);
          // Show project details in terminal
          replaceLastHistory(formatWorkBrowser(index, true));
          setWorkBrowserVisible(true);
          // Keep workBrowserActive true so WorkBrowser can handle keyboard events
        }
      })) {
        return;
      }
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
            while (newHistory.length > 0 && 
                   (newHistory[newHistory.length - 1].content.includes('COMMANDS') ||
                    newHistory[newHistory.length - 1].content.includes('MUSIC') ||
                    newHistory[newHistory.length - 1].content.includes('WORK & PROJECTS'))) {
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
            while (newHistory.length > 0 && 
                   (newHistory[newHistory.length - 1].content.includes('COMMANDS') ||
                    newHistory[newHistory.length - 1].content.includes('MUSIC') ||
                    newHistory[newHistory.length - 1].content.includes('WORK & PROJECTS'))) {
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
            while (newHistory.length > 0 && 
                   (newHistory[newHistory.length - 1].content.includes('COMMANDS') ||
                    newHistory[newHistory.length - 1].content.includes('MUSIC') ||
                    newHistory[newHistory.length - 1].content.includes('WORK & PROJECTS'))) {
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
            while (newHistory.length > 0 && 
                   (newHistory[newHistory.length - 1].content.includes('COMMANDS') ||
                    newHistory[newHistory.length - 1].content.includes('MUSIC') ||
                    newHistory[newHistory.length - 1].content.includes('WORK & PROJECTS') ||
                    newHistory[newHistory.length - 1].content.includes('RESUME'))) {
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
            while (newHistory.length > 0 && 
                   (newHistory[newHistory.length - 1].content.includes('THEMES') ||
                    newHistory[newHistory.length - 1].content.includes('COMMANDS') ||
                    newHistory[newHistory.length - 1].content.includes('MUSIC') ||
                    newHistory[newHistory.length - 1].content.includes('WORK & PROJECTS'))) {
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
                showPlaceholder={!hasInteracted}
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