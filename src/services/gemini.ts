import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question } from "@/types";
import type { Candidate } from "@/store";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface GeneratedInterview {
  questions: Question[];
}

export async function generateInterviewQuestions(): Promise<GeneratedInterview> {
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
      return { questions: parsed.questions || [] };
    }
    
    // Fallback to default questions if parsing fails
    return getDefaultQuestions();
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    // Fallback to default questions
    return getDefaultQuestions();
  }
}

function getDefaultQuestions(): GeneratedInterview {
  return {
    questions: [
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
    ]
  };
}

export async function evaluateAnswer(question: Question, answer: string): Promise<{ score: number; feedback: string }> {
  try {
    const prompt = `
    You are an expert technical interviewer evaluating a candidate's answer for a full-stack developer position.
    
    Question: "${question.prompt}"
    Difficulty: ${question.difficulty}
    Time Limit: ${question.seconds} seconds
    
    Candidate's Answer: "${answer}"
    
    Please evaluate this answer and provide:
    1. A score from 1-10 (where 10 is excellent)
    2. Constructive feedback
    
    Consider:
    - Technical accuracy and depth
    - Practical application of concepts
    - Communication clarity
    - Relevance to the question
    - Understanding of best practices
    
    Return your evaluation in this JSON format:
    {
      "score": 8,
      "feedback": "Your feedback here explaining what was good and what could be improved"
    }
    
    Be encouraging but honest. Provide specific, actionable feedback.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.max(1, Math.min(10, parsed.score || 5)),
        feedback: parsed.feedback || "Good attempt. Consider providing more technical detail."
      };
    }
    
    // Fallback evaluation if parsing fails
    return getFallbackEvaluation(question, answer);
  } catch (error) {
    console.error('Error evaluating answer with Gemini:', error);
    // Fallback evaluation
    return getFallbackEvaluation(question, answer);
  }
}

function getFallbackEvaluation(question: Question, answer: string): { score: number; feedback: string } {
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

export async function chatReply(message: string): Promise<string> {
  try {
    const prompt = `
    You are an AI interview coach helping candidates prepare for full-stack developer interviews.
    
    The candidate has asked: "${message}"
    
    Provide helpful, encouraging, and practical advice for interview preparation. Focus on:
    - Technical concepts (React, Node.js, JavaScript, TypeScript)
    - Interview best practices
    - Common interview questions and how to answer them
    - Tips for demonstrating problem-solving skills
    
    Keep your response concise (2-3 sentences) and actionable.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error with Gemini chat:', error);
    // Fallback response
    const trimmed = message.trim();
    if (!trimmed) return "Could you share more details about your question?";
    return `Here's some guidance for: "${trimmed}"\n\n- Clarify requirements\n- Provide a concrete example\n- Explain trade-offs`;
  }
}

export async function handleInterviewFlow(message: string, candidate?: Candidate, conversationHistory: string[] = []): Promise<{ response: string; action?: string; data?: Record<string, unknown> }> {
  try {
    const prompt = `
    You are an AI interviewer conducting a full-stack developer interview. 
    
    Current candidate information: ${candidate ? JSON.stringify(candidate) : 'No candidate info yet'}
    Conversation history: ${conversationHistory.join('\n')}
    
    User message: "${message}"
    
    Based on the conversation, determine what to do next:
    
    If this is the start and candidate info is missing, respond with:
    - "collecting_info" action
    - Ask for name, email, or phone one at a time
    - Be friendly and professional
    
    If all info is collected and ready to start interview, respond with:
    - "start_interview" action
    - Brief confirmation message
    
    If in interview mode, respond with:
    - "interview_question" action
    - The next question to ask
    
    If user provided information, respond with:
    - "info_received" action
    - Acknowledge the info and ask for next missing piece
    
    Always respond in this JSON format:
    {
      "response": "Your message to the user",
      "action": "collecting_info|info_received|start_interview|interview_question",
      "data": {} // any additional data needed
    }
    
    Be conversational, friendly, and professional. Guide the user through the process smoothly.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        response: parsed.response || "I'm here to help with your interview!",
        action: parsed.action || "collecting_info",
        data: parsed.data || {}
      };
    }
    
    return {
      response: "I'm here to help with your interview! Let's get started by collecting some basic information.",
      action: "collecting_info"
    };
  } catch (error) {
    console.error('Error with Gemini interview flow:', error);
    return {
      response: "I'm here to help with your interview! Let's get started by collecting some basic information.",
      action: "collecting_info"
    };
  }
}


