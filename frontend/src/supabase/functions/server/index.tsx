import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1dd7ea02/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all questions for a lesson
app.get("/make-server-1dd7ea02/questions", async (c) => {
  try {
    const lessonId = c.req.query('lessonId');
    const questionType = c.req.query('type');
    
    let query = supabase.from('questions').select('*, answers(*)');
    
    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }
    
    if (questionType) {
      query = query.eq('type', questionType);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching questions from Supabase:', error);
      return c.json({ error: `Failed to fetch questions: ${error.message}` }, 500);
    }
    
    return c.json({ questions: data || [] });
  } catch (err) {
    console.error('Error in /questions endpoint:', err);
    return c.json({ error: `Server error: ${err.message}` }, 500);
  }
});

// Get a single random question
app.get("/make-server-1dd7ea02/questions/random", async (c) => {
  try {
    const questionType = c.req.query('type');
    const lessonId = c.req.query('lessonId');
    
    let query = supabase.from('questions').select('*, answers(*)');
    
    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }
    
    if (questionType) {
      query = query.eq('type', questionType);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching random question from Supabase:', error);
      return c.json({ error: `Failed to fetch question: ${error.message}` }, 500);
    }
    
    if (!data || data.length === 0) {
      return c.json({ error: 'No questions found' }, 404);
    }
    
    // Get a random question from the results
    const randomQuestion = data[Math.floor(Math.random() * data.length)];
    
    return c.json({ question: randomQuestion });
  } catch (err) {
    console.error('Error in /questions/random endpoint:', err);
    return c.json({ error: `Server error: ${err.message}` }, 500);
  }
});

// Get a specific question by ID
app.get("/make-server-1dd7ea02/questions/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const { data, error } = await supabase
      .from('questions')
      .select('*, answers(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching question from Supabase:', error);
      return c.json({ error: `Failed to fetch question: ${error.message}` }, 500);
    }
    
    if (!data) {
      return c.json({ error: 'Question not found' }, 404);
    }
    
    return c.json({ question: data });
  } catch (err) {
    console.error('Error in /questions/:id endpoint:', err);
    return c.json({ error: `Server error: ${err.message}` }, 500);
  }
});

// Submit an answer and check if it's correct
app.post("/make-server-1dd7ea02/questions/:id/submit", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { answerId, userId } = body;
    
    // Get the question with answers
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*, answers(*)')
      .eq('id', id)
      .single();
    
    if (questionError || !question) {
      console.error('Error fetching question:', questionError);
      return c.json({ error: 'Question not found' }, 404);
    }
    
    // Find the selected answer
    const selectedAnswer = question.answers?.find((ans: any) => ans.id === answerId);
    
    if (!selectedAnswer) {
      return c.json({ error: 'Answer not found' }, 404);
    }
    
    const isCorrect = selectedAnswer.is_correct === true;
    const xpEarned = isCorrect ? (question.xp || 10) : 0;
    
    // Find the correct answer for feedback
    const correctAnswer = question.answers?.find((ans: any) => ans.is_correct === true);
    
    // If userId is provided, save the result (optional)
    if (userId && isCorrect) {
      // You can track user progress here
      // For now, we'll just return the result
    }
    
    return c.json({
      isCorrect,
      xpEarned,
      correctAnswerId: correctAnswer?.id,
    });
  } catch (err) {
    console.error('Error in /questions/:id/submit endpoint:', err);
    return c.json({ error: `Server error: ${err.message}` }, 500);
  }
});

// Get lessons
app.get("/make-server-1dd7ea02/lessons", async (c) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) {
      console.error('Error fetching lessons from Supabase:', error);
      return c.json({ error: `Failed to fetch lessons: ${error.message}` }, 500);
    }
    
    return c.json({ lessons: data || [] });
  } catch (err) {
    console.error('Error in /lessons endpoint:', err);
    return c.json({ error: `Server error: ${err.message}` }, 500);
  }
});

Deno.serve(app.fetch);