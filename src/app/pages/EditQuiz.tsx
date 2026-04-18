import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Plus, Save, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { QuestionEditor } from '../components/QuestionEditor';
import { Quiz, Question } from '../types/quiz';
import { quizStorage } from '../utils/storage-supabase';
import { toast } from 'sonner';

export function EditQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    quizStorage.getQuiz(id).then((quiz) => {
      if (!quiz) {
        toast.error('Quiz not found');
        navigate('/');
        return;
      }

      setTitle(quiz.title);
      setDescription(quiz.description || '');
      setQuestions(quiz.questions);
      setCreatedAt(quiz.createdAt || new Date().toISOString());
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load quiz');
      navigate('/');
    });
  }, [id, navigate]);

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
        if (!q.options || q.options.some(opt => !opt.trim())) {
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
      id: id!,
      title: title.trim(),
      description: description.trim(),
      questions,
      createdAt: createdAt,
    };

    setSaving(true);
    quizStorage.saveQuiz(quiz).then(() => {
      toast.success('Quiz updated successfully!');
      navigate('/');
    }).catch(() => {
      toast.error('Failed to save quiz');
    }).finally(() => {
      setSaving(false);
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="app-hero p-8">
        <div className="app-hero-content flex items-center justify-between">
          <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="bg-white/80 text-slate-700 hover:bg-[#f4effd]">
            <ArrowLeft className="size-4" />
          </Button>
            <div>
              <p className="app-chip mb-3">Edit Flow</p>
              <h1 className="text-3xl font-bold text-slate-900">Edit Quiz</h1>
            </div>
          </div>
        <Button onClick={handleSave} disabled={saving} className="border-0 shadow-lg shadow-[#281C59]/20">
          <Save className="size-4 mr-2" />
          Save Changes
        </Button>
        </div>
      </div>

      <Card className="app-panel">
        <div className="app-panel-bar"></div>
        <CardHeader className="app-panel-header">
          <CardTitle>Quiz Details</CardTitle>
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
          <Button onClick={handleAddQuestion} variant="outline" className="app-outline-action">
            <Plus className="size-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card className="app-panel py-12 text-center">
            <CardContent>
              <p className="text-gray-600 mb-4">No questions yet</p>
              <Button onClick={handleAddQuestion}>
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
