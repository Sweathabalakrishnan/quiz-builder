import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

export function BackendStatus() {
  const navigate = useNavigate();
  const [testing, setTesting] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    const results: TestResult[] = [];

    // Test 1: Health Check
    results.push({ name: 'Backend Health Check', status: 'pending', message: 'Testing...' });
    setTests([...results]);

    try {
      const healthResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-994e9032/health`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );

      if (healthResponse.ok) {
        results[0] = {
          name: 'Backend Health Check',
          status: 'success',
          message: 'Backend server is online and responding',
          details: `Status: ${healthResponse.status}`,
        };
      } else {
        results[0] = {
          name: 'Backend Health Check',
          status: 'error',
          message: 'Backend server responded with an error',
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
    }

    setTests([...results]);

    // Test 2: Quiz API
    results.push({ name: 'Quiz API Test', status: 'pending', message: 'Testing...' });
    setTests([...results]);

    try {
      const quizzesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-994e9032/quizzes`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (quizzesResponse.ok) {
        const data = await quizzesResponse.json();
        results[1] = {
          name: 'Quiz API Test',
          status: 'success',
          message: 'Quiz API is working',
          details: `Found ${Array.isArray(data) ? data.length : 0} quizzes`,
        };
      } else {
        results[1] = {
          name: 'Quiz API Test',
          status: 'error',
          message: 'Quiz API returned an error',
          details: `HTTP ${quizzesResponse.status}`,
        };
      }
    } catch (error) {
      results[1] = {
        name: 'Quiz API Test',
        status: 'error',
        message: 'Quiz API test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    setTests([...results]);

    // Test 3: Write Test (save a test quiz)
    results.push({ name: 'Write Test', status: 'pending', message: 'Testing...' });
    setTests([...results]);

    try {
      const testQuiz = {
        id: `test-${Date.now()}`,
        title: 'Test Quiz (Can be deleted)',
        description: 'This is a test quiz created by the backend diagnostic tool',
        questions: [],
        createdAt: new Date().toISOString(),
      };

      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-994e9032/quizzes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(testQuiz),
        }
      );

      if (saveResponse.ok) {
        results[2] = {
          name: 'Write Test',
          status: 'success',
          message: 'Successfully saved test quiz to backend',
          details: 'Quiz creation is working correctly',
        };
      } else {
        const errorData = await saveResponse.json().catch(() => ({}));
        results[2] = {
          name: 'Write Test',
          status: 'error',
          message: 'Failed to save test quiz',
          details: errorData.error || `HTTP ${saveResponse.status}`,
        };
      }
    } catch (error) {
      results[2] = {
        name: 'Write Test',
        status: 'error',
        message: 'Write test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    setTests([...results]);
    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const allPassed = tests.length > 0 && tests.every((t) => t.status === 'success');
  const anyFailed = tests.some((t) => t.status === 'error');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="app-hero p-6">
        <div className="app-hero-content flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="bg-white/80 text-slate-700 hover:bg-white">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">Backend Status</h1>
          <p className="text-slate-600">Check if your backend server is properly configured</p>
        </div>
        <Button onClick={runTests} disabled={testing} variant="outline" className="border-stone-200 bg-white/85 text-slate-700 hover:bg-white">
          <RefreshCw className={`size-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
          Retest
        </Button>
        </div>
      </div>

      <Card className="app-panel">
        <div
          className={`h-2 bg-gradient-to-r ${
            allPassed
              ? 'from-green-400 to-emerald-500'
              : anyFailed
              ? 'from-red-400 to-orange-500'
              : 'from-[#281C59] to-[#5c46a0]'
          }`}
        ></div>
        <CardHeader
          className={`${
            allPassed
              ? 'bg-gradient-to-br from-green-50 to-emerald-50'
              : anyFailed
              ? 'bg-gradient-to-br from-red-50 to-orange-50'
              : 'bg-gradient-to-br from-[#f7f4fd] to-white'
          }`}
        >
          <CardTitle className="text-xl">
            {testing
              ? '🔄 Running Tests...'
              : allPassed
              ? '✅ All Tests Passed!'
              : anyFailed
              ? '⚠️ Some Tests Failed'
              : '🔍 Backend Diagnostics'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {tests.map((test, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                test.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : test.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-[#f7f4fd] border-[#ddd3f1]'
              }`}
            >
              <div className="flex items-start gap-3">
                {test.status === 'success' ? (
                  <CheckCircle className="size-5 text-green-600 mt-0.5" />
                ) : test.status === 'error' ? (
                  <XCircle className="size-5 text-red-600 mt-0.5" />
                ) : (
                  <div className="size-5 mt-0.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#281C59]"></div>
                  </div>
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
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
                    className={`text-sm mt-1 ${
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
                      className={`text-xs mt-1 font-mono ${
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
            </div>
          ))}

          {anyFailed && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-yellow-900 font-semibold mb-2">
                🔧 How to Fix:
              </p>
              <ol className="text-sm text-yellow-800 space-y-2 ml-4 list-decimal">
                <li>Open the <strong>Figma Make settings page</strong></li>
                <li>Navigate to the <strong>Supabase section</strong></li>
                <li>Click <strong>"Deploy Edge Function"</strong> button</li>
                <li>Wait for deployment to complete (10-30 seconds)</li>
                <li>Come back to this page and click <strong>"Retest"</strong></li>
              </ol>
            </div>
          )}

          {allPassed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-green-900 font-semibold mb-2">
                🎉 Backend is Ready!
              </p>
              <p className="text-sm text-green-800">
                Your backend server is fully operational. You can now create quizzes, share
                links, and students will be able to access them from any device.
              </p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <p className="text-xs text-gray-600 font-mono break-all">
              <strong>Project ID:</strong> {projectId}
            </p>
            <p className="text-xs text-gray-600 font-mono break-all mt-1">
              <strong>API Endpoint:</strong>{' '}
              https://{projectId}.supabase.co/functions/v1/make-server-994e9032
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
