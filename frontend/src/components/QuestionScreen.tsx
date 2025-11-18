import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Eye, ChevronRight, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey, supabaseUrl, supabaseFunctionSlug } from '../utils/supabase/info';

interface QuestionScreenProps {
  onComplete: (correct: boolean, xp: number) => void;
  onNext: () => void;
  lessonId?: string;
}

interface Answer {
  id: string;
  question_id: string;
  answer_text?: string;
  image_url?: string;
  is_correct: boolean;
  order?: number;
}

interface Question {
  id: string;
  type: string;
  question_text: string;
  image_url?: string;
  xp: number;
  explanation?: string;
  answers?: Answer[];
}

export function QuestionScreen({ onComplete, onNext, lessonId }: QuestionScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const progress = 45; // Mock progress - can be calculated based on lesson progress

  // Fetch a random question on mount
  useEffect(() => {
    fetchQuestion();
  }, [lessonId]);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const base = supabaseUrl || (projectId ? `https://${projectId}.supabase.co` : "");
      const slug = supabaseFunctionSlug || 'make-server-1dd7ea02';
      const url = new URL(`${base}/functions/v1/${slug}/questions/random`);
      if (lessonId) {
        url.searchParams.append('lessonId', lessonId);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch question: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.question) {
        setCurrentQuestion(data.question);
      } else {
        throw new Error('No question data received');
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      setError(err instanceof Error ? err.message : 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || !currentQuestion || !currentQuestion.answers) return;
    setHasAnswered(true);
    const selectedAnswerObj = currentQuestion.answers[selectedAnswer];
    const isCorrect = selectedAnswerObj?.is_correct === true;
    const xpEarned = isCorrect ? currentQuestion.xp : 0;
    onComplete(isCorrect, xpEarned);
  };

  const handleSeeAnswer = () => {
    if (!currentQuestion || !currentQuestion.answers) return;
    setShowAnswer(true);
    setHasAnswered(true);
    // Find the correct answer index
    const correctIndex = currentQuestion.answers.findIndex(ans => ans.is_correct === true);
    setSelectedAnswer(correctIndex);
    onComplete(false, 0); // No XP for seeing the answer
  };

  const handleNext = () => {
    // Reset state
    setSelectedAnswer(null);
    setShowAnswer(false);
    setHasAnswered(false);
    
    // Fetch new question
    fetchQuestion();
    onNext();
  };

  const getAnswerClassName = (index: number) => {
    if (!currentQuestion || !currentQuestion.answers) return '';
    
    if (!hasAnswered) {
      return selectedAnswer === index
        ? 'bg-accent border-accent text-accent-foreground scale-[0.98]'
        : 'bg-card border-border hover:border-accent/50 hover:bg-accent/5';
    }

    const answer = currentQuestion.answers[index];
    if (answer?.is_correct) {
      return 'bg-primary/10 border-primary text-foreground';
    }

    if (selectedAnswer === index && !answer?.is_correct) {
      return 'bg-destructive/10 border-destructive text-foreground';
    }

    return 'bg-card border-border opacity-50';
  };

  // Sort answers by order if available
  const getSortedAnswers = () => {
    if (!currentQuestion?.answers) return [];
    
    return [...currentQuestion.answers].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl border-4 border-destructive/20 text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h2>Oops!</h2>
          <p className="text-muted-foreground">
            {error || 'Failed to load question. Please try again.'}
          </p>
          <Button
            onClick={fetchQuestion}
            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const sortedAnswers = getSortedAnswers();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b-4 border-primary/20 p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button className="text-muted-foreground hover:text-foreground">✕</button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm">{progress}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-3 bg-muted" />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-md mx-auto px-6 py-6 space-y-6">
          {/* Question Text */}
          <div className="text-center">
            <h2 className="mb-2">{currentQuestion.question_text}</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>🌟</span>
              <span>+{currentQuestion.xp} XP</span>
            </div>
          </div>

          {/* Question Type: 1img_4txt or 1img_3txt */}
          {(currentQuestion.type === '1img_4txt' || currentQuestion.type === '1img_3txt') && (
            <>
              {currentQuestion.image_url && (
                <div className="rounded-3xl overflow-hidden border-4 border-primary/20 shadow-lg">
                  <ImageWithFallback
                    src={currentQuestion.image_url}
                    alt="Question image"
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                {sortedAnswers.map((answer, index) => (
                  <button
                    key={answer.id}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-2xl border-4 transition-all ${getAnswerClassName(
                      index
                    )}`}
                  >
                    <span className="block text-center">{answer.answer_text}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Question Type: 2_img_only */}
          {currentQuestion.type === '2_img_only' && (
            <div className="grid grid-cols-1 gap-4">
              {sortedAnswers.map((answer, index) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnswered}
                  className={`rounded-3xl overflow-hidden border-4 transition-all ${getAnswerClassName(
                    index
                  )}`}
                >
                  {answer.image_url && (
                    <ImageWithFallback
                      src={answer.image_url}
                      alt={answer.answer_text || `Option ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-3 bg-card/80 backdrop-blur-sm">
                    <span>{answer.answer_text || `Option ${index + 1}`}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Question Type: 4_txt_only */}
          {currentQuestion.type === '4_txt_only' && (
            <div className="space-y-3">
              {sortedAnswers.map((answer, index) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnswered}
                  className={`w-full p-5 rounded-2xl border-4 transition-all ${getAnswerClassName(
                    index
                  )}`}
                >
                  <span className="block">{answer.answer_text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Explanation (shown after answer) */}
          {hasAnswered && (
            <div className="p-4 bg-primary/5 border-4 border-primary/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="mb-1">Did you know?</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.explanation || 
                      'Mushrooms are the fruiting bodies of fungi and play a crucial role in decomposing organic matter in forests.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t-4 border-primary/20 p-6 shadow-lg">
        <div className="max-w-md mx-auto space-y-3">
          {!hasAnswered ? (
            <>
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                Submit Answer
              </Button>
              <Button
                onClick={handleSeeAnswer}
                variant="outline"
                className="w-full h-12 rounded-2xl border-2"
              >
                <Eye className="w-4 h-4 mr-2" />
                See Answer (No XP)
              </Button>
            </>
          ) : (
            <Button
              onClick={handleNext}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
