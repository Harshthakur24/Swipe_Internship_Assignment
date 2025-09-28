import { Question } from "@/types";
import type { Candidate } from "@/store";

// Use the exact same Gemini API call structure that works in the chatbot with retry logic
async function generateGeminiText(prompt: string, maxRetries = 3): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('missing_key');

  const model = 'gemini-2.0-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        
        // If it's a 503 (service unavailable) or 429 (rate limit), retry with backoff
        if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`Gemini API ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error.message}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // For network errors, retry with backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Gemini API error, retrying in ${delay}ms (attempt ${attempt}/${maxRetries}):`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

export interface GeneratedInterview {
  questions: Question[];
}

export async function generateInterviewQuestions(): Promise<GeneratedInterview> {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using default questions');
      return getDefaultQuestions();
    }

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

    const text = await generateGeminiText(prompt);
    
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

    const text = await generateGeminiText(prompt);
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const score = Math.max(1, Math.min(10, parsed.score || 5));
      return {
        score: score,
        feedback: parsed.feedback || getScoreBasedFeedback(score)
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
  } else if (question.difficulty === 'medium') {
    if (answer.length > 100) score = Math.min(10, score + 1);
    if (answer.toLowerCase().includes('component') || answer.toLowerCase().includes('async')) score = Math.min(10, score + 2);
  } else { // hard
    if (answer.length > 200) score = Math.min(10, score + 1);
    if (answer.toLowerCase().includes('architecture') || answer.toLowerCase().includes('scalable')) score = Math.min(10, score + 2);
    if (answer.toLowerCase().includes('optimization') || answer.toLowerCase().includes('performance')) score = Math.min(10, score + 1);
  }
  
  // Generate feedback based on actual score
  feedback = getScoreBasedFeedback(score);
  
  return { score, feedback };
}

function getScoreBasedFeedback(score: number): string {
  if (score >= 9) {
    return `Outstanding! (${score}/10) Exceptional answer demonstrating deep understanding and practical expertise.`;
  } else if (score >= 8) {
    return `Excellent! (${score}/10) Great technical depth and clear communication.`;
  } else if (score >= 7) {
    return `Very good! (${score}/10) Solid understanding with good technical insight.`;
  } else if (score >= 6) {
    return `Good answer! (${score}/10) Shows understanding but could use more detail.`;
  } else if (score >= 5) {
    return `Fair attempt (${score}/10). Consider providing more specific examples and technical details.`;
  } else if (score >= 4) {
    return `Needs improvement (${score}/10). The answer lacks depth and technical accuracy.`;
  } else if (score >= 3) {
    return `Below expectations (${score}/10). Please provide more comprehensive and accurate information.`;
  } else if (score >= 2) {
    return `Poor answer (${score}/10). Significant gaps in understanding and technical knowledge.`;
  } else {
    return `Very poor (${score}/10). The answer shows minimal understanding of the topic.`;
  }
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

    const text = await generateGeminiText(prompt);
    return text;
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
    // Filter out loading messages and system messages from history
    const cleanHistory = conversationHistory
      .filter(msg => !msg.includes('Thinking...') && !msg.includes('Evaluating your answer...'))
      .slice(-6); // Keep only last 6 messages to avoid token limits

    const prompt = `
    You are an AI interviewer conducting a full-stack developer interview. 
    
    Current candidate information: ${candidate ? JSON.stringify(candidate) : 'No candidate info yet'}
    Recent conversation history: ${cleanHistory.join('\n')}
    
    User message: "${message}"
    
    Based on the conversation, determine what to do next:
    
    IMPORTANT: Do not repeat previous messages. Be concise and move the conversation forward.
    
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

    const text = await generateGeminiText(prompt);
    
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


export async function extractCandidateDetailsFromText(text: string): Promise<{ name: string; email: string; phone: string }> {
  try {
    const prompt = `
    You are given resume text (either from PDF or DOCX). Extract the candidate's information with high accuracy.
    
    Instructions:
    - Extract the FULL NAME (first name + last name, e.g., "John Smith")
    - Extract the EMAIL ADDRESS (look for @ symbol)
    - Extract the PHONE NUMBER (look for 10-digit numbers, with or without formatting)
    - If any field is not found, return empty string for that field
    - Be very careful with name extraction - look at the top of the resume
    - For phone numbers, accept various formats: (123) 456-7890, 123-456-7890, 123.456.7890, etc.
    
    Resume Text:
    """
    ${text}
    """

    Output ONLY a JSON object with these exact keys: name, email, phone
    Do not include any other text or explanations.
    {"name":"","email":"","phone":""}
    `;

    const raw = await generateGeminiText(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: typeof parsed.name === 'string' ? parsed.name.trim() : '',
        email: typeof parsed.email === 'string' ? parsed.email.trim() : '',
        phone: typeof parsed.phone === 'string' ? parsed.phone.trim() : '',
      };
    }
    return { name: '', email: '', phone: '' };
  } catch (err) {
    console.error('AI extraction failed:', err);
    return { name: '', email: '', phone: '' };
  }
}


