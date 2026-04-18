import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Users, TrendingUp, Award, FileText, ArrowLeft, Trophy, Target, Download, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { quizStorage } from '../utils/storage-supabase';
import { QuizAttempt, Quiz } from '../types/quiz';

interface StudentResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  percentage: number;
}

export function StudentResults() {
  const [allResults, setAllResults] = useState<StudentResult[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedQuiz, setSelectedQuiz] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const attempts = await quizStorage.getAllAttempts();
        
        const results: StudentResult[] = await Promise.all(
          attempts
            .filter(attempt => attempt.userDetails)
            .map(async (attempt) => {
              const quiz = await quizStorage.getQuiz(attempt.quizId);
              if (!quiz) return null;
              const percentage = (attempt.score / attempt.maxScore) * 100;
              return { attempt, quiz, percentage };
            })
        ).then(results => results.filter((result): result is StudentResult => result !== null));

        setAllResults(results);
      } catch (error) {
        console.error('Error loading student results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get unique departments and quizzes
  const departments = useMemo(() => {
    const depts = new Set(
      allResults
        .map(r => r.attempt.userDetails?.department)
        .filter(Boolean)
    );
    return Array.from(depts).sort();
  }, [allResults]);

  const quizzes = useMemo(() => {
    const uniqueQuizzes = new Map<string, string>();
    allResults.forEach(r => {
      if (!uniqueQuizzes.has(r.quiz.id)) {
        uniqueQuizzes.set(r.quiz.id, r.quiz.title);
      }
    });
    return Array.from(uniqueQuizzes.entries());
  }, [allResults]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = allResults;

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(
        r => r.attempt.userDetails?.department === selectedDepartment
      );
    }

    // Filter by quiz
    if (selectedQuiz !== 'all') {
      filtered = filtered.filter(r => r.quiz.id === selectedQuiz);
    }

    // Search by name, roll no, or email
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const details = r.attempt.userDetails;
        if (!details) return false;
        return (
          details.name.toLowerCase().includes(term) ||
          details.rollNo.toLowerCase().includes(term) ||
          details.email.toLowerCase().includes(term)
        );
      });
    }

    // Sort by score (highest first)
    return filtered.sort((a, b) => b.percentage - a.percentage);
  }, [allResults, selectedDepartment, selectedQuiz, searchTerm]);

  // Calculate department statistics
  const departmentStats = useMemo(() => {
    const stats = new Map<string, { count: number; avgScore: number; totalScore: number }>();
    
    allResults.forEach(r => {
      const dept = r.attempt.userDetails?.department;
      if (!dept) return;
      
      const current = stats.get(dept) || { count: 0, avgScore: 0, totalScore: 0 };
      current.count += 1;
      current.totalScore += r.percentage;
      current.avgScore = current.totalScore / current.count;
      stats.set(dept, current);
    });

    return Array.from(stats.entries())
      .map(([dept, data]) => ({ dept, ...data }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [allResults]);

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-[#281C59] text-white';
  };

  const exportToCSV = () => {
    const headers = ['Rank', 'Name', 'Roll No', 'Department', 'College', 'Email', 'Quiz', 'Score', 'Max Score', 'Percentage', 'Grade', 'Completed At'];
    const rows = filteredResults.map((r, index) => [
      index + 1,
      r.attempt.userDetails?.name || '',
      r.attempt.userDetails?.rollNo || '',
      r.attempt.userDetails?.department || '',
      r.attempt.userDetails?.college || '',
      r.attempt.userDetails?.email || '',
      r.quiz.title,
      r.attempt.score,
      r.attempt.maxScore,
      r.percentage.toFixed(2) + '%',
      getGrade(r.percentage),
      new Date(r.attempt.completedAt).toLocaleString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with gradient */}
      <div className="app-hero p-8">
        <div className="app-hero-content flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="bg-white/80 text-slate-700 hover:bg-white"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80">
                <Users className="size-6" />
              </div>
              Student Results Dashboard
            </h1>
            <p className="text-lg text-slate-600">View and analyze all student quiz attempts</p>
          </div>
          <Button onClick={exportToCSV} className="shadow-lg shadow-[#281C59]/20">
            <Download className="size-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="app-stat-card">
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#281C59]">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold">{allResults.length}</div>
          </CardContent>
        </Card>
        <Card className="app-stat-card">
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#281C59]">Departments</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card className="app-stat-card">
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#281C59]">Average Score</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold">
              {allResults.length > 0
                ? (allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length).toFixed(1)
                : '0'}%
            </div>
          </CardContent>
        </Card>
        <Card className="app-stat-card">
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#281C59]">Quizzes</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold">{quizzes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      {departmentStats.length > 0 && (
        <Card className="app-panel">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departmentStats.map((stat, index) => (
                <div key={stat.dept} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Badge className={getRankBadgeColor(index + 1)}>
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{stat.dept}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.count} {stat.count === 1 ? 'attempt' : 'attempts'}
                  </div>
                  <div className="text-lg font-bold text-[#281C59]">
                    {stat.avgScore.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="app-panel">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by name, roll no, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="app-input pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="app-input w-full md:w-[200px]">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
              <SelectTrigger className="app-input w-full md:w-[200px]">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="All Quizzes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                {quizzes.map(([id, title]) => (
                  <SelectItem key={id} value={id}>{title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="app-panel">
        <CardHeader>
          <CardTitle>
            Student Rankings 
            {selectedDepartment !== 'all' && ` - ${selectedDepartment}`}
            {selectedQuiz !== 'all' && ` - ${quizzes.find(([id]) => id === selectedQuiz)?.[1]}`}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Showing {filteredResults.length} of {allResults.length} attempts
          </p>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="size-12 mx-auto mb-4 opacity-50" />
              <p>No student attempts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Rank</th>
                    <th className="text-left p-3 font-semibold">Student</th>
                    <th className="text-left p-3 font-semibold">Roll No</th>
                    <th className="text-left p-3 font-semibold">Department</th>
                    <th className="text-left p-3 font-semibold">Quiz</th>
                    <th className="text-left p-3 font-semibold">Score</th>
                    <th className="text-left p-3 font-semibold">Grade</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => {
                    const details = result.attempt.userDetails!;
                    const grade = getGrade(result.percentage);
                    
                    return (
                      <tr key={result.attempt.id} className="border-b hover:bg-stone-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {index < 3 && <Trophy className={`size-4 ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              'text-orange-600'
                            }`} />}
                            <Badge className={getRankBadgeColor(index + 1)}>
                              #{index + 1}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{details.name}</div>
                            <div className="text-sm text-gray-600">{details.email}</div>
                          </div>
                        </td>
                        <td className="p-3">{details.rollNo}</td>
                        <td className="p-3">
                          <Badge variant="outline">{details.department}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">{result.quiz.title}</div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-bold">{result.attempt.score}/{result.attempt.maxScore}</div>
                            <div className="text-sm text-gray-600">{result.percentage.toFixed(1)}%</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={grade === 'F' ? 'destructive' : 'default'}>
                            {grade}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Link to={`/results/${result.attempt.id}`}>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
