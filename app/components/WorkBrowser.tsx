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
      'Bitcoin L1 RPG powered by DMT-Unats',
      'Turn-based PvP combat like old Pokémon',
      'Multiple species with unique abilities',
      'The blockchain shapes the universe'
    ],
    tech: 'Blockchain, procedural generation, game design',
    link: 'degens.space',
    image: '/images/degens.gif'
  },
  {
    name: 'Cybertantra',
    brief: 'Cyber-guru trained on 100+ hours of material',
    description: [
      'RTT Yoga School teachings',
      'Nietzsche-style philosopher',
      'Digital consciousness exploration',
      'Ancient wisdom meets AI'
    ],
    tech: 'LLMs, philosophical knowledge base',
    github: 'github.com/gorkamolero/cybertantra',
    image: '/images/cybertantra.png'
  },
  {
    name: 'Music Production',
    brief: 'Electronic music & Flamenco Cyberpunk',
    description: [
      'Solo electronic compositions',
      'Producing Gitano de Palo',
      'Album released last year',
      'Type /music to listen'
    ],
    tech: 'Ableton, synthesis, production',
    image: '/images/music-production.gif'
  },
  {
    name: 'The Pulse',
    brief: 'Non-linear storytelling engine',
    description: [
      'Inspired by Lovecraft\'s "Shadow Over Innsmouth"',
      'Separates narrative structure from sequential plot',
      'Voice dictation + AI-generated imagery',
      'Built, fantastic, underappreciated'
    ],
    tech: 'TypeScript, React, AI/ML',
    link: 'thepulse.app',
    github: 'github.com/gorkamolero/the-pulse',
    image: '/images/the-pulse.png'
  },
  {
    name: 'Translation Platform',
    brief: 'AI-powered translation tools',
    description: [
      'Multi-language support',
      'Context-aware translations',
      'Technical documentation focus',
      'Private deployment'
    ],
    tech: 'GPT-4, Next.js, i18n',
    image: '/images/translation.png'
  },
  {
    name: '777 Leftover Squawk',
    brief: '24-hour radio created as bhakti to Matangi',
    description: [
      'Music interrupted by dark stories',
      'Submit stories to burn in Matangi\'s pile',
      'Cathartic release through frequency',
      'Where darkness meets sound'
    ],
    tech: 'Streaming architecture, story system',
    link: '777leftoversquawk.vercel.app',
    image: '/images/777-radio.gif'
  }
];

interface WorkBrowserProps {
  isActive: boolean;
  selectedProject: number;
  onClose: () => void;
}

export default function WorkBrowser({ isActive, selectedProject, onClose }: WorkBrowserProps) {
  const [showModal, setShowModal] = useState(false);
  const project = PROJECTS[selectedProject];

  useEffect(() => {
    if (!isActive) {
      setShowModal(false);
    }
  }, [isActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      if (showModal) {
        if (e.key === 'Escape') {
          setShowModal(false);
        } else if (e.key === '1' && project.link) {
          window.open(`https://${project.link}`, '_blank');
          setShowModal(false);
        } else if (e.key === '2' && project.github && project.link) {
          window.open(`https://${project.github}`, '_blank');
          setShowModal(false);
        } else if (e.key === '1' && project.github && !project.link) {
          window.open(`https://${project.github}`, '_blank');
          setShowModal(false);
        }
      } else {
        if (e.key === 'Enter') {
          setShowModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, showModal, onClose, project]);

  if (!isActive) return null;

  return (
    <>
      {/* Project Preview Image */}
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

      {/* Modal for project selection */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="border-2 border-green-400 bg-black p-6 max-w-md">
            <div className="text-green-400 font-mono">
              <h3 className="text-lg mb-4">╔═══ {project.name.toUpperCase()} ═══╗</h3>
              <div className="space-y-2 mb-4">
                {project.link && (
                  <div className="cursor-pointer hover:bg-green-400 hover:text-black p-2" 
                       onClick={() => window.open(`https://${project.link}`, '_blank')}>
                    [1] Visit Live Project → {project.link}
                  </div>
                )}
                {project.github && (
                  <div className="cursor-pointer hover:bg-green-400 hover:text-black p-2"
                       onClick={() => window.open(`https://${project.github}`, '_blank')}>
                    [{project.link ? '2' : '1'}] View Source Code → {project.github}
                  </div>
                )}
                {!project.link && !project.github && (
                  <div className="p-2 text-gray-500">
                    [NO LINKS AVAILABLE]
                  </div>
                )}
              </div>
              <div className="text-xs mt-4">
                Press [ESC] to close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function formatWorkBrowser(selected: number, showDetails: boolean): string {
  if (showDetails) {
    const project = PROJECTS[selected];
    return `╔═══════════════════════════════════════════╗
║              ${project.name.toUpperCase().padEnd(29)}║
╚═══════════════════════════════════════════╝

${project.description.map(line => `  ${line}`).join('\n')}

  Tech: ${project.tech}
${project.link ? `\n  Live: ${project.link}` : ''}
${project.github ? `\n  Code: ${project.github}` : ''}

> [Enter] Choose destination | [q/Esc] Back to list`;
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