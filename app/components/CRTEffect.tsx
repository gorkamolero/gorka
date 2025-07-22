'use client';

import { ReactNode } from 'react';

interface CRTEffectProps {
  children: ReactNode;
}

export default function CRTEffect({ children }: CRTEffectProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Tron-style grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full tron-grid"></div>
      </div>

      {/* Screen curvature */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="w-full h-full crt-curve"></div>
      </div>
      
      {/* Main content with chromatic aberration */}
      <div className="relative z-10 w-full h-full crt-content">
        {children}
      </div>
      
      {/* CRT effects overlay */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Scanlines */}
        <div className="scanlines"></div>
        
        {/* Screen flicker */}
        <div className="flicker"></div>
        
        {/* Vignette */}
        <div className="vignette"></div>
        
        {/* RGB shift lines */}
        <div className="rgb-lines"></div>
      </div>
      
      {/* Glow effect */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="w-full h-full bg-green-400/20 blur-[100px]"></div>
      </div>
    </div>
  );
}