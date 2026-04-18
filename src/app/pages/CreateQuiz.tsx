import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { QuestionEditor } from '../components/QuestionEditor';
import { Quiz, Question } from '../types/quiz';
import { quizStorage } from '../utils/storage-supabase';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function CreateQuiz() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-994e9032/health`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
          toast.error('Backend server is not responding. Please deploy the edge function in Make settings.');
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        setBackendStatus('offline');
        toast.error('Cannot connect to backend. Please deploy the edge function in Make settings.');
      }
    };
    checkBackend();
  }, []);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}-${Math.random()}`,
      type: 'multiple-choice',
      question: '',
      options: ['', ''],
      correctAnswer: '',
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, question: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }

      if (q.type === 'multiple-choice' || q.type === 'multiple-select') {
        if (!q.options || q.options.some((opt) => !opt.trim())) {
          toast.error(`Question ${i + 1} has empty options`);
          return;
        }
      }

      if (q.type === 'multiple-choice' || q.type === 'true-false' || q.type === 'short-answer') {
        if (!q.correctAnswer || (typeof q.correctAnswer === 'string' && !q.correctAnswer.trim())) {
          toast.error(`Question ${i + 1} needs a correct answer`);
          return;
        }
      }

      if (q.type === 'multiple-select') {
        if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
          toast.error(`Question ${i + 1} needs at least one correct answer`);
          return;
        }
      }
    }

    const quiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      questions,
      createdAt: new Date().toISOString(),
    };

    setSaving(true);
    quizStorage.saveQuiz(quiz).then(() => {
      toast.success('Quiz created successfully!');
      navigate('/');
    }).catch(() => {
      toast.error('Failed to save quiz');
    }).finally(() => {
      setSaving(false);
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {backendStatus === 'offline' && (
        <Card className="border-red-200 bg-red-50/95 shadow-lg shadow-red-100/60">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl text-red-500">!</div>
              <div className="flex-1">
                <p className="mb-1 font-semibold text-red-900">Backend Server Not Connected</p>
                <p className="mb-3 text-sm text-red-700">
                  The backend edge function needs to be deployed before you can save quizzes.
                </p>
                <Button
                  onClick={() => navigate('/backend-status')}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Run Diagnostics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="app-hero p-8">
        <div className="app-hero-content flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="app-chip mb-3">
              Create Flow
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Quiz</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Build a professional quiz with clear structure, elegant controls, and a polished premium look.
            </p>
            {backendStatus === 'online' && (
              <p className="mt-3 text-sm text-emerald-200">
                Connected to backend
              </p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || backendStatus !== 'online'}
            className="border-0 shadow-lg shadow-[#281C59]/20 disabled:bg-[#cfc7e6]"
          >
            <Save className="size-4 mr-2" />
            Save Quiz
          </Button>
        </div>
      </div>

      <Card className="app-panel">
        <div className="app-panel-bar"></div>
        <CardHeader className="app-panel-header">
          <CardTitle className="text-slate-900">Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="app-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quiz description (optional)"
              rows={3}
              className="app-input"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Questions</h2>
          <Button onClick={handleAddQuestion} variant="outline" className="app-outline-action shadow-sm">
            <Plus className="size-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card className="app-panel border-dashed py-12 text-center" style={{ borderColor: 'rgba(40, 28, 89, 0.18)' }}>
            <CardContent>
              <div className="app-icon-badge mx-auto mb-4 flex h-14 w-14 rounded-2xl">
                <Plus className="size-6" />
              </div>
              <p className="mb-4 text-slate-600">No questions yet</p>
              <Button onClick={handleAddQuestion} className="shadow-lg shadow-[#281C59]/20">
                <Plus className="size-4 mr-2" />
                Add Your First Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              onUpdate={(q) => handleUpdateQuestion(index, q)}
              onDelete={() => handleDeleteQuestion(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}
