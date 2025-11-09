import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1dd7ea02`;

const headers = {
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
};

export interface Answer {
  id: string;
  question_id: string;
  answer_text?: string;
  image_url?: string;
  is_correct: boolean;
  order?: number;
}

export interface Question {
  id: string;
  type: string;
  question_text: string;
  image_url?: string;
  xp: number;
  explanation?: string;
  lesson_id?: string;
  answers?: Answer[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  category?: string;
  icon?: string;
}

// Fetch a random question
export async function fetchRandomQuestion(lessonId?: string): Promise<Question> {
  const url = new URL(`${API_BASE_URL}/questions/random`);
  if (lessonId) {
    url.searchParams.append('lessonId', lessonId);
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch question: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.question) {
    throw new Error('No question data received');
  }

  return data.question;
}

// Fetch all questions for a lesson
export async function fetchQuestions(lessonId?: string, type?: string): Promise<Question[]> {
  const url = new URL(`${API_BASE_URL}/questions`);
  if (lessonId) {
    url.searchParams.append('lessonId', lessonId);
  }
  if (type) {
    url.searchParams.append('type', type);
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data.questions || [];
}

// Fetch a specific question by ID
export async function fetchQuestionById(id: string): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/questions/${id}`, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch question: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.question) {
    throw new Error('Question not found');
  }

  return data.question;
}

// Submit an answer
export async function submitAnswer(
  questionId: string,
  answerId: string,
  userId?: string
): Promise<{ isCorrect: boolean; xpEarned: number; correctAnswerId: string }> {
  const response = await fetch(`${API_BASE_URL}/questions/${questionId}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ answerId, userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit answer: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

// Fetch all lessons
export async function fetchLessons(): Promise<Lesson[]> {
  const response = await fetch(`${API_BASE_URL}/lessons`, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch lessons: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data.lessons || [];
}
