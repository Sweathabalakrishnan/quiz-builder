import { Question } from '../types/quiz';

export const calculateScore = (
  questions: Question[],
  answers: Record<string, string | string[]>
): { score: number; maxScore: number } => {
  let score = 0;
  let maxScore = 0;

  questions.forEach(question => {
    maxScore += question.points;
    const userAnswer = answers[question.id];

    if (!userAnswer) return;

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        if (userAnswer === question.correctAnswer) {
          score += question.points;
        }
        break;

      case 'short-answer':
        const correctAnswer = (question.correctAnswer as string).toLowerCase().trim();
        const userAnswerStr = (userAnswer as string).toLowerCase().trim();
        if (correctAnswer === userAnswerStr) {
          score += question.points;
        }
        break;

      case 'multiple-select':
        const correctAnswers = question.correctAnswer as string[];
        const userAnswers = userAnswer as string[];
        
        if (
          correctAnswers.length === userAnswers.length &&
          correctAnswers.every(ans => userAnswers.includes(ans))
        ) {
          score += question.points;
        }
        break;
    }
  });

  return { score, maxScore };
};
