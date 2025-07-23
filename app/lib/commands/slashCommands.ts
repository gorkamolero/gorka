
type CommandHandler = (args: string[]) => string;

const commands: Record<string, CommandHandler> = {
  '/help': () => 'SHOW_HELP_BROWSER',

  '/about': () => `
╔═══════════════════════════════════════════╗
║        FULL-STACK ENGINEER                ║
╚═══════════════════════════════════════════╝

> Initializing profile...
> Loading experience matrix...

Full-Stack Engineer with a passion for:
  • Building elegant web experiences
  • AI/ML integration & exploration
  • Electronic music production
  • Creative coding intersections

Based between Madrid, Lisbon & Remote.

Current ventures:
  • Web Developer at Roadie
  • Co-founder at Maility (20K MRR)
  • QTZL - Latin electronic music netlabel
  • Various consulting projects

Interests beyond code:
  • Music production & DJing
  • Chess, BJJ & Boxing
  • Philosophy & meditation
  • Crypto & Web3 exploration

> Type /work to see projects
> Type /ai to chat about anything

> EOF
`,

  '/work': () => 'SHOW_WORK_BROWSER',

  '/music': () => 'SHOW_MUSIC_PLAYER',

  '/contact': () => `
╔═══════════════════════════════════════════╗
║        ESTABLISH CONNECTION               ║
╚═══════════════════════════════════════╝

> Opening secure channels...

GitHub:   github.com/gorkamolero
Studio:   bravura.studio
Location: Madrid / Lisbon / Remote

> Professional inquiries welcome
> Consulting opportunities available

> Type /ai to discuss projects
> Type /resume for full CV
`,

  '/skills': () => `
╔═══════════════════════════════════════════╗
║          TECHNICAL SKILLS                 ║
╚═══════════════════════════════════════════╝

LANGUAGES:
  [████████████████████] TypeScript/JavaScript
  [████████████████░░░░] Python
  [██████████████░░░░░░] Swift
  [████████████░░░░░░░░] C++

FRAMEWORKS:
  [████████████████████] Next.js/React
  [████████████████████] React Native
  [████████████████░░░░] Node.js/Express
  [██████████████░░░░░░] FastAPI
  
AI/ML:
  [████████████████░░░░] LangChain/LlamaIndex
  [████████████████░░░░] Transformers/Diffusers
  [██████████████░░░░░░] PyTorch/TensorFlow

CREATIVE:
  [████████████████████] Ableton Live
  [████████████████░░░░] Max/MSP
  [██████████████░░░░░░] TouchDesigner
  [████████████░░░░░░░░] GLSL Shaders

> Loading additional skills...
`,

  '/resume': () => 'SHOW_RESUME_BROWSER'
};

export function slashCommands(command: string, args: string[]): string {
  // Handle resume with format
  if (command === '/resume' && args.length > 0) {
    const format = args[0].toLowerCase();
    switch (format) {
      case 'pdf':
        return `
> Initiating download: gorka_molero_resume.pdf
> Format: PDF (Professional Layout)

[!] PDF generation in progress...
[!] For now, try: /resume txt or /resume json
`;
      case 'txt':
        return `
> Generating plain text resume...
> Accessing /api/resume?format=txt...

════════════════════════════════════════════

GORKA MOLERO
Full-Stack Engineer, Consultant & AI Enthusiast
Madrid / Lisbon / Remote

CONTACT
GitHub: github.com/gorkamolero
Studio: bravura.studio

SUMMARY
Full-Stack Engineer with expertise in modern web
technologies, AI integration, and creative coding.
Passionate about building elegant solutions that
bridge technology and human experience.

RECENT EXPERIENCE

Web Developer | Roadie
Dec 2023 - Present
• Building striking Backstage platform
• Modern UI patterns & performance optimization

Software Engineer | Typeshare.co
Nov 2022 - Dec 2023
• Led AI-first 2.0 version development
• Managed UI architecture with Tiptap editor

Co-founder & CTO | Maility
Nov 2022 - Present
• Grew to 20K MRR in 6 months
• Built scalable email automation platform

SKILLS
Languages: TypeScript, JavaScript, HTML/CSS, Python
Frontend: React, Next.js, Vue.js, Web Components
Backend: Node.js, T3 Stack, Firebase
AI/ML: Vercel AI SDK, LangChain, OpenAI API
Design: Figma, Webflow, Design Systems

INTERESTS
Music Production, Chess, BJJ/Boxing, Philosophy,
Travel, Crypto/Web3, Meditation

════════════════════════════════════════════

> Full resume: curl ${typeof window !== 'undefined' ? window.location.origin : ''}/api/resume?format=txt
`;
      case 'json':
        return `
> Exporting resume data as JSON...
> Accessing /api/resume?format=json...

{
  "name": "Gorka Molero",
  "title": "Senior Full-Stack Engineer & Digital Creator",
  "location": "Madrid, Spain",
  "contact": {
    "github": "github.com/gorkamolero",
    "studio": "bravura.studio"
  },
  "experience": [
    {
      "title": "Senior UI Engineer",
      "company": "Current Company",
      "period": "2022 - Present"
    },
    {
      "title": "Creative Technologist",
      "company": "Bravura Studio",
      "period": "2018 - Present"
    }
  ],
  "skills": {
    "languages": ["TypeScript", "JavaScript", "Python"],
    "frameworks": ["React", "Next.js", "Node.js"],
    "ai_ml": ["LangChain", "Transformers", "PyTorch"],
    "creative": ["Ableton", "Max/MSP", "TouchDesigner"]
  }
}

> Full JSON: curl ${typeof window !== 'undefined' ? window.location.origin : ''}/api/resume
`;
      default:
        return `Unknown format: ${format}\nAvailable formats: pdf, txt, json`;
    }
  }
  
  if (command in commands) {
    return commands[command](args);
  }
  
  return '';
}