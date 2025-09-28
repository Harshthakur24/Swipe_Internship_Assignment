import { Question } from "@/types";

export interface AdaptiveQuestionConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'technical' | 'behavioral' | 'system_design' | 'problem_solving';
  timeLimit: number;
  followUpQuestions: string[];
}

export interface PerformanceMetrics {
  averageScore: number;
  responseTime: number;
  confidenceLevel: number;
  technicalAccuracy: number;
  communicationScore: number;
  currentStreak: number;
  difficultyProgression: number;
}

export class AdaptiveQuestionEngine {
  private performanceHistory: PerformanceMetrics[] = [];
  private currentDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  private categoryFocus: string[] = [];
  private questionBank: Map<string, Question[]> = new Map();

  constructor() {
    this.initializeQuestionBank();
  }

  private initializeQuestionBank() {
    // Technical Questions
    this.questionBank.set('technical_easy', [
      {
        id: 'tech_easy_1',
        prompt: 'Explain the difference between a stack and a queue data structure.',
        seconds: 60,
        difficulty: 'easy'
      },
      {
        id: 'tech_easy_2',
        prompt: 'What is the time complexity of binary search?',
        seconds: 45,
        difficulty: 'easy'
      },
      {
        id: 'tech_easy_3',
        prompt: 'Describe what REST API stands for and its main principles.',
        seconds: 60,
        difficulty: 'easy'
      }
    ]);

    this.questionBank.set('technical_medium', [
      {
        id: 'tech_medium_1',
        prompt: 'How would you optimize a slow database query? Walk through your approach.',
        seconds: 90,
        difficulty: 'medium'
      },
      {
        id: 'tech_medium_2',
        prompt: 'Explain the difference between SQL and NoSQL databases. When would you use each?',
        seconds: 75,
        difficulty: 'medium'
      },
      {
        id: 'tech_medium_3',
        prompt: 'Describe how you would implement a caching layer for a web application.',
        seconds: 90,
        difficulty: 'medium'
      }
    ]);

    this.questionBank.set('technical_hard', [
      {
        id: 'tech_hard_1',
        prompt: 'Design a distributed system for handling millions of concurrent users. Consider scalability, consistency, and fault tolerance.',
        seconds: 180,
        difficulty: 'hard'
      },
      {
        id: 'tech_hard_2',
        prompt: 'How would you implement a real-time recommendation engine that processes user behavior data?',
        seconds: 150,
        difficulty: 'hard'
      },
      {
        id: 'tech_hard_3',
        prompt: 'Design a system to handle microservices communication with proper error handling and monitoring.',
        seconds: 165,
        difficulty: 'hard'
      }
    ]);

    // System Design Questions
    this.questionBank.set('system_design_easy', [
      {
        id: 'sys_easy_1',
        prompt: 'Design a simple URL shortener service like bit.ly.',
        seconds: 90,
        difficulty: 'easy'
      },
      {
        id: 'sys_easy_2',
        prompt: 'How would you design a basic chat application?',
        seconds: 75,
        difficulty: 'easy'
      }
    ]);

    this.questionBank.set('system_design_medium', [
      {
        id: 'sys_medium_1',
        prompt: 'Design a social media feed system that can handle millions of users.',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'sys_medium_2',
        prompt: 'How would you design a file storage system like Google Drive?',
        seconds: 135,
        difficulty: 'medium'
      }
    ]);

    this.questionBank.set('system_design_hard', [
      {
        id: 'sys_hard_1',
        prompt: 'Design a global content delivery network (CDN) with edge caching.',
        seconds: 180,
        difficulty: 'hard'
      },
      {
        id: 'sys_hard_2',
        prompt: 'Design a real-time analytics system for tracking user events across multiple platforms.',
        seconds: 165,
        difficulty: 'hard'
      }
    ]);

    // Behavioral Questions
    this.questionBank.set('behavioral_easy', [
      {
        id: 'behav_easy_1',
        prompt: 'Tell me about a time when you had to learn a new technology quickly.',
        seconds: 90,
        difficulty: 'easy'
      },
      {
        id: 'behav_easy_2',
        prompt: 'Describe a project you worked on that you\'re particularly proud of.',
        seconds: 75,
        difficulty: 'easy'
      }
    ]);

    this.questionBank.set('behavioral_medium', [
      {
        id: 'behav_medium_1',
        prompt: 'Tell me about a time when you had to debug a complex issue. How did you approach it?',
        seconds: 120,
        difficulty: 'medium'
      },
      {
        id: 'behav_medium_2',
        prompt: 'Describe a situation where you had to work with a difficult team member. How did you handle it?',
        seconds: 105,
        difficulty: 'medium'
      }
    ]);

    this.questionBank.set('behavioral_hard', [
      {
        id: 'behav_hard_1',
        prompt: 'Tell me about a time when you had to make a critical decision under pressure with limited information.',
        seconds: 135,
        difficulty: 'hard'
      },
      {
        id: 'behav_hard_2',
        prompt: 'Describe a situation where you had to lead a team through a major technical challenge.',
        seconds: 150,
        difficulty: 'hard'
      }
    ]);
  }

  public updatePerformance(metrics: PerformanceMetrics): void {
    this.performanceHistory.push(metrics);
    this.adjustDifficulty(metrics);
    this.adjustCategoryFocus(metrics);
  }

