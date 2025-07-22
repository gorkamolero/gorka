'use client';

import { useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { MUSIC_TRACKS } from '../lib/constants/music';

interface MusicPlayerProps {
  isActive: boolean;
  initialTrack?: number;
  onClose: () => void;
}

export default function MusicPlayer({ isActive, initialTrack = 0, onClose }: MusicPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState(initialTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [player, setPlayer] = useState<any>(null);

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
  };

  const onEnd: YouTubeProps['onEnd'] = () => {
    // Play next track
    const nextTrack = (currentTrack + 1) % MUSIC_TRACKS.length;
    setCurrentTrack(nextTrack);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // YouTube Player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    setIsPlaying(event.data === 1);
  };

  const playTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
  };

  if (!isActive) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${isMinimized ? 'w-auto' : 'w-[320px]'}`}>
      <div className="bg-black border-2 border-green-400 rounded-lg overflow-hidden shadow-2xl" 
           style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-green-400 bg-black">
          <span className="text-green-400 text-xs font-mono">♪ MUSIC PLAYER</span>
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
            <div className="bg-black border-t border-green-400 max-h-48 overflow-y-auto">
              {MUSIC_TRACKS.map((track, index) => (
                <div
                  key={index}
                  onClick={() => playTrack(index)}
                  className={`px-3 py-2 cursor-pointer transition-all text-xs font-mono
                    ${currentTrack === index 
                      ? 'bg-green-400 bg-opacity-20 text-yellow-300' 
                      : 'text-green-400 hover:bg-green-400 hover:bg-opacity-10'
                    }`}
                >
                  <span className="mr-2">{currentTrack === index ? '▶' : ' '}</span>
                  [{index + 1}] {track.name}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="bg-black border-t border-green-400 p-2 text-center">
              <div className="text-green-400 text-xs font-mono opacity-70">
                Click track to play | [_] Minimize | [✕] Close
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}