import { Question, QuestionType } from '../types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
}

export function QuestionEditor({ question, index, onUpdate, onDelete }: QuestionEditorProps) {
  const handleQuestionChange = (text: string) => {
    onUpdate({ ...question, question: text });
  };

  const handleTypeChange = (type: QuestionType) => {
    const newQuestion: Question = {
      ...question,
      type,
      options: type === 'true-false' ? ['True', 'False'] : (type === 'short-answer' ? undefined : (question.options || [''])),
      correctAnswer: type === 'multiple-select' ? [] : '',
    };
    onUpdate(newQuestion);
  };

  const handlePointsChange = (points: string) => {
    onUpdate({ ...question, points: parseInt(points) || 1 });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const handleAddOption = () => {
    onUpdate({
      ...question,
      options: [...(question.options || []), ''],
    });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== index);
    onUpdate({ ...question, options: newOptions });
  };

  const handleCorrectAnswerChange = (value: string) => {
    onUpdate({ ...question, correctAnswer: value });
  };

  const handleMultipleSelectChange = (value: string, checked: boolean) => {
    const currentAnswers = (question.correctAnswer as string[]) || [];
    const newAnswers = checked
      ? [...currentAnswers, value]
      : currentAnswers.filter((a) => a !== value);
    onUpdate({ ...question, correctAnswer: newAnswers });
  };

  return (
    <Card className="app-panel">
      <div className="app-panel-bar"></div>
      <CardHeader className="app-panel-header flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
          <GripVertical className="size-5 text-[#7d6ab3]" />
          Question {index + 1}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-600 hover:bg-red-50">
          <Trash2 className="size-4 text-red-600" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-700">Question</Label>
          <Textarea
            value={question.question}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="Enter your question"
            rows={3}
            className="app-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700">Question Type</Label>
            <Select value={question.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="app-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="multiple-select">Multiple Select</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">Points</Label>
            <Input
              type="number"
              min="1"
              value={question.points}
              onChange={(e) => handlePointsChange(e.target.value)}
              className="app-input"
            />
          </div>
        </div>

        {question.type === 'multiple-choice' && (
          <div className="space-y-3">
            <div className="app-soft-block p-3">
              <Label className="font-semibold text-[#281C59]">Options - Click the circle to mark the correct answer</Label>
            </div>
            <RadioGroup value={question.correctAnswer as string} onValueChange={handleCorrectAnswerChange}>
              {question.options?.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-xl border border-transparent p-2 transition-colors hover:border-[#d8d0ee] hover:bg-[#f7f4fd]">
                  <div className="flex min-w-[120px] items-center gap-2">
                    <RadioGroupItem value={option} id={`q${question.id}-opt${idx}`} className="size-5" />
                    <Label htmlFor={`q${question.id}-opt${idx}`} className="cursor-pointer text-sm font-medium">
                      {question.correctAnswer === option ? 'Correct' : 'Mark correct'}
                    </Label>
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="app-input flex-1"
                  />
                  {(question.options?.length || 0) > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(idx)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            <Button variant="outline" size="sm" onClick={handleAddOption} className="app-outline-action">
              <Plus className="size-4 mr-2" />
              Add Option
            </Button>
          </div>
        )}

        {question.type === 'multiple-select' && (
          <div className="space-y-3">
            <div className="app-soft-block p-3">
              <Label className="font-semibold text-[#281C59]">Options - Check all correct answers</Label>
            </div>
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-xl border border-transparent p-2 transition-colors hover:border-[#d8d0ee] hover:bg-[#f7f4fd]">
                <div className="flex min-w-[120px] items-center gap-2">
                  <Checkbox
                    checked={(question.correctAnswer as string[])?.includes(option)}
                    onCheckedChange={(checked) => handleMultipleSelectChange(option, checked as boolean)}
                    id={`q${question.id}-opt${idx}`}
                    className="size-5"
                  />
                  <Label htmlFor={`q${question.id}-opt${idx}`} className="cursor-pointer text-sm font-medium">
                    {(question.correctAnswer as string[])?.includes(option) ? 'Correct' : 'Mark correct'}
                  </Label>
                </div>
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="app-input flex-1"
                />
                {(question.options?.length || 0) > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(idx)}
                    className="hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddOption} className="app-outline-action">
              <Plus className="size-4 mr-2" />
              Add Option
            </Button>
          </div>
        )}

        {question.type === 'true-false' && (
          <div className="space-y-2">
            <Label className="text-slate-700">Correct Answer</Label>
            <RadioGroup value={question.correctAnswer as string} onValueChange={handleCorrectAnswerChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="True" id={`q${question.id}-true`} />
                <Label htmlFor={`q${question.id}-true`}>True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="False" id={`q${question.id}-false`} />
                <Label htmlFor={`q${question.id}-false`}>False</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {question.type === 'short-answer' && (
          <div className="space-y-2">
            <Label className="text-slate-700">Correct Answer</Label>
            <Input
              value={question.correctAnswer as string}
              onChange={(e) => handleCorrectAnswerChange(e.target.value)}
              placeholder="Enter the correct answer"
              className="app-input"
            />
            <p className="text-sm text-slate-600">
              The answer will be checked case-insensitively
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
