
type CommandHandler = (args: string[]) => string;

const commands: Record<string, CommandHandler> = {
  '/help': () => 'SHOW_HELP_BROWSER',

  '/about': () => `
╔═══════════════════════════════════════════╗
║          DIGITAL ALCHEMIST                ║
╚═══════════════════════════════════════════╝

> Accessing consciousness.ln...
> Decrypting multidimensional persona...

I traverse many realms:
  • Engineering digital experiences
  • Producing electronic frequencies  
  • Experimenting with artificial minds

Senior Full-Stack Engineer by day.
Musical architect by night.
AI explorer in between dimensions.

Currently manifesting at:
  • UI Engineering in the corporate realm
  • QTZL - Transatlantic musical collective
  • Various experiments in digital consciousness

> What brings you to my terminal?

> EOF
`,

  '/work': () => 'SHOW_WORK_BROWSER',

  '/music': () => 'SHOW_MUSIC_PLAYER',

  '/contact': () => `
╔═══════════════════════════════════════════╗
║        ESTABLISH CONNECTION               ║
╚═══════════════════════════════════════════╝

> Opening secure channels...

GitHub:   github.com/gorkamolero
Studio:   bravura.studio
Location: Madrid, Spain

> Additional frequencies available upon request
> Encrypted channels for sensitive transmissions

> Type /ai to speak with my digital twin
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
Senior Full-Stack Engineer & Digital Creator
Madrid, Spain

CONTACT
GitHub: github.com/gorkamolero
Studio: bravura.studio

SUMMARY
Senior Full-Stack Engineer with 10+ years crafting
digital experiences at the intersection of technology
and creativity. Specialized in modern web technologies,
AI/ML integration, and creative coding.

EXPERIENCE

Senior UI Engineer | Current Company
2022 - Present
• Lead frontend architecture for enterprise applications
• Implement AI-powered features using LangChain
• Mentor junior developers and establish standards
• Optimize performance (40% faster load times)

Full-Stack Developer | Previous Company  
2019 - 2022
• Built real-time collaborative platforms
• Developed microservices architecture
• Integrated ML models for user behavior analysis
• Led migration from legacy systems

Creative Technologist | Bravura Studio
2018 - Present
• Develop interactive installations
• Create generative music systems
• Design creative coding workshops
• Collaborate with artists on digital projects

SKILLS
Languages: TypeScript, JavaScript, Python, Swift, C++
Frontend: React, Next.js, React Native, Three.js, WebGL
Backend: Node.js, Express, FastAPI, PostgreSQL, Redis
AI/ML: LangChain, Transformers, PyTorch, OpenAI API
Creative: Ableton Live, Max/MSP, TouchDesigner, GLSL

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