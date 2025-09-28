import { Question } from "@/types";

export interface InterviewTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  level: 'entry' | 'mid' | 'senior' | 'lead';
  duration: number; // in minutes
  questions: Question[];
  skills: string[];
  categories: string[];
}

export const interviewTemplates: InterviewTemplate[] = [
  {
    id: 'software-engineer-general',
    name: 'Software Engineer - General',
    description: 'Comprehensive technical interview covering algorithms, system design, and coding practices',
    industry: 'Technology',
    level: 'mid',
    duration: 60,
    skills: ['Algorithms', 'Data Structures', 'System Design', 'Problem Solving'],
    categories: ['Technical', 'System Design', 'Behavioral'],
    questions: [
      {
        id: 'se-1',
        prompt: 'Implement a function to find the longest common subsequence between two strings.',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'se-2',
        prompt: 'Design a URL shortener service like bit.ly. Consider scalability and performance.',
        seconds: 180,
        difficulty: 'hard'
      },
      {
        id: 'se-3',
        prompt: 'Explain the difference between SQL and NoSQL databases. When would you use each?',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'se-4',
        prompt: 'Tell me about a challenging technical problem you solved recently.',
        seconds: 120,
        difficulty: 'easy'
      },
      {
        id: 'se-5',
        prompt: 'How would you optimize a slow database query? Walk through your approach.',
        seconds: 105,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    description: 'Frontend-focused interview covering React, JavaScript, and web performance',
    industry: 'Technology',
    level: 'mid',
    duration: 45,
    skills: ['React', 'JavaScript', 'CSS', 'Web Performance', 'User Experience'],
    categories: ['Frontend', 'JavaScript', 'React', 'Performance'],
    questions: [
      {
        id: 'fe-1',
        prompt: 'Explain the React component lifecycle and when you would use useEffect vs useLayoutEffect.',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'fe-2',
        prompt: 'How would you optimize a React application for better performance?',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'fe-3',
        prompt: 'Implement a debounce function in JavaScript and explain its use cases.',
        seconds: 75,
        difficulty: 'easy'
      },
      {
        id: 'fe-4',
        prompt: 'Describe how you would implement a responsive design for a complex dashboard.',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'fe-5',
        prompt: 'What are the differences between CSS Grid and Flexbox? When would you use each?',
        seconds: 60,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'backend-developer',
    name: 'Backend Developer',
    description: 'Backend-focused interview covering APIs, databases, and system architecture',
    industry: 'Technology',
    level: 'mid',
    duration: 60,
    skills: ['APIs', 'Databases', 'System Architecture', 'Microservices', 'Security'],
    categories: ['Backend', 'APIs', 'Databases', 'Architecture'],
    questions: [
      {
        id: 'be-1',
        prompt: 'Design a RESTful API for a social media platform. Include authentication and rate limiting.',
        seconds: 150,
        difficulty: 'hard'
      },
      {
        id: 'be-2',
        prompt: 'How would you handle database migrations in a production environment?',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'be-3',
        prompt: 'Explain the CAP theorem and its implications for distributed systems.',
        seconds: 75,
        difficulty: 'medium'
      },
      {
        id: 'be-4',
        prompt: 'How would you implement caching in a microservices architecture?',
        seconds: 120,
        difficulty: 'hard'
      },
      {
        id: 'be-5',
        prompt: 'Describe your approach to handling API security and preventing common vulnerabilities.',
        seconds: 90,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Data science interview covering machine learning, statistics, and data analysis',
    industry: 'Data & Analytics',
    level: 'mid',
    duration: 75,
    skills: ['Machine Learning', 'Statistics', 'Python', 'Data Analysis', 'SQL'],
    categories: ['Machine Learning', 'Statistics', 'Data Analysis', 'Python'],
    questions: [
      {
        id: 'ds-1',
        prompt: 'Explain the bias-variance tradeoff in machine learning and how to address it.',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'ds-2',
        prompt: 'How would you handle missing data in a dataset? Discuss different approaches.',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'ds-3',
        prompt: 'Design an A/B test to measure the impact of a new feature on user engagement.',
        seconds: 150,
        difficulty: 'hard'
      },
      {
        id: 'ds-4',
        prompt: 'Explain the difference between supervised and unsupervised learning with examples.',
        seconds: 75,
        difficulty: 'easy'
      },
      {
        id: 'ds-5',
        prompt: 'How would you evaluate the performance of a classification model?',
        seconds: 90,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Product management interview covering strategy, user research, and product development',
    industry: 'Product',
    level: 'mid',
    duration: 60,
    skills: ['Product Strategy', 'User Research', 'Analytics', 'Stakeholder Management', 'Roadmapping'],
    categories: ['Product Strategy', 'User Experience', 'Analytics', 'Leadership'],
    questions: [
      {
        id: 'pm-1',
        prompt: 'How would you prioritize features for a mobile app with limited development resources?',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'pm-2',
        prompt: 'Describe your approach to conducting user research and how it influences product decisions.',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'pm-3',
        prompt: 'How would you measure the success of a new product feature?',
        seconds: 75,
        difficulty: 'easy'
      },
      {
        id: 'pm-4',
        prompt: 'Tell me about a time when you had to make a difficult product decision with incomplete data.',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'pm-5',
        prompt: 'How would you handle conflicting requirements from different stakeholders?',
        seconds: 90,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    description: 'DevOps interview covering CI/CD, infrastructure, and automation',
    industry: 'Technology',
    level: 'mid',
    duration: 60,
    skills: ['CI/CD', 'Infrastructure', 'Automation', 'Monitoring', 'Security'],
    categories: ['DevOps', 'Infrastructure', 'Automation', 'Monitoring'],
    questions: [
      {
        id: 'devops-1',
        prompt: 'Design a CI/CD pipeline for a microservices application with automated testing and deployment.',
        seconds: 150,
        difficulty: 'hard'
      },
      {
        id: 'devops-2',
        prompt: 'How would you implement infrastructure as code using tools like Terraform?',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'devops-3',
        prompt: 'Describe your approach to monitoring and alerting in a distributed system.',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'devops-4',
        prompt: 'How would you handle a production incident and implement post-mortem processes?',
        seconds: 105,
        difficulty: 'medium'
      },
      {
        id: 'devops-5',
        prompt: 'Explain the benefits of containerization and orchestration with Kubernetes.',
        seconds: 75,
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'cybersecurity-analyst',
    name: 'Cybersecurity Analyst',
    description: 'Cybersecurity interview covering threat analysis, security protocols, and incident response',
    industry: 'Security',
    level: 'mid',
    duration: 60,
    skills: ['Threat Analysis', 'Security Protocols', 'Incident Response', 'Risk Assessment', 'Compliance'],
    categories: ['Security', 'Threat Analysis', 'Incident Response', 'Compliance'],
    questions: [
      {
        id: 'sec-1',
        prompt: 'How would you conduct a security risk assessment for a new web application?',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'sec-2',
        prompt: 'Describe the steps you would take during a security incident response.',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'sec-3',
        prompt: 'Explain common web application vulnerabilities and how to prevent them.',
        seconds: 105,
        difficulty: 'medium'
      },
      {
        id: 'sec-4',
        prompt: 'How would you implement a security awareness program for employees?',
        seconds: 75,
        difficulty: 'easy'
      },
      {
        id: 'sec-5',
        prompt: 'Describe your approach to vulnerability management and patch deployment.',
        seconds: 90,
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'ux-designer',
    name: 'UX Designer',
    description: 'UX design interview covering user research, design thinking, and usability',
    industry: 'Design',
    level: 'mid',
    duration: 45,
    skills: ['User Research', 'Design Thinking', 'Usability Testing', 'Prototyping', 'User Experience'],
    categories: ['User Experience', 'Design Thinking', 'User Research', 'Prototyping'],
    questions: [
      {
        id: 'ux-1',
        prompt: 'Walk me through your design process from problem identification to solution delivery.',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'ux-2',
        prompt: 'How would you conduct user research for a mobile banking application?',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'ux-3',
        prompt: 'Describe how you would improve the usability of an e-commerce checkout process.',
        seconds: 105,
        difficulty: 'medium'
      },
      {
        id: 'ux-4',
        prompt: 'Explain the difference between user experience and user interface design.',
        seconds: 60,
        difficulty: 'easy'
      },
      {
        id: 'ux-5',
        prompt: 'How would you measure the success of a UX design change?',
        seconds: 75,
        difficulty: 'easy'
      }
    ]
  }
];

export function getTemplateById(id: string): InterviewTemplate | undefined {
  return interviewTemplates.find(template => template.id === id);
}

export function getTemplatesByIndustry(industry: string): InterviewTemplate[] {
  return interviewTemplates.filter(template => 
    template.industry.toLowerCase() === industry.toLowerCase()
  );
}

export function getTemplatesByLevel(level: string): InterviewTemplate[] {
  return interviewTemplates.filter(template => 
    template.level === level
  );
}

export function getTemplatesBySkill(skill: string): InterviewTemplate[] {
  return interviewTemplates.filter(template => 
    template.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  );
}

export function getRandomTemplate(): InterviewTemplate {
  const randomIndex = Math.floor(Math.random() * interviewTemplates.length);
  return interviewTemplates[randomIndex];
}

export function getRecommendedTemplates(userSkills: string[], experienceLevel: string): InterviewTemplate[] {
  return interviewTemplates
    .filter(template => {
      // Match experience level
      const levelMatch = template.level === experienceLevel;
      
      // Check skill overlap
      const skillOverlap = template.skills.some(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      
      return levelMatch && skillOverlap;
    })
    .sort((a, b) => {
      // Sort by skill overlap count
      const aOverlap = a.skills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      ).length;
      
      const bOverlap = b.skills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      ).length;
      
      return bOverlap - aOverlap;
    });
}
