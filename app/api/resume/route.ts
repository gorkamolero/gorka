import { NextResponse } from 'next/server';

const RESUME_DATA = {
  name: "Gorka Molero",
  title: "Senior Full-Stack Engineer & Digital Creator",
  location: "Madrid, Spain",
  contact: {
    github: "github.com/gorkamolero",
    studio: "bravura.studio",
    email: "contact@gorka.dev"
  },
  summary: "Senior Full-Stack Engineer with 10+ years of experience crafting digital experiences at the intersection of technology and creativity. Specialized in modern web technologies, AI/ML integration, and creative coding. Active music producer and digital artist exploring the boundaries between code and art.",
  experience: [
    {
      title: "Senior UI Engineer",
      company: "Current Company",
      period: "2022 - Present",
      description: [
        "Lead frontend architecture for enterprise-scale applications",
        "Implement AI-powered features using LangChain and OpenAI APIs",
        "Mentor junior developers and establish coding standards",
        "Optimize performance resulting in 40% faster load times"
      ]
    },
    {
      title: "Full-Stack Developer",
      company: "Previous Company",
      period: "2019 - 2022",
      description: [
        "Built real-time collaborative platforms using React and WebSockets",
        "Developed microservices architecture with Node.js and Python",
        "Integrated machine learning models for user behavior analysis",
        "Led migration from legacy systems to modern stack"
      ]
    },
    {
      title: "Creative Technologist",
      company: "Bravura Studio",
      period: "2018 - Present",
      description: [
        "Develop interactive installations combining code and art",
        "Create generative music systems using Max/MSP and JavaScript",
        "Design and implement creative coding workshops",
        "Collaborate with artists on digital art projects"
      ]
    }
  ],
  skills: {
    languages: ["TypeScript", "JavaScript", "Python", "Swift", "C++"],
    frontend: ["React", "Next.js", "React Native", "Three.js", "WebGL"],
    backend: ["Node.js", "Express", "FastAPI", "PostgreSQL", "Redis"],
    ai_ml: ["LangChain", "Transformers", "PyTorch", "OpenAI API", "Stable Diffusion"],
    creative: ["Ableton Live", "Max/MSP", "TouchDesigner", "GLSL", "Processing"],
    tools: ["Git", "Docker", "AWS", "Vercel", "GitHub Actions"]
  },
  projects: [
    {
      name: "QTZL",
      description: "Transatlantic music collective exploring AI-generated soundscapes",
      tech: ["Max/MSP", "Python", "TensorFlow"]
    },
    {
      name: "Neural Canvas",
      description: "Real-time generative art installation using body tracking",
      tech: ["TouchDesigner", "GLSL", "Kinect"]
    },
    {
      name: "CodeFlow",
      description: "Live coding environment for musical performance",
      tech: ["React", "Web Audio API", "WebSockets"]
    }
  ],
  education: {
    degree: "Bachelor of Computer Science",
    institution: "Universidad Complutense de Madrid",
    year: "2014"
  }
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
Creative: ${RESUME_DATA.skills.creative.join(', ')}
Tools: ${RESUME_DATA.skills.tools.join(', ')}

PROJECTS
`;

  RESUME_DATA.projects.forEach(project => {
    text += `\n${project.name}
${project.description}
Tech: ${project.tech.join(', ')}
`;
  });

  text += `\nEDUCATION
${RESUME_DATA.education.degree}
${RESUME_DATA.education.institution}, ${RESUME_DATA.education.year}`;

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