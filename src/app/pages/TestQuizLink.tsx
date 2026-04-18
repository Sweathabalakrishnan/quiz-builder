import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

export function TestQuizLink() {
  const navigate = useNavigate();
  const [testing, setTesting] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [quizFound, setQuizFound] = useState(false);

  const specificQuizId = 'quiz-1776057211776';
  const apiBase = `https://${projectId}.supabase.co/functions/v1/make-server-994e9032`;

  const runTests = async () => {
    setTesting(true);
    setQuizFound(false);
    const results: TestResult[] = [];

    results.push({ name: 'Backend Health Check', status: 'pending', message: 'Testing...' });
    setTests([...results]);

    try {
      const healthResponse = await fetch(`${apiBase}/health`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (healthResponse.ok) {
        const data = await healthResponse.json();
        results[0] = {
          name: 'Backend Health Check',
          status: 'success',
          message: 'Backend server is online and responding',
          details: JSON.stringify(data),
        };
      } else {
        results[0] = {
          name: 'Backend Health Check',
          status: 'error',
          message: 'Backend server returned an error',
          details: `HTTP ${healthResponse.status}`,
        };
      }
    } catch (error) {
      results[0] = {
        name: 'Backend Health Check',
        status: 'error',
        message: 'Cannot connect to backend server',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
      setTests([...results]);
      setTesting(false);
      return;
    }

    setTests([...results]);

    results.push({ name: 'Get All Quizzes', status: 'pending', message: 'Testing...' });
    setTests([...results]);

    try {
      const quizzesResponse = await fetch(`${apiBase}/quizzes`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (quizzesResponse.ok) {
        const quizzes = await quizzesResponse.json();
        results[1] = {
          name: 'Get All Quizzes',
          status: 'success',
          message: `Found ${Array.isArray(quizzes) ? quizzes.length : 0} quiz(es) in database`,
          details: quizzes.map((q: any) => `${q.title} (${q.id})`).join(', '),
        };
      } else {
        results[1] = {
          name: 'Get All Quizzes',
          status: 'error',
          message: 'Failed to fetch quizzes',
          details: `HTTP ${quizzesResponse.status}`,
        };
      }
    } catch (error) {
      results[1] = {
        name: 'Get All Quizzes',
        status: 'error',
        message: 'Quiz API failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    setTests([...results]);

    results.push({
      name: 'Get Specific Quiz',
      status: 'pending',
      message: `Checking quiz: ${specificQuizId}...`,
    });
    setTests([...results]);

    try {
      const quizResponse = await fetch(`${apiBase}/quizzes/${specificQuizId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (quizResponse.ok) {
        const quiz = await quizResponse.json();
        if (quiz && quiz.title) {
          results[2] = {
            name: 'Get Specific Quiz',
            status: 'success',
            message: `Quiz found: "${quiz.title}"`,
            details: `${quiz.questions?.length || 0} questions | Created: ${new Date(quiz.createdAt).toLocaleString()}`,
          };
          setQuizFound(true);
        } else {
          results[2] = {
            name: 'Get Specific Quiz',
            status: 'error',
            message: 'Quiz not found in backend database',
            details: 'Quiz was likely saved locally only. Create it again after backend setup.',
          };
        }
      } else if (quizResponse.status === 404) {
        results[2] = {
          name: 'Get Specific Quiz',
          status: 'error',
          message: 'Quiz does not exist in backend',
          details: 'Create the quiz again now that the backend is available.',
        };
      } else {
        results[2] = {
          name: 'Get Specific Quiz',
          status: 'error',
          message: 'Failed to get quiz',
          details: `HTTP ${quizResponse.status}`,
        };
      }
    } catch (error) {
      results[2] = {
        name: 'Get Specific Quiz',
        status: 'error',
        message: 'Request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    setTests([...results]);
    setTesting(false);
  };

  const allPassed = tests.length > 0 && tests.every((t) => t.status === 'success');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="app-hero p-6">
        <div className="app-hero-content flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="bg-white/80 text-slate-700 hover:bg-white">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Test Your Quiz Link</h1>
            <p className="text-slate-600">
              Testing quiz ID: <code className="rounded bg-white/80 px-2 py-1 text-slate-700">{specificQuizId}</code>
            </p>
          </div>
          <Button onClick={runTests} disabled={testing} className="shadow-lg shadow-[#281C59]/20">
            {testing ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>
      </div>

      {tests.length === 0 && (
        <Card className="app-panel">
          <CardContent className="pb-12 pt-12 text-center">
            <p className="mb-4 text-gray-600">Click "Run Tests" to check if your quiz link works.</p>
            <Button onClick={runTests} size="lg">
              Start Testing
            </Button>
          </CardContent>
        </Card>
      )}

      {tests.length > 0 && (
        <div className="space-y-4">
          {tests.map((test, idx) => (
            <Card
              key={idx}
              className={`border-l-4 ${
                test.status === 'success'
                  ? 'border-l-green-500 bg-green-50'
                  : test.status === 'error'
                  ? 'border-l-red-500 bg-red-50'
                  : 'border-l-[#281C59] bg-[#f7f4fd]'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {test.status === 'success' ? (
                    <CheckCircle className="mt-0.5 size-6 shrink-0 text-green-600" />
                  ) : test.status === 'error' ? (
                    <XCircle className="mt-0.5 size-6 shrink-0 text-red-600" />
                  ) : (
                    <Loader2 className="mt-0.5 size-6 shrink-0 animate-spin text-[#281C59]" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`mb-1 font-semibold ${
                        test.status === 'success'
                          ? 'text-green-900'
                          : test.status === 'error'
                          ? 'text-red-900'
                          : 'text-[#281C59]'
                      }`}
                    >
                      {test.name}
                    </p>
                    <p
                      className={`text-sm ${
                        test.status === 'success'
                          ? 'text-green-700'
                          : test.status === 'error'
                          ? 'text-red-700'
                          : 'text-[#5e5380]'
                      }`}
                    >
                      {test.message}
                    </p>
                    {test.details && (
                      <p
                        className={`mt-2 font-mono text-xs ${
                          test.status === 'success'
                            ? 'text-green-600'
                            : test.status === 'error'
                            ? 'text-red-600'
                            : 'text-[#6d6192]'
                        }`}
                      >
                        {test.details}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {allPassed && quizFound && (
            <Card className="border-l-4 border-l-[#281C59] bg-[#f7f4fd]">
              <CardHeader>
                <CardTitle className="text-[#281C59]">All Tests Passed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-semibold text-[#5e5380]">Your quiz link is working correctly.</p>
                <div className="rounded-lg bg-white p-4">
                  <p className="mb-2 text-sm text-gray-600">Share this link with students:</p>
                  <code className="block break-all rounded bg-gray-100 p-3 text-sm">
                    https://60a122b3-342d-4b00-bb7b-7ca28f4170ea-v3-figmaiframepreview.figma.site/quiz/{specificQuizId}
                  </code>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <p className="mb-2 font-semibold text-[#281C59]">Students can now:</p>
                  <ul className="space-y-1 text-sm text-[#5e5380]">
                    <li>Open this link from any browser</li>
                    <li>Access it from phone, tablet, or desktop</li>
                    <li>Take the quiz and submit answers</li>
                    <li>Get results immediately</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {tests.some((t) => t.status === 'error') && !allPassed && (
            <Card className="border-l-4 border-l-orange-500 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900">Action Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tests[0]?.status === 'error' && (
                  <div>
                    <p className="mb-2 font-semibold text-orange-900">Backend Not Deployed:</p>
                    <ol className="ml-5 list-decimal space-y-2 text-sm text-orange-800">
                      <li>
                        Go to{' '}
                        <a
                          href="https://supabase.com/dashboard/project/ecihrubcueotcqmosqti/functions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline"
                        >
                          Supabase Functions
                        </a>
                      </li>
                      <li>Open `make-server-994e9032`</li>
                      <li>Click Deploy</li>
                      <li>Wait for the success message</li>
                      <li>Come back and run the tests again</li>
                    </ol>
                  </div>
                )}
                {tests[0]?.status === 'success' && tests[2]?.status === 'error' && (
                  <div>
                    <p className="mb-2 font-semibold text-orange-900">Quiz Not in Database:</p>
                    <ol className="ml-5 list-decimal space-y-2 text-sm text-orange-800">
                      <li>Go back to the dashboard</li>
                      <li>Create the quiz again</li>
                      <li>Make sure the backend connection is shown as working</li>
                      <li>Save the quiz</li>
                      <li>Use the newly generated share link</li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
