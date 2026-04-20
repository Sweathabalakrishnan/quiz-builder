import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { CheckCircle, XCircle, Home, Share2, User, CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Quiz, QuizAttempt } from '../types/quiz';
import { quizStorage } from '../utils/storage-supabase';
import { toast } from 'sonner';

export function QuizResults() {
  const { id, quizId, attemptId } = useParams<{ id?: string; quizId?: string; attemptId?: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const resultId = attemptId ?? id;
  const isPublicView = Boolean(quizId && attemptId);

  useEffect(() => {
    if (!resultId) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        const loadedAttempt = await quizStorage.getAttempt(resultId);
        if (!loadedAttempt) {
          toast.error('Results not found');
          navigate(isPublicView && quizId ? `/quiz/${quizId}` : '/');
          return;
        }

        const loadedQuiz = await quizStorage.getQuiz(loadedAttempt.quizId);
        if (!loadedQuiz) {
          toast.error('Quiz not found');
          navigate(isPublicView && quizId ? `/quiz/${quizId}` : '/');
          return;
        }

        setAttempt(loadedAttempt);
        setQuiz(loadedQuiz);
      } catch (error) {
        console.error('Error loading results:', error);
        toast.error('Failed to load results');
        navigate(isPublicView && quizId ? `/quiz/${quizId}` : '/');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isPublicView, navigate, quizId, resultId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!attempt || !quiz) {
    return <div>Loading...</div>;
  }

  const percentage = (attempt.score / attempt.maxScore) * 100;
  const passed = percentage >= 60;

  const getGrade = () => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const handleShareResults = async () => {
    const shareText = `🎓 Quiz Results\n\n📝 Quiz: ${quiz.title}\n👤 Name: ${attempt.userDetails?.name || 'Anonymous'}\n📊 Score: ${attempt.score}/${attempt.maxScore} (${percentage.toFixed(1)}%)\n🏆 Grade: ${getGrade()}\n\n${passed ? '✅ Passed!' : '📚 Keep practicing!'}\n\n${window.location.origin}/quiz/${quiz.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quiz Results',
          text: shareText,
        });
        toast.success('Results shared!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyResultsToClipboard(shareText);
        }
      }
    } else {
      copyResultsToClipboard(shareText);
    }
  };

  const copyResultsToClipboard = async (text: string) => {
    try {
      // In Figma Make environment, use fallback method first
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        textArea.remove();
        
        if (successful) {
          toast.success('Results copied to clipboard! 📋');
        } else {
          throw new Error('Copy command failed');
        }
      } catch (execErr) {
        textArea.remove();
        // Try modern API as fallback
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          toast.success('Results copied to clipboard! 📋');
        } else {
          throw execErr;
        }
      }
    } catch (err) {
      console.error('Failed to copy results:', err);
      toast.error('Failed to copy results. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Colorful Header */}
      <div className="app-hero p-6">
        <div className="app-hero-content flex items-center gap-4 text-slate-900">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(isPublicView ? `/quiz/${quiz?.id ?? quizId}` : '/')}
            className="bg-white/80 text-slate-700 hover:bg-white"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-3xl font-bold">Quiz Results</h1>
        </div>
      </div>

      {attempt.userDetails && (
        <Card className="app-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#281C59]">
              <div className="app-icon-badge h-10 w-10 rounded-lg">
                <User className="size-5" />
              </div>
              Student Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-[#281C59] font-medium mb-1">Name</p>
                <p className="font-semibold text-gray-900">{attempt.userDetails.name}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-[#281C59] font-medium mb-1">Roll Number</p>
                <p className="font-semibold text-gray-900">{attempt.userDetails.rollNo}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-[#281C59] font-medium mb-1">Department</p>
                <p className="font-semibold text-gray-900">{attempt.userDetails.department}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-[#281C59] font-medium mb-1">College</p>
                <p className="font-semibold text-gray-900">{attempt.userDetails.college}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-[#281C59] font-medium mb-1">Email</p>
                <p className="font-semibold text-gray-900">{attempt.userDetails.email}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-[#281C59] font-medium mb-1">Completed At</p>
                <p className="font-semibold text-gray-900">{new Date(attempt.completedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={`border-0 shadow-xl overflow-hidden ${passed ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-orange-50'}`}>
        <div className={`h-2 bg-gradient-to-r ${passed ? 'from-green-400 to-emerald-500' : 'from-red-500 to-orange-500'}`}></div>
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-orange-500'} shadow-xl`}>
              {passed ? (
                <CheckCircle2 className="size-12 text-white" />
              ) : (
                <XCircle className="size-12 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-4xl mb-2">
            {passed ? 'Congratulations! 🎉' : 'Keep Practicing! 💪'}
          </CardTitle>
          <p className={`text-lg ${passed ? 'text-green-700' : 'text-red-700'}`}>
            {passed ? 'You passed the quiz!' : 'You can do better next time!'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
            <div className="app-title-accent mb-2 text-6xl font-bold">
              {attempt.score} / {attempt.maxScore}
            </div>
            <div className="text-2xl font-semibold text-gray-700 mb-4">
              {percentage.toFixed(1)}%
            </div>
            <Badge className={`text-lg px-4 py-2 ${passed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'} text-white`}>
              Grade: {getGrade()}
            </Badge>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <Progress value={percentage} className="h-4" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center shadow-lg">
              <div className="app-icon-badge mx-auto mb-2 h-12 w-12 rounded-lg text-2xl font-bold">
                {quiz.questions.length}
              </div>
              <div className="text-sm font-medium text-gray-600">Total Questions</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold mb-2">
                {quiz.questions.filter(q => {
                  const userAnswer = attempt.answers[q.id];
                  if (!userAnswer) return false;

                  if (q.type === 'multiple-select') {
                    const correctAnswers = q.correctAnswer as string[];
                    const userAnswers = userAnswer as string[];
                    return correctAnswers.length === userAnswers.length &&
                      correctAnswers.every(ans => userAnswers.includes(ans));
                  }

                  if (q.type === 'short-answer') {
                    return (q.correctAnswer as string).toLowerCase().trim() ===
                      (userAnswer as string).toLowerCase().trim();
                  }

                  return userAnswer === q.correctAnswer;
                }).length}
              </div>
              <div className="text-sm font-medium text-gray-600">Correct</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mb-2">
                {quiz.questions.length - quiz.questions.filter(q => {
                  const userAnswer = attempt.answers[q.id];
                  if (!userAnswer) return false;

                  if (q.type === 'multiple-select') {
                    const correctAnswers = q.correctAnswer as string[];
                    const userAnswers = userAnswer as string[];
                    return correctAnswers.length === userAnswers.length &&
                      correctAnswers.every(ans => userAnswers.includes(ans));
                  }

                  if (q.type === 'short-answer') {
                    return (q.correctAnswer as string).toLowerCase().trim() ===
                      (userAnswer as string).toLowerCase().trim();
                  }

                  return userAnswer === q.correctAnswer;
                }).length}
              </div>
              <div className="text-sm font-medium text-gray-600">Incorrect</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Link to={`/quiz/${quiz.id}`}>
              <Button className="shadow-lg shadow-[#281C59]/20">
                <RotateCcw className="size-4 mr-2" />
                Retake Quiz
              </Button>
            </Link>
            {!isPublicView && (
              <Link to="/">
                <Button variant="outline" className="app-outline-action shadow-lg">
                  <Home className="size-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            )}
            <Button
              className="shadow-lg shadow-[#281C59]/20"
              onClick={handleShareResults}
            >
              <Share2 className="size-4 mr-2" />
              Share Results
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 rounded-full bg-gradient-to-b from-[#281C59] to-[#5c46a0]"></div>
          <h2 className="app-title-accent text-3xl font-bold">Question Review</h2>
        </div>
        {quiz.questions.map((question, index) => {
          const userAnswer = attempt.answers[question.id];
          let isCorrect = false;

          if (question.type === 'multiple-select') {
            const correctAnswers = question.correctAnswer as string[];
            const userAnswers = (userAnswer as string[]) || [];
            isCorrect = correctAnswers.length === userAnswers.length &&
              correctAnswers.every(ans => userAnswers.includes(ans));
          } else if (question.type === 'short-answer') {
            isCorrect = (question.correctAnswer as string).toLowerCase().trim() ===
              ((userAnswer as string) || '').toLowerCase().trim();
          } else {
            isCorrect = userAnswer === question.correctAnswer;
          }

          return (
            <Card key={question.id} className={`border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${isCorrect ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-orange-50'}`}>
              <div className={`h-2 bg-gradient-to-r ${isCorrect ? 'from-green-400 to-emerald-500' : 'from-red-500 to-orange-500'}`}></div>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${isCorrect ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-orange-500'} shadow-lg`}>
                      {index + 1}
                    </div>
                    <CardTitle className="text-lg">
                      {question.question}
                    </CardTitle>
                  </div>
                  <Badge className={`${isCorrect ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'} text-white shadow-lg`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="size-3 mr-1" />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3 mr-1" />
                        Incorrect
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#281C59]"></span>
                    Your Answer:
                  </p>
                  <p className="text-sm font-medium pl-4">
                    {Array.isArray(userAnswer)
                      ? userAnswer.length > 0 ? userAnswer.join(', ') : 'No answer'
                      : userAnswer || 'No answer'}
                  </p>
                </div>
                {!isCorrect && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-200">
                    <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="size-4" />
                      Correct Answer:
                    </p>
                    <p className="text-sm font-medium text-green-700 pl-4">
                      {Array.isArray(question.correctAnswer)
                        ? question.correctAnswer.join(', ')
                        : question.correctAnswer}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">
                    Points: {question.points}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
