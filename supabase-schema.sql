-- Quiz Builder Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY,
  "quizId" UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  "userDetails" JSONB NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  "maxScore" INTEGER NOT NULL,
  "completedAt" TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts("quizId");
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts("completedAt");
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
-- Anyone can read quizzes
CREATE POLICY "Public read access for quizzes" ON quizzes
  FOR SELECT USING (true);

-- Anyone can create quizzes
CREATE POLICY "Public insert access for quizzes" ON quizzes
  FOR INSERT WITH CHECK (true);

-- Anyone can update quizzes
CREATE POLICY "Public update access for quizzes" ON quizzes
  FOR UPDATE USING (true);

-- Anyone can delete quizzes
CREATE POLICY "Public delete access for quizzes" ON quizzes
  FOR DELETE USING (true);

-- Anyone can read attempts
CREATE POLICY "Public read access for attempts" ON quiz_attempts
  FOR SELECT USING (true);

-- Anyone can submit attempts
CREATE POLICY "Public insert access for attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (true);

-- Create updated_at trigger for quizzes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
