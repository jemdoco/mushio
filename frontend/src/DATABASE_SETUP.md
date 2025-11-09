# Database Setup Guide

This app connects to your Supabase database to fetch questions and lessons. Below is the expected database structure.

## Required Tables

### 1. `questions` table

This table stores all the quiz questions.

**Columns:**

| Column Name | Type | Description | Required |
|------------|------|-------------|----------|
| `id` | uuid or text | Unique identifier (Primary Key) | Yes |
| `type` | text | Question type: `1img_4txt`, `1img_3txt`, `2_img_only`, or `4_txt_only` | Yes |
| `question_text` | text | The question (40-52 characters recommended) | Yes |
| `image_url` | text | URL for the main image (for `1img_4txt` and `1img_3txt` types) | No |
| `xp` | integer | XP points awarded for correct answer | Yes |
| `explanation` | text | Fun fact or explanation shown after answering | No |
| `lesson_id` | text or uuid | ID linking to the lesson (optional grouping) | No |

**Question Type Details:**

- **`1img_4txt`**: Shows 1 image + 4 text answers
  - Requires: `image_url` + 4 answers in the `answers` table
  
- **`1img_3txt`**: Shows 1 image + 3 text answers
  - Requires: `image_url` + 3 answers in the `answers` table
  
- **`2_img_only`**: Shows question text + 2 image options
  - Requires: 2 answers in the `answers` table with `image_url` populated
  
- **`4_txt_only`**: Shows question text + 4 text answers (no image)
  - Requires: 4 answers in the `answers` table

**Example SQL:**

```sql
-- Create the questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  image_url TEXT,
  xp INTEGER DEFAULT 10,
  explanation TEXT,
  lesson_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example question
INSERT INTO questions (id, type, question_text, image_url, xp, explanation, lesson_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '1img_4txt',
  'Which family does the mushroom below belong to?',
  'https://example.com/mushroom1.jpg',
  10,
  'The Agaricaceae family includes common mushrooms like button mushrooms and portobello!',
  'lesson-1'
);
```

### 2. `answers` table

This table stores all answer options for questions. Each question has multiple answers.

**Columns:**

| Column Name | Type | Description | Required |
|------------|------|-------------|----------|
| `id` | uuid or text | Unique identifier (Primary Key) | Yes |
| `question_id` | uuid or text | Foreign key to `questions.id` | Yes |
| `answer_text` | text | Text content of the answer | Conditional* |
| `image_url` | text | Image URL for image-based answers (`2_img_only` type) | Conditional* |
| `is_correct` | boolean | Whether this is the correct answer | Yes |
| `order` | integer | Display order (0, 1, 2, 3...) | Recommended |

*For text-based questions, `answer_text` is required. For `2_img_only` questions, `image_url` is required.

**Important:** Set up a foreign key relationship between `answers.question_id` and `questions.id`.

**Example SQL:**

```sql
-- Create the answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  image_url TEXT,
  is_correct BOOLEAN DEFAULT FALSE,
  "order" INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Example answers for a 1img_4txt question
INSERT INTO answers (question_id, answer_text, is_correct, "order")
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Agaricaceae', TRUE, 0),
  ('550e8400-e29b-41d4-a716-446655440000', 'Boletaceae', FALSE, 1),
  ('550e8400-e29b-41d4-a716-446655440000', 'Russulaceae', FALSE, 2),
  ('550e8400-e29b-41d4-a716-446655440000', 'Amanitaceae', FALSE, 3);

-- Example answers for a 2_img_only question
INSERT INTO answers (question_id, answer_text, image_url, is_correct, "order")
VALUES 
  ('another-question-id', 'Morel Mushroom', 'https://example.com/morel.jpg', TRUE, 0),
  ('another-question-id', 'Poisonous Mushroom', 'https://example.com/poisonous.jpg', FALSE, 1);
```

### 3. `lessons` table (Optional)

This table organizes questions into lessons or categories.

**Columns:**

| Column Name | Type | Description | Required |
|------------|------|-------------|----------|
| `id` | uuid or text | Unique identifier (Primary Key) | Yes |
| `title` | text | Lesson title (e.g., "Forest Mushrooms") | Yes |
| `description` | text | Brief description of the lesson | No |
| `order` | integer | Display order | Yes |
| `category` | text | Category grouping | No |
| `icon` | text | Emoji or icon identifier | No |

**Example SQL:**

```sql
-- Create the lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  category TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example lesson
INSERT INTO lessons (id, title, description, "order", category, icon)
VALUES (
  'lesson-1',
  'Forest Mushrooms',
  'Learn to identify common forest mushroom species',
  1,
  'identification',
  '🌲'
);
```

## Database Relationships

```
questions (1) ----< (many) answers
lessons (1) ----< (many) questions
```

## API Endpoints Available

The app uses these endpoints to interact with your database:

1. **GET** `/make-server-1dd7ea02/questions/random`
   - Fetches a random question with its answers
   - Query params: `lessonId` (optional), `type` (optional)
   - Returns: `{ question: { ...questionData, answers: [...answersArray] } }`

2. **GET** `/make-server-1dd7ea02/questions`
   - Fetches all questions with their answers
   - Query params: `lessonId` (optional), `type` (optional)
   - Returns: `{ questions: [{ ...questionData, answers: [...answersArray] }] }`

3. **GET** `/make-server-1dd7ea02/questions/:id`
   - Fetches a specific question by ID with its answers
   - Returns: `{ question: { ...questionData, answers: [...answersArray] } }`

4. **POST** `/make-server-1dd7ea02/questions/:id/submit`
   - Submits an answer and checks if correct
   - Body: `{ answerId: string, userId?: string }`
   - Returns: `{ isCorrect: boolean, xpEarned: number, correctAnswerId: string }`

5. **GET** `/make-server-1dd7ea02/lessons`
   - Fetches all lessons
   - Returns: `{ lessons: [...lessonsArray] }`

## Quick Setup Steps

1. **Create the tables** using the SQL above in your Supabase SQL editor
2. **Set up foreign key** from `answers.question_id` to `questions.id`
3. **Add sample data** for testing
4. **Test the connection** - the app will automatically fetch and display questions!

## Example Complete Question Setup

```sql
-- Insert a question
INSERT INTO questions (id, type, question_text, image_url, xp, explanation)
VALUES (
  'q1',
  '1img_3txt',
  'The underside of this mushroom shows which feature?',
  'https://images.unsplash.com/photo-1586686804243-d763a9afb755',
  10,
  'Gills are the thin, blade-like structures under the mushroom cap where spores are produced.'
);

-- Insert answers for the question
INSERT INTO answers (question_id, answer_text, is_correct, "order")
VALUES 
  ('q1', 'Gills', TRUE, 0),
  ('q1', 'Pores', FALSE, 1),
  ('q1', 'Teeth', FALSE, 2);
```

## Important Notes

- Each question must have at least 2 answers in the `answers` table
- Only ONE answer per question should have `is_correct = TRUE`
- The `order` field determines how answers are displayed (0 = first, 1 = second, etc.)
- For `2_img_only` questions, populate `image_url` in the answers table, not the questions table
- All image URLs should be publicly accessible
- Use `ON DELETE CASCADE` to automatically delete answers when a question is deleted
