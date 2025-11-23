'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  fetchLessons,
  estimateLessonXp,
  fetchQuestions,
  fetchCompletedLessonsForUser,
  type Lesson,
} from '@/lib/api';
import BottomNav from '@/components/BottomNav';

type LessonWithXp = Lesson & { xpTotal?: number };

export default function LessonsPathPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<LessonWithXp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchLessons();
        const withXp = await Promise.all(
          rows.map(async (lesson) => ({
            ...lesson,
            xpTotal: (lesson as any).xp_award ?? (await estimateLessonXp(lesson.id).catch(() => 100)),
          }))
        );
        setLessons(withXp);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load lessons');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let disposed = false;
    const load = async () => {
      try {
        const set = await fetchCompletedLessonsForUser();
        if (!disposed) setCompleted(set);
      } catch {
        // ignore
      }
    };
    load();
    const onFocus = () => load();
    const onVis = () => {
      if (document.visibilityState === 'visible') load();
    };
    if (typeof window !== 'undefined') window.addEventListener('focus', onFocus);
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis);
    return () => {
      disposed = true;
      if (typeof window !== 'undefined') window.removeEventListener('focus', onFocus);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const positions = useMemo(() => lessons.map((_, i) => (i % 2 === 0 ? 'left' : 'right')), [lessons]);

  useEffect(() => {
    if (!lessons.length) return;
    setSelectedLessonId((current) => {
      if (current && lessons.some((lesson) => lesson.id === current)) return current;
      const fallback = lessons.find((lesson) => !completed.has(lesson.id)) ?? lessons[0];
      return fallback?.id ?? null;
    });
  }, [lessons, completed]);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId]
  );

  const startLesson = useCallback(
    async (lesson: LessonWithXp) => {
      const list = await fetchQuestions({ lessonId: lesson.id });
      if (!list.length) {
        alert('No questions yet for this lesson.');
        return;
      }
      const ids = list.map((q) => q.id);
      const payload = { ids, index: 0, wrong: 0, total: ids.length };
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(`lessonSession:${lesson.id}`, JSON.stringify(payload));
          window.sessionStorage.setItem(`lessonXp:${lesson.id}`, '0');
        }
      } catch {
        // ignore storage errors
      }
      router.push(`/questions/${ids[0]}`);
    },
    [router]
  );

  return (
    <div className="min-h-dvh relative overflow-hidden bg-[var(--green-900,#335c33)] text-foreground">
      <div className="sticky top-0 z-10 p-4">
        <div className="inline-block bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-medium shadow">
          Your Lessons
        </div>
      </div>

      <div className="absolute inset-0 -z-10">
        <div
          aria-hidden
          className="w-[70%] max-w-[520px] mx-auto h-full"
          style={{
            background:
              'radial-gradient(40% 20% at 50% 0%, #bfe3a6 0%, #bfe3a6 60%, transparent 61%), radial-gradient(40% 20% at 50% 25%, #CDEABC 0%, #CDEABC 60%, transparent 61%), radial-gradient(40% 20% at 50% 50%, #bfe3a6 0%, #bfe3a6 60%, transparent 61%), radial-gradient(40% 20% at 50% 75%, #CDEABC 0%, #CDEABC 60%, transparent 61%), radial-gradient(40% 20% at 50% 100%, #bfe3a6 0%, #bfe3a6 60%, transparent 61%)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 25%',
            backgroundPosition: 'center 0%, center 25%, center 50%, center 75%, center 100%'
          }}
        />
      </div>

      <main className="relative mx-auto max-w-md px-5 pb-28">
        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive p-3">
            {error}
          </div>
        )}

        <div className="relative space-y-16">
          {lessons.map((lesson, idx) => {
            const isCompleted = completed.has(lesson.id);
            const isSelected = lesson.id === selectedLessonId;
            return (
              <div
                key={lesson.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                className={`relative flex ${positions[idx] === 'left' ? 'justify-start' : 'justify-end'} cursor-pointer`}
                onClick={() => setSelectedLessonId(lesson.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedLessonId(lesson.id);
                  }
                }}
              >
                <div className="relative">
                  <div
                    className={`w-28 h-28 rounded-full border-4 border-[rgba(255,220,120,0.9)] bg-[rgba(255,245,180,0.9)] shadow flex items-center justify-center transition-all ${
                      isSelected ? 'ring-4 ring-white/80 ring-offset-2 ring-offset-[rgba(51,92,51,1)]' : ''
                    }`}
                  >
                    {isCompleted ? (
                      <span className="text-5xl">✓</span>
                    ) : isSelected ? (
                      <span className="text-5xl">▶</span>
                    ) : (
                      <span className="text-5xl">●</span>
                    )}
                  </div>

                  <div className={`absolute ${positions[idx] === 'left' ? 'left-[110%]' : 'right-[110%]'} top-1/2 -translate-y-1/2`}>
                    <div
                      className={`min-w-[180px] max-w-[220px] bg-[rgba(30,90,40,0.85)] text-white rounded-2xl border-4 border-[rgba(255,220,120,0.9)] px-4 py-3 shadow transition-all ${
                        isSelected ? 'scale-105' : ''
                      }`}
                    >
                      <div className="font-medium leading-snug break-words">{lesson.title}</div>
                      <div className="text-xs opacity-90 mt-1">{lesson.xpTotal ?? 100} XP</div>
                    </div>
                    {isSelected && (
                      <div className={`mt-2 ${positions[idx] === 'left' ? 'text-left' : 'text-right'}`}>
                        <Button
                          size="sm"
                          className="rounded-xl bg-[rgba(255,245,180,0.95)] text-[rgb(40,60,35)] hover:bg-[rgba(255,245,180,0.9)]"
                          onClick={(event) => {
                            event.stopPropagation();
                            startLesson(lesson);
                          }}
                        >
                          Start Here
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16">
          <Button variant="secondary" className="rounded-xl" onClick={() => router.push('/home')}>
            back to menu
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
