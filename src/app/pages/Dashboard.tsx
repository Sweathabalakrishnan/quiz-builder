import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Edit, Trash2, Play, BarChart, FileText, Users, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { ShareQuizDialog } from '../components/ShareQuizDialog';
import { quizStorage } from '../utils/storage-supabase';
import { Quiz } from '../types/quiz';
import { toast } from 'sonner';

export function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizStorage.getQuizzes();
      setQuizzes(data);
      
      // Load attempt counts for all quizzes
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (quiz) => {
          const attempts = await quizStorage.getQuizAttempts(quiz.id);
          counts[quiz.id] = attempts.length;
        })
      );
      setAttemptCounts(counts);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await quizStorage.deleteQuiz(id);
      await loadQuizzes();
      toast.success('Quiz deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const handleShare = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShareDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="app-hero p-8">
        <div className="app-hero-content flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-slate-900">
            <p className="app-chip mb-3">
              Quiz Flow
            </p>
            <h1 className="mb-2 text-4xl font-bold tracking-tight">My Quizzes</h1>
            <p className="max-w-2xl text-lg text-slate-600">Create, edit, and manage your quizzes with a polished workspace built for everyday use.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/student-results">
              <Button variant="outline" className="app-outline-action backdrop-blur-sm">
                <Users className="size-4 mr-2" />
                Student Results
              </Button>
            </Link>
            <Link to="/create">
              <Button className="border-0 text-white shadow-lg shadow-[#281C59]/20">
                <Plus className="size-4 mr-2" />
                Create Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <Card className="app-panel py-16 text-center">
          <CardContent>
            <div className="app-icon-badge mb-6 inline-flex h-20 w-20 rounded-full">
              <FileText className="size-10" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">Loading...</h3>
            <p className="mb-8 text-lg text-slate-600">
              Please wait while we load your quizzes
            </p>
          </CardContent>
        </Card>
      ) : quizzes.length === 0 ? (
        <Card className="app-panel py-16 text-center">
          <CardContent>
            <div className="app-icon-badge mb-6 inline-flex h-20 w-20 rounded-full">
              <FileText className="size-10" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">No quizzes yet</h3>
            <p className="mb-8 text-lg text-slate-600">
              Get started by creating your first quiz
            </p>
            <Link to="/create">
              <Button className="px-8 py-6 text-lg text-white shadow-xl shadow-[#281C59]/20">
                <Plus className="size-5 mr-2" />
                Create Your First Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => {
            const gradients = [
              'from-[#281C59] to-[#4d378d]',
              'from-[#281C59] to-[#6249a8]',
              'from-[#37246f] to-[#281C59]',
              'from-[#473186] to-[#281C59]',
            ];
            const gradient = gradients[index % gradients.length];
            
            return (
              <Card key={quiz.id} className="app-panel group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                {/* Colorful header */}
                <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                <CardHeader className="app-panel-header">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-[#281C59]/20`}>
                      <FileText className="size-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="mb-1 text-xl text-slate-900">{quiz.title}</CardTitle>
                      <CardDescription className="text-sm text-slate-500">{quiz.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex gap-4">
                    <div className="app-soft-block flex-1 p-3">
                      <p className="mb-1 text-xs font-medium text-[#281C59]">Questions</p>
                      <p className="text-2xl font-bold text-slate-900">{quiz.questions.length}</p>
                    </div>
                    <div className="app-soft-block flex-1 p-3">
                      <p className="mb-1 text-xs font-medium text-[#281C59]">Attempts</p>
                      <p className="text-2xl font-bold text-slate-900">{attemptCounts[quiz.id] || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/quiz/${quiz.id}`} className="flex-1">
                      <Button variant="default" className={`w-full border-0 bg-gradient-to-r ${gradient} text-white shadow-lg shadow-[#281C59]/20 transition-all hover:shadow-xl`}>
                        <Play className="size-4 mr-2" />
                        Take Quiz
                      </Button>
                    </Link>
                    <Link to={`/edit/${quiz.id}`}>
                      <Button variant="outline" size="icon" className="app-outline-action">
                        <Edit className="size-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="border-red-100 bg-white/80 hover:border-red-300 hover:bg-red-50">
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(quiz.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" size="icon" className="app-outline-action" onClick={() => handleShare(quiz)}>
                      <Share2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {selectedQuiz && (
        <ShareQuizDialog 
          open={shareDialogOpen} 
          onOpenChange={setShareDialogOpen} 
          quizId={selectedQuiz.id}
          quizTitle={selectedQuiz.title}
        />
      )}
    </div>
  );
}
