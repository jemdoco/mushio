import { Check, Lock, Star } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface LessonPathPageProps {
  onStartLesson: (lessonId?: number) => void;
}

export function LessonPathPage({ onStartLesson }: LessonPathPageProps) {
  const lessons = [
    { id: 1, title: 'Introduction to Mushrooms', status: 'completed', xp: 50 },
    { id: 2, title: 'Cap Shapes & Sizes', status: 'completed', xp: 50 },
    { id: 3, title: 'Gill Patterns', status: 'completed', xp: 50 },
    { id: 4, title: 'Stem Characteristics', status: 'current', xp: 50 },
    { id: 5, title: 'Spore Prints', status: 'locked', xp: 50 },
    { id: 6, title: 'Habitat Recognition', status: 'locked', xp: 50 },
    { id: 7, title: 'Unit Test', status: 'locked', xp: 100, isTest: true },
  ];

  const completedCount = lessons.filter((l) => l.status === 'completed').length;
  const totalCount = lessons.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const currentLesson = lessons.find((lesson) => lesson.status === 'current') ?? lessons[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          <button className="text-primary-foreground/80 mb-4">← Back</button>
          <h1 className="text-primary-foreground mb-2">Forest Mushrooms</h1>
          <p className="text-primary-foreground/80 mb-4">
            Unit 1: Basic Identification
          </p>

          {/* Progress */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 border-2 border-primary-foreground/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-primary-foreground/90">
                {completedCount} of {totalCount} lessons
              </span>
              <span className="text-primary-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <Progress
              value={progressPercent}
              className="h-3 bg-primary-foreground/20"
            />
          </div>
        </div>
        <div className="max-w-md mx-auto mt-4">
          <Button
            className="w-full h-12 rounded-2xl bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={() => onStartLesson(currentLesson?.id)}
          >
            Start Here
          </Button>
        </div>
      </div>

      {/* Lesson Path */}
      <div className="max-w-md mx-auto px-6 py-8">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Tap any lesson to jump in, retry, or skip ahead whenever you like.
        </p>
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-border rounded-full" />

          <div className="space-y-6 relative">
            {lessons.map((lesson, index) => {
              const isCurrent = lesson.status === 'current';
              const isCompleted = lesson.status === 'completed';
              const isLocked = lesson.status === 'locked';
              const ctaLabel = isLocked
                ? 'Start Anyway'
                : isCompleted
                ? 'Retry'
                : isCurrent
                ? 'Continue'
                : 'Start';

              return (
                <div key={lesson.id} className="relative">
                  {/* Lesson Node */}
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-4 z-10 ${
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isCurrent
                          ? 'bg-accent border-accent text-accent-foreground animate-pulse'
                          : 'bg-muted border-border text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-8 h-8" />
                      ) : lesson.isTest ? (
                        <Star className="w-8 h-8" />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6" />
                      ) : (
                        <span className="text-2xl">🍄</span>
                      )}
                    </div>

                    {/* Content */}
                    <button
                      type="button"
                      onClick={() => onStartLesson(lesson.id)}
                      className={`flex-1 p-4 rounded-2xl border-4 text-left transition-all ${
                        isCompleted
                          ? 'bg-primary/5 border-primary/20 hover:border-primary/40 hover:bg-primary/10 cursor-pointer'
                          : isCurrent
                          ? 'bg-accent/20 border-accent/40 hover:scale-[1.02] cursor-pointer shadow-md'
                          : isLocked
                          ? 'bg-muted/30 border-border/50 hover:border-border/70 hover:bg-muted/40 cursor-pointer'
                          : 'bg-muted/30 border-border/60 hover-border-border hover:bg-muted/40 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="mb-1">{lesson.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              +{lesson.xp} XP
                            </span>
                            {lesson.isTest && (
                              <Badge
                                variant="outline"
                                className="rounded-full border-2 text-xs"
                              >
                                Unit Test
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={`rounded-full ${
                            isCurrent
                              ? 'bg-accent text-accent-foreground'
                              : isLocked
                              ? 'bg-destructive/20 text-destructive-foreground border border-destructive/40'
                              : 'bg-secondary'
                          }`}
                        >
                          {ctaLabel}
                        </Badge>
                        {isCompleted && (
                          <div className="text-primary">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-8 p-6 bg-card rounded-3xl border-4 border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3>Keep Going!</h3>
              <p className="text-sm text-muted-foreground">
                {totalCount - completedCount} lessons remaining
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete all lessons to unlock the unit test and earn bonus XP!
          </p>
        </div>
      </div>
    </div>
  );
}
