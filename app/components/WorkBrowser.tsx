'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Project {
  name: string;
  brief: string;
  description: string[];
  tech: string;
  link?: string;
  github?: string;
  image?: string;
}

const PROJECTS: Project[] = [
  {
    name: 'Degens in Space',
    brief: 'Blockchain-generated universe game',
    description: [
      'bitcoin rpg that shouldn\'t work but does',
      'turn-based pvp like classic pokémon',
      'multiple species, procedural universe',
      'the blockchain literally shapes reality',
      'play at degens.space'
    ],
    tech: 'Blockchain, procedural generation, game design',
    link: 'degens.space',
    github: 'ask-to-get-access',
    image: '/images/degens.gif'
  },
  {
    name: 'Cybertantra',
    brief: 'Command-line philosophical dialogue system',
    description: [
      'CLI interface for consciousness exploration',
      'Trained on tantra and philosophy',
      'RTT Yoga School teachings',
      'Digital philosopher & consciousness explorer'
    ],
    tech: 'Bun, AI SDK, Mastra, Claude Opus 4',
    github: 'github.com/gorkamolero/cybertantra',
    image: '/images/cybertantra.png'
  },
  {
    name: 'Music Production',
    brief: 'Electronic music & Flamenco Cyberpunk',
    description: [
      'electronic music production and composition',
      'solo music',
      'flamenco cyberpunk isn\'t a genre yet',
      'but i\'m working on it'
    ],
    tech: 'Ableton, synthesis, production',
    image: '/images/music-production.gif'
  },
  {
    name: 'The Pulse',
    brief: 'Non-linear storytelling engine',
    description: [
      'non-linear story engine',
      'separates structure from plot',
      'shadow over innsmouth was the test case',
      'voice dictation + generated imagery',
      'best thing i built that no one uses'
    ],
    tech: 'TypeScript, React, AI/ML',
    link: 'thepulse.app',
    github: 'github.com/gorkamolero/the-pulse',
    image: '/images/the-pulse.png'
  },
  {
    name: 'Codex',
    brief: 'Decode the past - ancient language translator',
    description: [
      'Translating ancient tantras and texts',
      'Currently working on Matangi Mahavidya',
      'Gemini for OCR (better than Claude 4!)',
      'Grok4 & Claude4 for translations'
    ],
    tech: 'Gemini OCR, Grok4/Claude4, AISDK',
    github: 'github.com/gorkamolero/codex',
    image: '/images/codex.png'
  },
  {
    name: '777 Leftover Squawk',
    brief: 'Poetic dark horror radio - bhakti to Matangi',
    description: [
      'An experience: poetic, dark, horror, radio',
      'Built as bhakti (devotion) to Matangi',
      'Users submit stories to burn in the pile',
      'Music interrupted by darkness & poetry'
    ],
    tech: 'Next.js, Web Audio APIs, Redis playlists',
    link: '777leftoversquawk.vercel.app',
    image: '/images/777LEFTOVERSQUAWK.jpeg'
  }
];

interface WorkBrowserProps {
  isActive: boolean;
  selectedProject: number;
  onClose: () => void;
  setHistory?: any;
}

