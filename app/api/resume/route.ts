import { NextResponse } from 'next/server';

const RESUME_DATA = {
  name: "Gorka Molero",
  title: "Full-Stack Engineer, Consultant & AI Enthusiast",
  location: "Madrid / Lisbon / Remote",
  contact: {
    github: "github.com/gorkamolero",
    studio: "bravura.studio",
    email: "contact@gorka.dev"
  },
  summary: "Full-Stack Engineer with expertise in modern web technologies, AI integration, and creative coding. Passionate about building elegant solutions that bridge technology and human experience. Active in the music production scene as co-founder of QTZL netlabel, exploring the intersection of code, art, and sound.",
  experience: [
    {
      title: "Web Developer",
      company: "Roadie",
      period: "December 2023 - Present",
      description: [
        "Working with the Roadie team on transforming their site into a striking Backstage platform",
        "Implementing modern UI patterns and performance optimizations",
        "Collaborating with distributed team across multiple time zones"
      ]
    },
    {
      title: "Software Engineer",
      company: "Typeshare.co",
      period: "November 2022 - December 2023",
      description: [
        "Led development of AI-first 2.0 version for online writers platform",
        "Managed UI architecture and text editor implementation using Tiptap",
        "Integrated AI features for content generation and optimization"
      ]
    },
    {
      title: "Co-founder & CTO",
      company: "Maility",
      period: "November 2022 - Present",
      description: [
        "Co-founded and served as technical lead for email automation startup",
        "Grew company to 20K MRR within 6 months",
        "Built scalable architecture and led technical strategy"
      ]
    },
    {
      title: "Web Developer & Design System Lead",
      company: "Chessable (Play Magnus Group)",
      period: "September 2020 - August 2022",
      description: [
        "Led high-performing remote team to build complete design system",
        "Worked on chess learning platform founded by Magnus Carlsen",
        "Implemented component library and established UI standards"
      ]
    },
    {
      title: "CTO",
      company: "Adalab",
      period: "October 2019 - August 2020",
      description: [
        "Led technology for NGO offering front-end bootcamp for women",
        "Built platform for candidates and employment matching system",
        "Implemented solution using React, Firebase, and no-code tools"
      ]
    }
  ],
  skills: {
    languages: ["TypeScript", "JavaScript", "HTML5/CSS3", "Python"],
    frontend: ["React", "Next.js", "Vue.js", "Web Components", "Storybook"],
    backend: ["Node.js", "Express", "T3 Stack", "Firebase"],
    ai_ml: ["Vercel AI SDK", "LangChain", "OpenAI API"],
    design: ["Figma", "Webflow", "Design Systems", "Component Libraries"],
    creative: ["Ableton Live", "Max/MSP", "Music Production"],
    tools: ["Git", "CI/CD", "Vercel", "GitHub/GitLab/Bitbucket"]
  },
  projects: [
    {
      name: "QTZL (Quetzalcoatl)",
      description: "Co-founded netlabel promoting Latin American electronic artists. Featured in Vice, Redbull Music, BBC4",
      tech: ["Web Development", "Music Curation", "Digital Distribution"]
    },
    {
      name: "Simply Rickshaw",
      description: "E-commerce platform for unique global objects and original designs. Expanded from online to physical store in Madrid",
      tech: ["E-commerce", "Web Design", "Retail"]
    },
    {
      name: "Responsive Design Thought Leadership",
      description: "Published articles featured in Hacker News, Awwwards, Codrops. Topics: responsive design evolution, role of web designers",
      tech: ["Technical Writing", "Web Standards", "Design Philosophy"]
    }
  ],
  interests: [
    "Music Production & DJing",
    "Meditation & Mindfulness",
    "Chess",
    "Brazilian Jiu-Jitsu & Boxing",
    "Reading & Podcasts",
    "Travel",
    "Politics & Philosophy",
    "Cryptocurrency & Web3"
  ],
  education: [
    {
      degree: "General Film Studies",
      institution: "ECAM - Escuela de Cinematografía y del Audiovisual de Madrid",
      year: "2010",
      focus: "Specialization in Sound Engineering and Mixing"
    },
    {
      degree: "Cinema, Photography and Film Production",
      institution: "ESCAC - Escola Superior de Cinema i Audiovisuals de Catalunya",
      year: "2009"
    }
  ],
  training: [
    "Client Ascension (2022-Present)",
    "Responsive Typography - Workshop with Jordan Moore",
    "Multi-device Web - Workshop with Luke Wroblewski",
    "An Event Apart - Conferences with Ethan Marcotte, Karen McGrane, Jeffrey Zeldman",
    "Responsive Design Workshops - Brad Frost, Andy Clarke",
    "Smashing Conference - Christian Heilmann, Jonathan Snook"
  ]
};

function generateTextResume() {
  let text = `GORKA MOLERO
${RESUME_DATA.title}
${RESUME_DATA.location}

CONTACT
GitHub: ${RESUME_DATA.contact.github}
Studio: ${RESUME_DATA.contact.studio}

SUMMARY
${RESUME_DATA.summary}

EXPERIENCE
`;

  RESUME_DATA.experience.forEach(job => {
    text += `\n${job.title} | ${job.company}
${job.period}
${job.description.map(d => `• ${d}`).join('\n')}
`;
  });

  text += `\nSKILLS
Languages: ${RESUME_DATA.skills.languages.join(', ')}
Frontend: ${RESUME_DATA.skills.frontend.join(', ')}
Backend: ${RESUME_DATA.skills.backend.join(', ')}
AI/ML: ${RESUME_DATA.skills.ai_ml.join(', ')}
Design: ${RESUME_DATA.skills.design.join(', ')}
Creative: ${RESUME_DATA.skills.creative.join(', ')}
Tools: ${RESUME_DATA.skills.tools.join(', ')}

PROJECTS
`;

  RESUME_DATA.projects.forEach(project => {
    text += `\n${project.name}
${project.description}
`;
  });

  text += `\nINTERESTS
${RESUME_DATA.interests.join(', ')}

EDUCATION
`;

  RESUME_DATA.education.forEach(edu => {
    text += `\n${edu.degree}
${edu.institution}, ${edu.year}
${edu.focus ? edu.focus : ''}
`;
  });

  text += `\nPROFESSIONAL DEVELOPMENT
${RESUME_DATA.training.join('\n')}`;

  return text;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  switch (format) {
    case 'txt':
      return new NextResponse(generateTextResume(), {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="gorka_molero_resume.txt"'
        }
      });

    case 'json':
    default:
      return NextResponse.json(RESUME_DATA);
  }
}