'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { MUSIC_TRACKS } from '../lib/constants/music';

interface MusicPlayerProps {
  isActive: boolean;
  initialTrack?: number;
  onClose: () => void;
}

export default function MusicPlayer({ isActive, initialTrack = 0, onClose }: MusicPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState(initialTrack);
  const [selectedTrack, setSelectedTrack] = useState(initialTrack); // For navigation
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [player, setPlayer] = useState<any>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update current track when initialTrack changes
  useEffect(() => {
    setCurrentTrack(initialTrack);
    setSelectedTrack(initialTrack);
  }, [initialTrack]);

  // Scroll selected track into view
  useEffect(() => {
    if (trackRefs.current[selectedTrack]) {
      trackRefs.current[selectedTrack]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [selectedTrack]);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : '';
  };

  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      controls: 0,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      disablekb: 1,
    },
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    setIsPlaying(true);
    setIsLoading(false);
  };

  const onEnd: YouTubeProps['onEnd'] = () => {
    // Play next track
    const nextTrack = (currentTrack + 1) % MUSIC_TRACKS.length;
    setCurrentTrack(nextTrack);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // YouTube Player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    setIsPlaying(event.data === 1);
    if (event.data === 3) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  };

  const playTrack = useCallback((index: number) => {
    if (index !== currentTrack) {
      setIsLoading(true);
    }
    setCurrentTrack(index);
    setSelectedTrack(index);
    setIsPlaying(true);
  }, [currentTrack]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive || isMinimized) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          setSelectedTrack(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          setSelectedTrack(prev => Math.min(MUSIC_TRACKS.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          // Play the selected track
          playTrack(selectedTrack);
          break;
        case ' ':
          e.preventDefault();
          if (player) {
            if (isPlaying) {
              player.pauseVideo();
            } else {
              player.playVideo();
            }
            setIsPlaying(!isPlaying);
          }
          break;
        case 'Escape':
        case 'q':
          e.preventDefault();
          onClose();
          break;
        case 'Tab':
          e.preventDefault();
          // Return focus to terminal without closing player
          document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
          break;
        case 'c':
          if (e.ctrlKey) {
            e.preventDefault();
            // Return focus to terminal without closing player
            document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, isMinimized, player, isPlaying, selectedTrack, onClose, playTrack]);

  if (!isActive) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${isMinimized ? 'w-auto' : 'w-[320px]'}`}>
      <div className="bg-black border-2 border-green-400 rounded-lg overflow-hidden shadow-2xl" 
           style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-green-400 bg-black">
          <span className="text-green-400 text-xs font-mono">♪ PLAYER</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-green-400 hover:text-yellow-300 transition-colors"
            >
              {isMinimized ? '□' : '_'}
            </button>
            <button 
              onClick={onClose}
              className="text-green-400 hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Hidden YouTube Player */}
            <div className="hidden">
              <YouTube
                key={currentTrack} // Force remount when track changes
                videoId={getVideoId(MUSIC_TRACKS[currentTrack].url)}
                opts={opts}
                onReady={onReady}
                onEnd={onEnd}
                onStateChange={onStateChange}
              />
            </div>

            {/* Now Playing */}
            <div className="bg-black p-3 border-b border-green-400">
              <div className="text-green-400 text-xs font-mono">NOW PLAYING:</div>
              <div className="text-yellow-300 text-sm font-mono mt-1">
                {MUSIC_TRACKS[currentTrack].name}
                {isLoading && <span className="ml-2 text-green-400">Loading...</span>}
              </div>
              <div className="text-green-400 text-xs font-mono opacity-70 mt-1">
                {MUSIC_TRACKS[currentTrack].description}
              </div>
            </div>

            {/* Audio Controls */}
            <div className="bg-black p-2 border-b border-green-400 flex items-center justify-center gap-4">
              <button 
                onClick={() => {
                  const prevTrack = (currentTrack - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
                  setCurrentTrack(prevTrack);
                }}
                className="text-green-400 hover:text-yellow-300 transition-colors"
              >
                ◄◄
              </button>
              <button 
                onClick={() => {
                  if (player) {
                    if (isPlaying) {
                      player.pauseVideo();
                    } else {
                      player.playVideo();
                    }
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="text-green-400 hover:text-yellow-300 transition-colors text-xl"
              >
                {isPlaying ? '▌▌' : '▶'}
              </button>
              <button 
                onClick={() => {
                  const nextTrack = (currentTrack + 1) % MUSIC_TRACKS.length;
                  setCurrentTrack(nextTrack);
                }}
                className="text-green-400 hover:text-yellow-300 transition-colors"
              >
                ►►
              </button>
            </div>

            {/* Track List */}
            <div className="bg-black border-t border-green-400 overflow-y-auto" style={{ maxHeight: '200px' }}>
              {MUSIC_TRACKS.map((track, index) => (
                <div key={index}>
                  {/* Add section headers */}
                  {index === 0 && (
                    <div className="text-green-400 text-xs font-mono px-3 pt-2 pb-1 opacity-70">
                      ─── PIANO ───
                    </div>
                  )}
                  {index === 2 && (
                    <div className="text-green-400 text-xs font-mono px-3 pt-2 pb-1 opacity-70">
                      ─── ELECTRONIC ───
                    </div>
                  )}
                  {index === 4 && (
                    <div className="text-green-400 text-xs font-mono px-3 pt-2 pb-1 opacity-70">
                      ─── PRODUCTION ───
                    </div>
                  )}
                  <div
                    ref={el => { trackRefs.current[index] = el; }}
                    onClick={() => playTrack(index)}
                    className={`px-3 py-2 cursor-pointer transition-all text-xs font-mono
                      ${selectedTrack === index 
                        ? 'bg-black text-yellow-300 border-l-2 border-yellow-300' 
                        : 'text-green-400 hover:text-yellow-300'
                      }`}
                  >
                    <span className="mr-2">{currentTrack === index ? '▶' : selectedTrack === index ? '›' : ' '}</span>
                    [{index + 1}] {track.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="bg-black border-t border-green-400 p-2 text-center">
              <div className="text-green-400 text-xs font-mono opacity-70">
                [↑/↓] Navigate | [Enter] Play | [Space] Pause | [Tab/Ctrl+C] Terminal | [q] Close
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}