export default function WorkBrowser({ isActive, selectedProject, onClose, setHistory }: WorkBrowserProps) {
  const project = PROJECTS[selectedProject];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      const openLink = (url: string) => {
        if (!setHistory) return;
        
        onClose();
        
        // Add spinner to history
        setHistory((prev: any) => [...prev, { 
          type: 'output', 
          content: `> [●∙∙]` 
        }]);
        
        // Animate spinner
        let dots = ['●', '∙', '∙'];
        const spinnerInterval = setInterval(() => {
          const activeIndex = dots.findIndex(dot => dot === '●');
          dots = ['∙', '∙', '∙'];
          dots[(activeIndex + 1) % 3] = '●';
          
          setHistory((prev: any) => {
            const newHistory = [...prev];
            if (newHistory.length > 0 && newHistory[newHistory.length - 1].content.includes('[')) {
              newHistory[newHistory.length - 1] = {
                type: 'output',
                content: `> [${dots.join('')}]`
              };
            }
            return newHistory;
          });
        }, 150);
        
        // Open link after 1 second
        setTimeout(() => {
          clearInterval(spinnerInterval);
          window.open(url, '_blank');
          
          // Remove spinner line
          setHistory((prev: any) => {
            const newHistory = [...prev];
            if (newHistory.length > 0 && newHistory[newHistory.length - 1].content.includes('[')) {
              newHistory.pop();
            }
            return newHistory;
          });
        }, 1000);
      };

      if (e.key === 'Escape' || e.key === 'q') {
        // Just close the WorkBrowser component, don't close the entire work browser
        onClose();
      } else if (e.key === '1' && project.link) {
        openLink(`https://${project.link}`);
      } else if (e.key === '2' && project.github && project.link) {
        if (project.github === 'ask-to-get-access') {
          // Do nothing - just a tease
          return;
        }
        openLink(`https://${project.github}`);
      } else if (e.key === '1' && project.github && !project.link) {
        if (project.github === 'ask-to-get-access') {
          // Do nothing - just a tease
          return;
        }
        openLink(`https://${project.github}`);
      } else if (e.key === '3' && project.name === 'Codex') {
        // Special case for Codex - third link
        openLink('https://github.com/gorkamolero/tantras');
      } else if (e.key === '2' && project.name === 'Codex' && !project.link) {
        // Codex tantras repo when there's no live link
        openLink('https://github.com/gorkamolero/tantras');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose, project, setHistory]);

  if (!isActive) return null;

  return (
    <>
      {/* Project Preview Image - always show when WorkBrowser is active */}
      <div className="fixed top-20 right-10 z-50 border-2 border-green-400 bg-black p-2 shadow-2xl">
        <div className="relative w-80 h-60 bg-black">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.name}
              fill
              className="object-cover pixelated"
              unoptimized={project.image.endsWith('.gif')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-green-400">
              <span className="text-4xl font-mono">[NO PREVIEW]</span>
            </div>
          )}
        </div>
        <div className="mt-2 text-green-400 text-xs font-mono text-center">
          {project.name}
        </div>
      </div>
    </>
  );
}

export function formatWorkBrowser(selected: number, showDetails: boolean): string {
  if (showDetails) {
    const project = PROJECTS[selected];
    let display = `╔═══════════════════════════════════════════╗
║              ${project.name.toUpperCase().padEnd(29)}║
╚═══════════════════════════════════════════╝

${project.description.map(line => `  ${line}`).join('\n')}

  Tech: ${project.tech}

`;
    
    if (project.link || project.github) {
      display += '\n  Links:\n';
      let linkNum = 1;
      if (project.link) {
        display += `  [${linkNum}] Live → ${project.link}\n`;
        linkNum++;
      }
      if (project.github) {
        if (project.github === 'ask-to-get-access') {
          display += `  [${linkNum}] Repo → [ask to get access]\n`;
        } else {
          display += `  [${linkNum}] GitHub → ${project.github}\n`;
        }
        linkNum++;
      }
      // Special case for Codex - add tantras repo
      if (project.name === 'Codex') {
        display += `  [${linkNum}] Tantras → github.com/gorkamolero/tantras\n`;
      }
      display += '\n';
    }
    
    display += `> [q/Esc] Back to list`;
    
    return display;
  }

  let display = `╔═══════════════════════════════════════════╗
║              WORK & PROJECTS              ║
╚═══════════════════════════════════════════╝

`;
  
  PROJECTS.forEach((project, index) => {
    const isSelected = index === selected;
    const prefix = isSelected ? '▶' : ' ';
    display += `${prefix} [${index + 1}] ${project.name}\n`;
    if (isSelected) {
      display += `     └─ ${project.brief}\n`;
    }
  });
  
  display += `
> [↑/↓ or j/k] Navigate | [Enter] View details | [q] Exit`;
  
  return display;
}

export { PROJECTS };