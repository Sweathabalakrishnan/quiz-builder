import { Quiz, QuizAttempt } from '../types/quiz';

const QUIZ_STORAGE_KEY = 'quizzes';
const ATTEMPTS_STORAGE_KEY = 'quiz-attempts';

export const quizStorage = {
  getQuizzes: (): Quiz[] => {
    const data = localStorage.getItem(QUIZ_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getQuiz: (id: string): Quiz | null => {
    const quizzes = quizStorage.getQuizzes();
    return quizzes.find(q => q.id === id) || null;
  },

  saveQuiz: (quiz: Quiz): void => {
    const quizzes = quizStorage.getQuizzes();
    const index = quizzes.findIndex(q => q.id === quiz.id);
    
    if (index >= 0) {
      quizzes[index] = quiz;
    } else {
      quizzes.push(quiz);
    }
    
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes));
  },

  deleteQuiz: (id: string): void => {
    const quizzes = quizStorage.getQuizzes().filter(q => q.id !== id);
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes));
  },

  getAttempts: (): QuizAttempt[] => {
    const data = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getAttempt: (id: string): QuizAttempt | null => {
    const attempts = quizStorage.getAttempts();
    return attempts.find(a => a.id === id) || null;
  },

  saveAttempt: (attempt: QuizAttempt): void => {
    const attempts = quizStorage.getAttempts();
    attempts.push(attempt);
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
  },

  getQuizAttempts: (quizId: string): QuizAttempt[] => {
    return quizStorage.getAttempts().filter(a => a.quizId === quizId);
  },

  getAllAttempts: (): QuizAttempt[] => {
    return quizStorage.getAttempts();
  },
};