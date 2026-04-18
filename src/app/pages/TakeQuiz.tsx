import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CheckCircle, Clock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Quiz, QuizAttempt } from '../types/quiz';
import { quizStorage } from '../utils/storage-supabase';
import { calculateScore } from '../utils/scoring';
import { toast } from 'sonner';

interface UserDetails {
  name: string;
  rollNo: string;
  department: string;
  college: string;
  email: string;
}

export function TakeQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showDetailsForm, setShowDetailsForm] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    rollNo: '',
    department: '',
    college: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<UserDetails>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    quizStorage.getQuiz(id).then((loadedQuiz) => {
      if (!loadedQuiz) {
        toast.error('Quiz not found. The backend server may not be deployed yet.');
        setLoading(false);
        return;
      }

      setQuiz(loadedQuiz);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to load quiz:', error);
      toast.error('Cannot connect to backend server. Please ensure the edge function is deployed.');
      setLoading(false);
    });
  }, [id, navigate]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleDetailsSubmit = () => {
    const newErrors: Partial<UserDetails> = {};

    if (!userDetails.name.trim()) newErrors.name = 'Name is required';
    if (!userDetails.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
    if (!userDetails.department.trim()) newErrors.department = 'Department is required';
    if (!userDetails.college.trim()) newErrors.college = 'College is required';
    if (!userDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(userDetails.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setShowDetailsForm(false);
      toast.success('Details saved! You can now start the quiz.');
    }
  };

  const handleDetailsChange = (field: keyof UserDetails, value: string) => {
    setUserDetails({ ...userDetails, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-20">
        <Card className="text-center p-12">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#281C59]"></div>
          </div>
          <p className="text-lg text-gray-600">Loading quiz...</p>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto mt-20">
        <Card className="border-0 shadow-xl">
          <div className="h-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-500"></div>
          <CardHeader className="bg-gradient-to-br from-red-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                <ArrowLeft className="size-7" />
              </div>
              <div>
                <CardTitle className="text-2xl text-red-900">Quiz Not Found</CardTitle>
                <CardDescription className="text-red-700">
                  Unable to load the quiz
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 pb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-3">
                <span className="font-semibold">⚠️ Possible reasons:</span>
              </p>
              <ul className="text-sm text-red-700 space-y-2 ml-4 list-disc">
                <li>The backend edge function hasn't been deployed yet</li>
                <li>The quiz was not saved successfully</li>
                <li>The quiz ID in the URL is incorrect</li>
                <li>Network connectivity issues</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[#ddd3f1] bg-[#f7f4fd] p-4">
              <p className="text-sm text-[#281C59] mb-2">
                <span className="font-semibold">📋 Instructions for quiz creator:</span>
              </p>
              <ol className="text-sm text-[#5e5380] space-y-2 ml-4 list-decimal">
                <li>Open Figma Make settings page</li>
                <li>Find the Supabase section</li>
                <li>Click "Deploy Edge Function"</li>
                <li>Wait for deployment to complete</li>
                <li>Try saving and sharing the quiz again</li>
              </ol>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showDetailsForm) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Colorful Header */}
        <div className="app-hero p-8">
          <div className="app-hero-content">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="mb-4 bg-white/80 text-slate-700 hover:bg-[#f4effd]"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="text-slate-900">
              <h1 className="text-4xl font-bold mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-slate-600 text-lg">{quiz.description}</p>
              )}
            </div>
          </div>
        </div>

        <Card className="app-panel">
          {/* Colorful top border */}
          <div className="app-panel-bar"></div>
          
          <CardHeader className="app-panel-header pb-4">
            <div className="flex items-center gap-3">
              <div className="app-icon-badge h-14 w-14">
                <User className="size-7" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-slate-900">Personal Details</CardTitle>
                <p className="mt-1 text-slate-600">
                  Please fill in your details before starting the quiz
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-5 pt-6 pb-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#281C59]"></span>
                Full Name *
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  value={userDetails.name}
                  onChange={(e) => handleDetailsChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className={`${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#d8d0ee] focus:ring-[#cfc4ea]'} bg-white transition-all`}
                />
                {!errors.name && userDetails.name && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-green-500" />
                )}
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="font-medium">⚠</span> {errors.name}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="rollNo" className="text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#281C59]"></span>
                  Roll Number *
                </Label>
                <div className="relative">
                  <Input
                    id="rollNo"
                    value={userDetails.rollNo}
                    onChange={(e) => handleDetailsChange('rollNo', e.target.value)}
                    placeholder="Enter your roll number"
                    className={`${errors.rollNo ? 'border-red-500 focus:ring-red-500' : 'border-[#d8d0ee] focus:ring-[#cfc4ea]'} bg-white transition-all`}
                  />
                  {!errors.rollNo && userDetails.rollNo && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-green-500" />
                  )}
                </div>
                {errors.rollNo && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.rollNo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#281C59]"></span>
                  Department *
                </Label>
                <div className="relative">
                  <Input
                    id="department"
                    value={userDetails.department}
                    onChange={(e) => handleDetailsChange('department', e.target.value)}
                    placeholder="Enter your department"
                    className={`${errors.department ? 'border-red-500 focus:ring-red-500' : 'border-[#d8d0ee] focus:ring-[#cfc4ea]'} bg-white transition-all`}
                  />
                  {!errors.department && userDetails.department && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-green-500" />
                  )}
                </div>
                {errors.department && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.department}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="college" className="text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#281C59]"></span>
                College *
              </Label>
              <div className="relative">
                <Input
                  id="college"
                  value={userDetails.college}
                  onChange={(e) => handleDetailsChange('college', e.target.value)}
                  placeholder="Enter your college name"
                  className={`${errors.college ? 'border-red-500 focus:ring-red-500' : 'border-[#d8d0ee] focus:ring-[#cfc4ea]'} bg-white transition-all`}
                />
                {!errors.college && userDetails.college && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-green-500" />
                )}
              </div>
              {errors.college && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="font-medium">⚠</span> {errors.college}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#281C59]"></span>
                Email Address *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={userDetails.email}
                  onChange={(e) => handleDetailsChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className={`${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#d8d0ee] focus:ring-[#cfc4ea]'} bg-white transition-all`}
                />
                {!errors.email && userDetails.email && validateEmail(userDetails.email) && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-green-500" />
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="font-medium">⚠</span> {errors.email}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleDetailsSubmit} 
                className="w-full py-6 text-lg"
              >
                Continue to Quiz
                <ArrowLeft className="size-5 ml-2 rotate-180" />
              </Button>
            </div>

            {/* Info banner */}
            <div className="app-soft-info rounded-lg border-l-4 p-4" style={{ borderLeftColor: '#281C59' }}>
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Note:</span> Your information will be used to track your quiz results and rankings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerChange = (value: string | string[]) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const { score, maxScore } = calculateScore(quiz.questions, answers);
    
    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      answers,
      score,
      maxScore,
      completedAt: new Date().toISOString(),
      userDetails,
    };

    quizStorage.saveAttempt(attempt).then(() => {
      toast.success('Quiz submitted!');
      navigate(`/results/${attempt.id}`);
    }).catch(() => {
      toast.error('Failed to submit quiz');
    }).finally(() => {
      setSubmitting(false);
    });
  };

  const isAnswered = answers[currentQuestion.id] !== undefined && 
    (Array.isArray(answers[currentQuestion.id]) 
      ? (answers[currentQuestion.id] as string[]).length > 0
      : answers[currentQuestion.id] !== '');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600">{quiz.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <span>{currentQuestion.question}</span>
            <span className="text-sm font-normal text-gray-600">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentQuestion.type === 'multiple-choice' && (
            <RadioGroup
              value={answers[currentQuestion.id] as string || ''}
              onValueChange={(value) => handleAnswerChange(value)}
            >
              <div className="space-y-3">
                {currentQuestion.options?.map((option, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      answers[currentQuestion.id] === option
                        ? 'border-[#5c46a0] bg-[#f5f1fc]'
                        : 'border-gray-200 bg-white hover:border-[#cdbfe8] hover:bg-[#f7f4fd]'
                    }`}
                    onClick={() => handleAnswerChange(option)}
                  >
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${idx}`}
                      className="mt-1 size-5"
                    />
                    <Label 
                      htmlFor={`option-${idx}`} 
                      className="flex-1 cursor-pointer text-base font-medium leading-relaxed"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === 'true-false' && (
            <RadioGroup
              value={answers[currentQuestion.id] as string || ''}
              onValueChange={(value) => handleAnswerChange(value)}
            >
              <div className="space-y-3">
                <div 
                  className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    answers[currentQuestion.id] === 'True'
                      ? 'border-[#5c46a0] bg-[#f5f1fc]'
                      : 'border-gray-200 bg-white hover:border-[#cdbfe8] hover:bg-[#f7f4fd]'
                  }`}
                  onClick={() => handleAnswerChange('True')}
                >
                  <RadioGroupItem 
                    value="True" 
                    id="true"
                    className="mt-1 size-5"
                  />
                  <Label htmlFor="true" className="flex-1 cursor-pointer text-base font-medium">True</Label>
                </div>
                <div 
                  className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    answers[currentQuestion.id] === 'False'
                      ? 'border-[#5c46a0] bg-[#f5f1fc]'
                      : 'border-gray-200 bg-white hover:border-[#cdbfe8] hover:bg-[#f7f4fd]'
                  }`}
                  onClick={() => handleAnswerChange('False')}
                >
                  <RadioGroupItem 
                    value="False" 
                    id="false"
                    className="mt-1 size-5"
                  />
                  <Label htmlFor="false" className="flex-1 cursor-pointer text-base font-medium">False</Label>
                </div>
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === 'short-answer' && (
            <div className="space-y-2">
              <Input
                value={answers[currentQuestion.id] as string || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here"
                className="h-12 border-2 text-base focus:border-[#281C59]"
              />
            </div>
          )}

          {currentQuestion.type === 'multiple-select' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#ece6f8] text-[#281C59] text-xs font-bold">
                  ✓
                </span>
                Select all that apply
              </p>
              {currentQuestion.options?.map((option, idx) => {
                const selectedAnswers = (answers[currentQuestion.id] as string[]) || [];
                const isSelected = selectedAnswers.includes(option);
                return (
                  <div 
                    key={idx} 
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#5c46a0] bg-[#f5f1fc]'
                        : 'border-gray-200 bg-white hover:border-[#cdbfe8] hover:bg-[#f7f4fd]'
                    }`}
                    onClick={() => {
                      const newAnswers = isSelected
                        ? selectedAnswers.filter(a => a !== option)
                        : [...selectedAnswers, option];
                      handleAnswerChange(newAnswers);
                    }}
                  >
                    <Checkbox
                      id={`option-${idx}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newAnswers = checked
                          ? [...selectedAnswers, option]
                          : selectedAnswers.filter(a => a !== option);
                        handleAnswerChange(newAnswers);
                      }}
                      className="mt-1 size-5"
                    />
                    <Label 
                      htmlFor={`option-${idx}`} 
                      className="flex-1 cursor-pointer text-base font-medium leading-relaxed"
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!isAnswered || submitting}>
            <CheckCircle className="size-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
}
