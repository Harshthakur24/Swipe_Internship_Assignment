import { Question, Difficulty } from '@/store';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the generative model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateInterviewQuestions(): Promise<Question[]> {
  try {
    const prompt = `
    Generate 6 interview questions for a full-stack developer position (React/Node.js focus).
    Create exactly 6 questions with the following structure:
    - 2 Easy questions (basic concepts, 20 seconds each)
    - 2 Medium questions (practical implementation, 60 seconds each)  
    - 2 Hard questions (architecture/optimization, 120 seconds each)

    Return the questions in this JSON format:
    {
      "questions": [
        {
          "id": "easy-1",
          "difficulty": "easy",
          "prompt": "Question text here",
          "seconds": 20
        },
        {
          "id": "easy-2", 
          "difficulty": "easy",
          "prompt": "Question text here",
          "seconds": 20
        },
        {
          "id": "medium-1",
          "difficulty": "medium",
          "prompt": "Question text here", 
          "seconds": 60
        },
        {
          "id": "medium-2",
          "difficulty": "medium",
          "prompt": "Question text here",
          "seconds": 60
        },
        {
          "id": "hard-1",
          "difficulty": "hard",
          "prompt": "Question text here",
          "seconds": 120
        },
        {
          "id": "hard-2",
          "difficulty": "hard", 
          "prompt": "Question text here",
          "seconds": 120
        }
      ]
    }

    Focus on React, Node.js, JavaScript, TypeScript, databases, and full-stack development concepts.
    Make questions practical and relevant to real-world development scenarios.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.questions || [];
    }
    
    // Fallback to default questions if parsing fails
    return getDefaultQuestions();
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    // Fallback to default questions
    return getDefaultQuestions();
  }
}

function getDefaultQuestions(): Question[] {
  return [
    // Easy questions (20 seconds each)
    {
      id: 'easy-1',
      difficulty: 'easy',
      prompt: 'Tell me about yourself and your background in full-stack development.',
      seconds: 20,
    },
    {
      id: 'easy-2', 
      difficulty: 'easy',
      prompt: 'What is the difference between React props and state?',
      seconds: 20,
    },
    // Medium questions (60 seconds each)
    {
      id: 'medium-1',
      difficulty: 'medium', 
      prompt: 'Explain how you would implement a reusable form component in React with validation.',
      seconds: 60,
    },
    {
      id: 'medium-2',
      difficulty: 'medium',
      prompt: 'Describe your experience with Node.js and how you handle asynchronous operations.',
      seconds: 60,
    },
    // Hard questions (120 seconds each)
    {
      id: 'hard-1',
      difficulty: 'hard',
      prompt: 'Design a scalable chat application architecture. Consider real-time messaging, user management, and data persistence.',
      seconds: 120,
    },
    {
      id: 'hard-2',
      difficulty: 'hard',
      prompt: 'Explain how you would optimize a React application that has performance issues with large lists and frequent re-renders.',
      seconds: 120,
    },
  ];
}

export async function evaluateAnswer(question: Question, answer: string): Promise<{ score: number; feedback: string }> {
  // This would typically call an AI service to evaluate the answer
  // For now, we'll use a simple heuristic based on answer length and content
  
  const baseScore = Math.min(10, Math.max(1, Math.floor(answer.length / 20)));
  
  let feedback = '';
  let score = baseScore;
  
  // Adjust score based on question difficulty and answer quality
  if (question.difficulty === 'easy') {
    if (answer.length > 50) score = Math.min(10, score + 2);
    if (answer.toLowerCase().includes('react') || answer.toLowerCase().includes('javascript')) score = Math.min(10, score + 1);
    feedback = score >= 8 ? 'Great answer! You demonstrated good understanding of the basics.' : 
               score >= 6 ? 'Good answer. Consider providing more specific examples.' :
               'Please provide more detail in your response.';
  } else if (question.difficulty === 'medium') {
    if (answer.length > 100) score = Math.min(10, score + 1);
    if (answer.toLowerCase().includes('component') || answer.toLowerCase().includes('async')) score = Math.min(10, score + 2);
    feedback = score >= 8 ? 'Excellent technical depth and practical knowledge shown.' :
               score >= 6 ? 'Good answer with some technical insight. Could use more examples.' :
               'Consider providing more technical detail and real-world examples.';
  } else { // hard
    if (answer.length > 200) score = Math.min(10, score + 1);
    if (answer.toLowerCase().includes('architecture') || answer.toLowerCase().includes('scalable')) score = Math.min(10, score + 2);
    if (answer.toLowerCase().includes('optimization') || answer.toLowerCase().includes('performance')) score = Math.min(10, score + 1);
    feedback = score >= 8 ? 'Outstanding architectural thinking and deep technical knowledge.' :
               score >= 6 ? 'Good high-level thinking. Consider diving deeper into implementation details.' :
               'This is a complex question. Consider breaking it down into components and providing more technical depth.';
  }
  
  return { score, feedback };
}
