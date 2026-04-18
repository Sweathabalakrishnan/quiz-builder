export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'multiple-select';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  answers: Record<string, string | string[]>;
  score: number;
  maxScore: number;
  completedAt: string;
  userDetails?: {
    name: string;
    rollNo: string;
    department: string;
    college: string;
    email: string;
  };
}