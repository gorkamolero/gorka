type CommandHandler = (args: string[]) => string;

const commands: Record<string, CommandHandler> = {
  '/help': () => `
Available commands:
  /help     - Show this help message
  /about    - Learn about me
  /work     - View my projects and work
  /music    - Listen to my music
  /contact  - Get in touch
  /skills   - View my technical skills
  /resume   - Download my resume
  /clear    - Clear the terminal
  
Type anything else to chat with my AI assistant.
`,

  '/about': () => `
╔═══════════════════════════════════════════╗
║             ABOUT GORKA                   ║
╚═══════════════════════════════════════════╝

> Loading personal data...
> Decrypting life story...

[Your personal introduction here]

Terminal enthusiast. AI explorer. Music creator.

> EOF
`,

  '/work': () => `
╔═══════════════════════════════════════════╗
║              MY WORK                      ║
╚═══════════════════════════════════════════╝

[1] Project Alpha
    └─ Description: Revolutionary AI tool
    └─ Tech: Next.js, TypeScript, AI
    └─ Link: github.com/yourusername/project

[2] Project Beta
    └─ Description: Terminal-based IDE
    └─ Tech: Rust, WebAssembly
    └─ Status: In Development

> Use /work [number] to learn more
`,

  '/music': () => `
╔═══════════════════════════════════════════╗
║              MUSIC                        ║
╚═══════════════════════════════════════════╝

♪ Now Playing: Your Latest Track
  ▶ ━━━━━●━━━━━━━━━━━━━━━ 2:34/5:21

[Your music projects and links here]

> Use /music play [track] to listen
`,

  '/contact': () => `
╔═══════════════════════════════════════════╗
║             CONTACT                       ║
╚═══════════════════════════════════════════╝

> Email:    your@email.com
> GitHub:   github.com/yourusername
> Twitter:  @yourhandle
> LinkedIn: linkedin.com/in/yourname

> Encrypted channels available on request
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

  '/clear': () => 'CLEAR_TERMINAL',

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

export function handleCommand(input: string): string {
  const trimmedInput = input.trim();
  const [command, ...args] = trimmedInput.split(' ');
  
  // Handle resume with format
  if (command === '/resume' && args.length > 0) {
    const format = args[0].toLowerCase();
    switch (format) {
      case 'pdf':
        // In a real app, this would trigger a download
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
Full Stack Developer | AI Enthusiast

[Contact]
Email: your@email.com
Location: Your City
GitHub: github.com/gorkamolero

[Experience]
... (add your experience here) ...

[Skills]
... (your skills) ...

════════════════════════════════════════════

> Copy the text above or type /resume pdf for formatted version
`;
      case 'json':
        return `
> Exporting resume data as JSON...

{
  "name": "Gorka Molero",
  "title": "Full Stack Developer",
  "email": "your@email.com",
  "skills": ["TypeScript", "React", "Node.js", "AI"],
  ...
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
  
  // If not a command, prepare for AI chat (to be implemented)
  if (trimmedInput.startsWith('/')) {
    return `Command not found: ${command}\nType /help for available commands.`;
  }
  
  return `AI chat coming soon. For now, try /help to see available commands.`;
}