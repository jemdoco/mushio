import { Check, Lock, Star } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface LessonPathPageProps {
  onStartLesson: () => void;
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
      </div>

      {/* Lesson Path */}
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-border rounded-full" />

          <div className="space-y-6 relative">
            {lessons.map((lesson, index) => {
              const isCurrent = lesson.status === 'current';
              const isCompleted = lesson.status === 'completed';
              const isLocked = lesson.status === 'locked';

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
                      onClick={isCurrent ? onStartLesson : undefined}
                      disabled={isLocked}
                      className={`flex-1 p-4 rounded-2xl border-4 text-left transition-all ${
                        isCompleted
                          ? 'bg-primary/5 border-primary/20'
                          : isCurrent
                          ? 'bg-accent/20 border-accent/40 hover:scale-[1.02] cursor-pointer shadow-md'
                          : 'bg-muted/30 border-border/50 opacity-60'
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
                        {isCurrent && (
                          <Badge className="bg-accent text-accent-foreground rounded-full">
                            Start
                          </Badge>
                        )}
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
