import { Quiz, QuizAttempt } from '../types/quiz';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-994e9032`;

const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE}${endpoint}`;
  console.log(`Fetching: ${url}`, options?.method || 'GET');

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options?.headers,
      },
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API Error:', error);
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Fetch failed for ${url}:`, error);
    throw error;
  }
};

export const quizStorage = {
  getQuizzes: async (): Promise<Quiz[]> => {
    try {
      const quizzes = await fetchAPI('/quizzes');
      return quizzes.sort((a: Quiz, b: Quiz) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      console.error('Error in getQuizzes:', err);
      return [];
    }
  },

  getQuiz: async (id: string): Promise<Quiz | null> => {
    try {
      return await fetchAPI(`/quizzes/${id}`);
    } catch (err) {
      console.error('Error in getQuiz:', err);
      return null;
    }
  },

  saveQuiz: async (quiz: Quiz): Promise<void> => {
    try {
      await fetchAPI('/quizzes', {
        method: 'POST',
        body: JSON.stringify(quiz),
      });
    } catch (err) {
      console.error('Error in saveQuiz:', err);
      throw err;
    }
  },

  deleteQuiz: async (id: string): Promise<void> => {
    try {
      await fetchAPI(`/quizzes/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error in deleteQuiz:', err);
      throw err;
    }
  },

  getAttempts: async (): Promise<QuizAttempt[]> => {
    try {
      const attempts = await fetchAPI('/attempts');
      return attempts.sort((a: QuizAttempt, b: QuizAttempt) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
    } catch (err) {
      console.error('Error in getAttempts:', err);
      return [];
    }
  },

  getAttempt: async (id: string): Promise<QuizAttempt | null> => {
    try {
      return await fetchAPI(`/attempts/${id}`);
    } catch (err) {
      console.error('Error in getAttempt:', err);
      return null;
    }
  },

  saveAttempt: async (attempt: QuizAttempt): Promise<void> => {
    try {
      await fetchAPI('/attempts', {
        method: 'POST',
        body: JSON.stringify(attempt),
      });
    } catch (err) {
      console.error('Error in saveAttempt:', err);
      throw err;
    }
  },

  getQuizAttempts: async (quizId: string): Promise<QuizAttempt[]> => {
    try {
      const attempts = await fetchAPI(`/quizzes/${quizId}/attempts`);
      return attempts.sort((a: QuizAttempt, b: QuizAttempt) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
    } catch (err) {
      console.error('Error in getQuizAttempts:', err);
      return [];
    }
  },

  getAllAttempts: async (): Promise<QuizAttempt[]> => {
    return quizStorage.getAttempts();
  },
};
