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

export default function Terminal() {
  const [input, setInput] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [musicPlayerActive, setMusicPlayerActive] = useState(false);
  const [musicPlayerVisible, setMusicPlayerVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [workBrowserActive, setWorkBrowserActive] = useState(false);
  const [workBrowserVisible, setWorkBrowserVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(0);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [helpBrowserActive, setHelpBrowserActive] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(0);
  const [resumeBrowserActive, setResumeBrowserActive] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [vimModeActive, setVimModeActive] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const userCity = useGeolocation();
  const { history, setHistory, isBooting, showCursor } = useBootSequence(userCity);
  const { addCommand, navigateHistory } = useCommandHistory();
  
  const closeAllBrowsers = () => {
    setHelpBrowserActive(false);
    setWorkBrowserActive(false);
    setWorkBrowserVisible(false);
    setShowProjectDetails(false);
    setMusicPlayerActive(false);
    setResumeBrowserActive(false);
    setVimModeActive(false);
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
      setShowProjectDetails(false);
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
    
    if (workBrowserActive && !showProjectDetails) {
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
          setShowProjectDetails(true);
          setWorkBrowserVisible(true);
          replaceLastHistory(formatWorkBrowser(selectedProject, true));
        },
        onNumberKey: (index) => {
          setSelectedProject(index);
          setShowProjectDetails(true);
          setWorkBrowserVisible(true);
          replaceLastHistory(formatWorkBrowser(index, true));
        }
      })) {
        return;
      }
    }
    
    if (workBrowserActive && showProjectDetails) {
      if (e.key === 'Escape' || e.key === 'q') {
        e.preventDefault();
        setShowProjectDetails(false);
        replaceLastHistory(formatWorkBrowser(selectedProject, false));
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
          setShowProjectDetails(false);
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
          setWorkBrowserActive(false);
        }}
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