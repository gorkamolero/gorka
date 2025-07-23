
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
  [██████████████░░░░░░] Rust
  [████████████░░░░░░░░] Go

FRAMEWORKS:
  [████████████████████] Next.js/React
  [████████████████░░░░] Node.js
  [██████████████░░░░░░] FastAPI
  
AI/ML:
  [████████████████░░░░] LangChain
  [████████████████░░░░] Transformers
  [██████████████░░░░░░] PyTorch

> Loading additional skills...
`,

  '/resume': () => `
╔═══════════════════════════════════════════╗
║              RESUME                       ║
╚═══════════════════════════════════════════╝

> Generating secure download link...
> Encrypting connection...
> Ready.

📄 Resume available in multiple formats:

[1] PDF Format (Recommended)
    └─ Professional layout
    └─ ATS-friendly
    └─ Download: /resume pdf

[2] Plain Text Format
    └─ Terminal-friendly
    └─ Maximum compatibility
    └─ Download: /resume txt

[3] JSON Format
    └─ Machine readable
    └─ API-friendly
    └─ Download: /resume json

> Type /resume [format] to download
`
};

export function slashCommands(command: string, args: string[]): string {
  // Handle resume with format
  if (command === '/resume' && args.length > 0) {
    const format = args[0].toLowerCase();
    switch (format) {
      case 'pdf':
        return `
> Initiating download: gorka_resume_2024.pdf
> Size: 127KB
> Transfer complete.

[!] Check your downloads folder
[!] If download didn't start, refresh and try again
`;
      case 'txt':
        return `
> Generating plain text resume...
> Formatting complete.

════════════════════════════════════════════

GORKA MOLERO
Digital Alchemist | Senior Full-Stack Engineer

[Contact]
Location: Madrid, Spain
GitHub: github.com/gorkamolero
Studio: bravura.studio

[Current Manifestations]
• Senior UI Engineer - Corporate Realm
• Music Producer - QTZL Collective  
• AI Explorer - Various Experiments

[Technical Arsenal]
• Languages: TypeScript, JavaScript, Python
• Frameworks: React, Next.js, Node.js
• AI/ML: LangChain, Transformers, LLMs
• Music: Ableton, Max/MSP, AI Synthesis

════════════════════════════════════════════

> Copy the text above or type /resume pdf for formatted version
`;
      case 'json':
        return `
> Exporting resume data as JSON...

{
  "name": "Gorka Molero",
  "title": "Digital Alchemist | Senior Full-Stack Engineer",
  "location": "Madrid, Spain",
  "github": "github.com/gorkamolero",
  "studio": "bravura.studio",
  "realms": [
    "Full-Stack Engineering",
    "Music Production",
    "AI Experimentation"
  ],
  "skills": {
    "languages": ["TypeScript", "JavaScript", "Python"],
    "frameworks": ["React", "Next.js", "Node.js"],
    "ai": ["LangChain", "Transformers", "LLMs"],
    "music": ["Ableton", "Max/MSP", "AI Synthesis"]
  }
}

> Full JSON available at /api/resume
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