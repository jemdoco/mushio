'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchQuestionById, fetchRandomQuestion, fetchLessonById, submitAnswer, type Question } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const qid = String(params?.id ?? '');

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [revealUsed, setRevealUsed] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; xp: number; correctId?: string } | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string | null>(null);
  const [xpTotal, setXpTotal] = useState<number>(0);
  const [index, setIndex] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [wrong, setWrong] = useState<number>(0);

  useEffect(() => {
    if (!qid) return;
    (async () => {
      try {
        const q = await fetchQuestionById(qid);
        setQuestion(q);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load question');
      } finally {
        setLoading(false);
      }
    })();
  }, [qid]);

  // When question changes, load its lesson meta and session XP
  useEffect(() => {
    (async () => {
      if (!question?.lesson_id) return;
      try {
        const lesson = await fetchLessonById(question.lesson_id);
        setLessonTitle(lesson?.title ?? null);
      } catch {
        setLessonTitle(null);
      }
      // Load session XP for this lesson
      try {
        const key = `lessonXp:${question.lesson_id}`;
        const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
        setXpTotal(raw ? Number(raw) || 0 : 0);
      } catch {
        setXpTotal(0);
      }
      // Init or reload the session queue
      try {
        const base = `lessonSession:${question.lesson_id}`;
        const buf = typeof window !== 'undefined' ? window.sessionStorage.getItem(base) : null;
        if (!buf) {
          // create queue from lesson questions
          const list = await (await import('@/lib/api')).then(m => m.fetchQuestions({ lessonId: question.lesson_id }));
          const ids = list.map(q => q.id);
          const payload = { ids, index: ids.indexOf(question.id) >= 0 ? ids.indexOf(question.id) : 0, wrong: 0, total: ids.length };
          if (typeof window !== 'undefined') window.sessionStorage.setItem(base, JSON.stringify(payload));
          setIndex(payload.index);
          setTotal(payload.total);
          setWrong(payload.wrong);
        } else {
          const payload = JSON.parse(buf);
          setIndex(payload.index ?? 0);
          setTotal(payload.total ?? 0);
          setWrong(payload.wrong ?? 0);
        }
      } catch {}
    })();
  }, [question?.lesson_id]);

  const correctId = useMemo(() => question?.answers?.find(a => a.is_correct)?.id, [question]);

  const doSubmit = async () => {
    if (!question || !selectedId) return;
    setBusy(true);
    try {
      const r = await submitAnswer(question.id, selectedId);
      // If the user previously used reveal, award 0 XP
      const xp = revealUsed ? 0 : r.xpEarned;
      setFeedback({ correct: r.isCorrect, xp, correctId: correctId });
      setSubmitted(true);
      // Update session XP
      if (!revealUsed && xp > 0 && question.lesson_id) {
        const nextTotal = xpTotal + xp;
        setXpTotal(nextTotal);
        try {
          const key = `lessonXp:${question.lesson_id}`;
          if (typeof window !== 'undefined') window.sessionStorage.setItem(key, String(nextTotal));
        } catch {}
      }
      // Track wrongs
      try {
        const base = `lessonSession:${question.lesson_id}`;
        const buf = typeof window !== 'undefined' ? window.sessionStorage.getItem(base) : null;
        const payload = buf ? JSON.parse(buf) : { ids: [], index: 0, wrong: 0, total: 0 };
        if (!r.isCorrect) payload.wrong = (payload.wrong ?? 0) + 1;
        setWrong(payload.wrong);
        if (typeof window !== 'undefined') window.sessionStorage.setItem(base, JSON.stringify(payload));
      } catch {}
    } catch (e: any) {
      setError(e?.message ?? 'Could not submit answer');
    } finally {
      setBusy(false);
    }
  };

  const seeAnswer = () => {
    if (!question) return;
    setRevealUsed(true);
    setSubmitted(true);
    setFeedback({ correct: false, xp: 0, correctId });
  };

  const nextQuestion = async () => {
    if (!question) return;
    setBusy(true);
    setError(null);
    try {
      const base = `lessonSession:${question.lesson_id}`;
      const buf = typeof window !== 'undefined' ? window.sessionStorage.getItem(base) : null;
      let payload = buf ? JSON.parse(buf) : null;
      if (!payload) {
        const list = await (await import('@/lib/api')).then(m => m.fetchQuestions({ lessonId: question.lesson_id }));
        const ids = list.map(q => q.id);
        payload = { ids, index: 0, wrong: 0, total: ids.length };
      }
      // Check fail threshold: 30% wrong → fail immediately
      const minFailures = Math.max(3, Math.ceil((payload.total ?? 0) * 0.3));
      if ((payload.wrong ?? 0) >= minFailures && question.lesson_id) {
        router.replace(`/lessons/${question.lesson_id}/fail`);
        return;
      }
      // Move to next index
      const nextIndex = (payload.index ?? 0) + 1;
      payload.index = nextIndex;
      if (typeof window !== 'undefined') window.sessionStorage.setItem(base, JSON.stringify(payload));
      setIndex(nextIndex);
      if (nextIndex >= (payload.total ?? 0)) {
        // Completed → pass
        router.replace(`/lessons/${question.lesson_id}/pass`);
        return;
      }
      const nextId = payload.ids[nextIndex];
      const next = await fetchQuestionById(String(nextId));
      if (!next) { setError('No more questions for this lesson.'); return; }
      setQuestion(next);
      setSelectedId(null);
      setSubmitted(false);
      setRevealUsed(false);
      setFeedback(null);
      router.replace(`/questions/${next.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load next question');
    } finally {
      setBusy(false);
    }
  };

  const answerButtonStyle = (id: string) => {
    if (!submitted) return 'border-2';
    if (feedback?.correctId && id === feedback.correctId) return 'border-green-500 bg-green-500/10';
    if (selectedId === id && feedback && !feedback.correct) return 'border-destructive bg-destructive/10';
    return 'border-2';
  };

  return (
    <div className="min-h-dvh" style={{ backgroundColor: '#335c33' }}>
    {/* Wavy motif header */}
    <div className="relative h-28">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0))' }} />
      <div className="absolute inset-0 flex items-end justify-center pb-2">
        <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full border-2" style={{ backgroundColor: 'rgba(255,245,180,0.95)', color: 'rgb(40,60,35)' }}>
          <span>🍄</span>
          <span className="text-sm font-medium">{lessonTitle ? lessonTitle : 'Lesson'}</span>
          <span className="text-xs opacity-80">XP {xpTotal}</span>
        </div>
      </div>
      <div className="absolute inset-x-0 -bottom-6 h-24 mx-auto w-[70%] max-w-[520px]" aria-hidden
        style={{
          background:
            'radial-gradient(40% 20% at 50% 0%, #bfe3a6 0%, #bfe3a6 60%, transparent 61%), radial-gradient(40% 20% at 50% 100%, #CDEABC 0%, #CDEABC 60%, transparent 61%)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 60%',
          backgroundPosition: 'center 0%, center 100%'
        }}
      />
    </div>
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <Button variant="secondary" className="rounded-xl" onClick={() => router.back()}>
          ← Back
        </Button>
        <div className="px-3 py-1 rounded-lg border bg-card">Session XP {xpTotal}</div>
      </div>

      {loading && <p>Loading…</p>}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive p-3">{error}</div>
      )}

      {question && (
        <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-4">
          <div className="text-xs text-muted-foreground">{lessonTitle ? lessonTitle : `Lesson ${question.lesson_id ?? ''}`}</div>
          <div className="rounded-xl border bg-background p-4">
            <h1 className="text-base font-medium">{question.question_text}</h1>
          </div>
          {(() => {
            const answers = question.answers ?? [];
            const type = (question.type || '').toLowerCase();
            // Normalize/sanitize potential image values which may be "null" strings, blanks, etc.
            const norm = (v?: string | null) => (typeof v === 'string' ? v.trim() : '');
            const isValidImg = (v?: string | null) => {
              const s = norm(v);
              if (!s) return false;
              const bad = ['null', 'undefined', 'none', 'n/a', 'na', 'nil', '0', '-'];
              return !bad.includes(s.toLowerCase());
            };
            const hasQuestionImage = isValidImg(question.image_url) || (!!question.image_id && String(question.image_id) !== '0');
            const imgAnswersCount = answers.filter((a) => isValidImg(a.image_url)).length;
            const hasImageAnswers = imgAnswersCount > 0;
            const isTxtOnlyType = type.includes('txt_only');
            const isImgQTxtType = type.includes('1img_4txt') || (type.includes('img') && type.includes('txt'));
            // Use text-only when explicitly typed OR when there are no images at all.
            // Otherwise prefer question-image+text, then image-answer grid.
            const isImgQTxtAns = !isTxtOnlyType && (hasQuestionImage || isImgQTxtType);
            const isTextOnly = isTxtOnlyType || (!hasQuestionImage && !hasImageAnswers);

            if (isTextOnly) {
              return (
                <div className={`grid gap-2 grid-cols-1`}>
                  {answers.map((a) => (
                    <button
                      key={a.id}
                      disabled={busy || submitted}
                      onClick={() => setSelectedId(a.id)}
                      className={`text-left rounded-full px-4 py-3 border ${answerButtonStyle(a.id)} ${
                        selectedId === a.id && !submitted ? 'ring-2 ring-primary/40' : ''
                      }`}
                    >
                      {a.answer_text ?? '�?"'}
                    </button>
                  ))}
                </div>
              );
            }

            if (isImgQTxtAns) {
              // Force layout: single question image + text pills answers
              const twoCol = answers.length >= 4;
              return (
                <div className="space-y-3">
                  <div className="rounded-xl border bg-background p-0 overflow-hidden">
                    {question.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={question.image_url} alt="question" className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-muted/60 flex items-center justify-center">
                        <div className="w-12 h-12 rounded bg-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <div className={`grid gap-2 ${twoCol ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {answers.map((a) => (
                      <button
                        key={a.id}
                        disabled={busy || submitted}
                        onClick={() => setSelectedId(a.id)}
                        className={`text-left rounded-full px-4 py-3 border ${answerButtonStyle(a.id)} ${
                          selectedId === a.id && !submitted ? 'ring-2 ring-primary/40' : ''
                        }`}
                      >
                        {a.answer_text ?? '—'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            if (hasImageAnswers) {
              // Image answer grid: 2x grid
              return (
                <div className={`grid gap-3 grid-cols-2`}>
                  {answers.map((a) => (
                    <button
                      key={a.id}
                      disabled={busy || submitted}
                      onClick={() => setSelectedId(a.id)}
                      className={`relative aspect-square rounded-md border ${answerButtonStyle(a.id)} overflow-hidden ${
                        selectedId === a.id && !submitted ? 'ring-2 ring-primary/40' : ''
                      }`}
                    >
                      {a.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.image_url} alt={a.answer_text ?? 'answer option'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted/60 flex items-center justify-center">
                          <div className="w-10 h-10 rounded bg-muted-foreground/20" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              );
            }

            // Text-only answers (e.g., *_4_txt_only): always single column pills
            return (
              <div className={`grid gap-2 grid-cols-1`}>
                {answers.map((a) => (
                  <button
                    key={a.id}
                    disabled={busy || submitted}
                    onClick={() => setSelectedId(a.id)}
                    className={`text-left rounded-full px-4 py-3 border ${answerButtonStyle(a.id)} ${
                      selectedId === a.id && !submitted ? 'ring-2 ring-primary/40' : ''
                    }`}
                  >
                    {a.answer_text ?? '—'}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Action bar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              disabled={busy || submitted}
              onClick={seeAnswer}
              variant="outline"
              className="rounded-full px-4 py-6 h-auto border-destructive text-destructive hover:bg-destructive/10"
            >
              See answer (0XP)
            </Button>
            <Button
              type="button"
              disabled={busy || submitted || !selectedId}
              onClick={doSubmit}
              className="rounded-full px-4 py-6 h-auto"
            >
              Submit answer ({Math.max(question.xp ?? 10, 0)}XP)
            </Button>
          </div>

          {submitted && (
            <div
              className={`rounded-lg p-3 text-sm border mt-2 ${
                feedback?.correct
                  ? 'border-green-500/40 bg-green-500/10 text-green-600'
                  : 'border-destructive/40 bg-destructive/10 text-destructive'
              }`}
            >
              {feedback?.correct ? `Correct! +${feedback?.xp ?? 0} XP` : 'Revealed or incorrect — no XP awarded.'}
            </div>
          )}

          <div className="pt-2 text-right">
            <Button type="button" variant="secondary" onClick={nextQuestion} disabled={!(submitted || revealUsed)} className="rounded-xl">
              Next question →
            </Button>
          </div>
        </div>
      )}
    </main>
    </div>
  );
}