  private adjustDifficulty(metrics: PerformanceMetrics): void {
    const recentPerformance = this.getRecentPerformance();
    
    if (recentPerformance.averageScore >= 85 && recentPerformance.currentStreak >= 2) {
      // Increase difficulty
      if (this.currentDifficulty === 'easy') {
        this.currentDifficulty = 'medium';
      } else if (this.currentDifficulty === 'medium') {
        this.currentDifficulty = 'hard';
      }
    } else if (recentPerformance.averageScore < 60 && recentPerformance.currentStreak <= -2) {
      // Decrease difficulty
      if (this.currentDifficulty === 'hard') {
        this.currentDifficulty = 'medium';
      } else if (this.currentDifficulty === 'medium') {
        this.currentDifficulty = 'easy';
      }
    }
  }

  private adjustCategoryFocus(metrics: PerformanceMetrics): void {
    // Analyze weak areas and focus on them
    if (metrics.technicalAccuracy < 70) {
      this.categoryFocus = ['technical'];
    } else if (metrics.communicationScore < 70) {
      this.categoryFocus = ['behavioral'];
    } else {
      // Balanced approach
      this.categoryFocus = ['technical', 'system_design', 'behavioral'];
    }
  }

  private getRecentPerformance(): PerformanceMetrics {
    if (this.performanceHistory.length === 0) {
      return {
        averageScore: 70,
        responseTime: 60,
        confidenceLevel: 70,
        technicalAccuracy: 70,
        communicationScore: 70,
        currentStreak: 0,
        difficultyProgression: 0
      };
    }

    const recent = this.performanceHistory.slice(-3); // Last 3 questions
    return {
      averageScore: recent.reduce((sum, m) => sum + m.averageScore, 0) / recent.length,
      responseTime: recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length,
      confidenceLevel: recent.reduce((sum, m) => sum + m.confidenceLevel, 0) / recent.length,
      technicalAccuracy: recent.reduce((sum, m) => sum + m.technicalAccuracy, 0) / recent.length,
      communicationScore: recent.reduce((sum, m) => sum + m.communicationScore, 0) / recent.length,
      currentStreak: this.calculateStreak(),
      difficultyProgression: this.calculateDifficultyProgression()
    };
  }

  private calculateStreak(): number {
    if (this.performanceHistory.length < 2) return 0;
    
    let streak = 0;
    const recent = this.performanceHistory.slice(-5);
    
    for (let i = recent.length - 1; i > 0; i--) {
      if (recent[i].averageScore > recent[i - 1].averageScore) {
        streak++;
      } else if (recent[i].averageScore < recent[i - 1].averageScore) {
        streak--;
      }
    }
    
    return streak;
  }

  private calculateDifficultyProgression(): number {
    return this.performanceHistory.length * 0.1; // Gradual progression
  }

  public getNextQuestion(): Question | null {
    const availableCategories = this.categoryFocus.length > 0 
      ? this.categoryFocus 
      : ['technical', 'system_design', 'behavioral'];

    const selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const key = `${selectedCategory}_${this.currentDifficulty}`;
    
    const questions = this.questionBank.get(key);
    if (!questions || questions.length === 0) {
      return null;
    }

    // Select a random question from the available pool
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }

  public getFollowUpQuestions(originalQuestion: Question, performance: PerformanceMetrics): string[] {
    const followUps: string[] = [];

    if (performance.averageScore < 70) {
      followUps.push("Can you provide a specific example to illustrate your point?");
      followUps.push("How would you approach this differently if you had more time?");
    }

    if (performance.technicalAccuracy < 80) {
      followUps.push("What are the trade-offs of your proposed solution?");
      followUps.push("How would you handle edge cases in this scenario?");
    }

    if (performance.communicationScore < 75) {
      followUps.push("Can you break this down into simpler steps?");
      followUps.push("What would you tell a junior developer about this concept?");
    }

    return followUps;
  }

  public getInterviewSummary(): {
    totalQuestions: number;
    averageScore: number;
    difficultyProgression: string;
    strengths: string[];
    improvementAreas: string[];
    recommendedFocus: string[];
  } {
    const recent = this.getRecentPerformance();
    
    return {
      totalQuestions: this.performanceHistory.length,
      averageScore: recent.averageScore,
      difficultyProgression: this.currentDifficulty,
      strengths: this.identifyStrengths(),
      improvementAreas: this.identifyImprovementAreas(),
      recommendedFocus: this.categoryFocus
    };
  }

  private identifyStrengths(): string[] {
    const strengths: string[] = [];
    const recent = this.getRecentPerformance();

    if (recent.technicalAccuracy >= 85) {
      strengths.push('Strong technical knowledge');
    }
    if (recent.communicationScore >= 85) {
      strengths.push('Excellent communication skills');
    }
    if (recent.responseTime <= 60) {
      strengths.push('Quick thinking and response time');
    }
    if (recent.confidenceLevel >= 85) {
      strengths.push('High confidence in answers');
    }

    return strengths;
  }

  private identifyImprovementAreas(): string[] {
    const improvements: string[] = [];
    const recent = this.getRecentPerformance();

    if (recent.technicalAccuracy < 75) {
      improvements.push('Technical depth and accuracy');
    }
    if (recent.communicationScore < 75) {
      improvements.push('Communication clarity');
    }
    if (recent.responseTime > 90) {
      improvements.push('Response time efficiency');
    }
    if (recent.confidenceLevel < 75) {
      improvements.push('Confidence in technical areas');
    }

    return improvements;
  }
}
