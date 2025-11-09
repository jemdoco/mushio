import supabase from "@/lib/supabaseClient";

// Canonical shapes used by the app
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

export type Lesson = {
  id: string;
  title: string;
  description?: string;
  // Some exports name this field differently. Support multiple shapes.
  order?: number;
  order_index?: number;
  orderIndex?: number;
  orderObj?: { index?: number } | null; // in case it’s stored as JSON
  category?: string;
  icon?: string;
  level?: number;
  xp_award?: number;
};

function resolveOrder(l: Partial<Lesson>): number {
  const direct = (l as any).order as number | undefined;
  const snake = (l as any).order_index as number | undefined;
  const camel = (l as any).orderIndex as number | undefined;
  const obj = (l as any).orderObj as { index?: number } | undefined;
  const jsonOrder = typeof (l as any).order === 'object' && (l as any).order !== null ? (l as any).order.index : undefined;
  return (
    (typeof direct === 'number' ? direct : undefined) ??
    (typeof snake === 'number' ? snake : undefined) ??
    (typeof camel === 'number' ? camel : undefined) ??
    (typeof jsonOrder === 'number' ? jsonOrder : undefined) ??
    Number.POSITIVE_INFINITY
  );
}

function resolveLessonTitle(raw: any): string {
  const title = firstDefined<string>(
    raw?.lesson_title,
    raw?.title,
    raw?.name,
    raw?.title_text,
    raw?.label,
    raw?.heading,
  );
  return title ?? "Untitled Lesson";
}

function resolveLessonDescription(raw: any): string | undefined {
  return firstDefined<string>(raw?.description, raw?.summary, raw?.details, raw?.text);
}

function resolveLessonIcon(raw: any): string | undefined {
  return firstDefined<string>(raw?.icon, raw?.emoji, raw?.symbol);
}

function resolveLessonIdRaw(raw: any): string {
  const id = firstDefined<string>(
    raw?.lesson_id,
    raw?.id,
    raw?.lessonId,
    raw?.lesson?.id,
  );
  return String(id ?? "");
}

// Simple session caches to speed up client navigations
let __lessonsCache: Lesson[] | null = null;
let __lessonsPromise: Promise<Lesson[]> | null = null;
const __questionsByLesson = new Map<string, Question[]>();
const __questionById = new Map<string, Question>();

export async function fetchLessons(): Promise<Lesson[]> {
  if (__lessonsCache) return __lessonsCache;
  if (__lessonsPromise) return __lessonsPromise;
  __lessonsPromise = (async () => {
    // Select all fields; sort in client to avoid server-side dependency on a specific column name.
    const { data, error } = await supabase.from("lessons").select("*");
    if (error) throw error;
    const normalized = (data ?? []).map((raw: any) => {
      const lesson: Lesson = {
        ...(raw || {}),
        id: resolveLessonIdRaw(raw),
        title: resolveLessonTitle(raw),
        description: resolveLessonDescription(raw),
        icon: resolveLessonIcon(raw) ?? raw?.icon,
      };
      return lesson;
    });
    __lessonsCache = normalized.sort((a, b) => resolveOrder(a) - resolveOrder(b));
    return __lessonsCache;
  })();
  return __lessonsPromise;
}

export async function fetchLessonById(id: string): Promise<Lesson | null> {
  // Canonical schema prefers lessons.lesson_id
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("lesson_id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const raw: any = data;
  return {
    ...(raw || {}),
    id: resolveLessonIdRaw(raw),
    title: resolveLessonTitle(raw),
    description: resolveLessonDescription(raw),
    icon: resolveLessonIcon(raw) ?? raw?.icon,
    level: raw?.level,
    xp_award: raw?.xp_award,
  };
}

export async function estimateLessonXp(lessonId: string): Promise<number> {
  // Prefer lessons.xp_award if available
  const lesson = await fetchLessonById(lessonId);
  if (lesson && typeof lesson.xp_award === 'number') return lesson.xp_award;
  // Fallback: derive from questions if you later add xp per question
  try {
    const qs = await fetchQuestions({ lessonId });
    const xp = qs.reduce((sum, q) => sum + (typeof q.xp === 'number' ? q.xp : 0), 0);
    return xp || 100;
  } catch {
    return 100;
  }
}

// Server-tracked progress helpers
export async function fetchCompletedLessonsForUser(): Promise<Set<string>> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return new Set<string>();
    const { data, error } = await supabase
      .from('progress')
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .eq('completed', true);
    if (error) throw error;
    const set = new Set<string>();
    for (const row of data ?? []) set.add(String((row as any).lesson_id));
    return set;
  } catch {
    // Fallback to local
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('completedLessons');
        const arr: string[] = raw ? JSON.parse(raw) : [];
        return new Set(arr.map(String));
      } catch {}
    }
    return new Set<string>();
  }
}

export async function markLessonCompleted(lessonId: string): Promise<void> {
  // Update server if possible; otherwise silently fall back to local storage
  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (userId) {
      await supabase.from('progress').upsert({ user_id: userId, lesson_id: lessonId, completed: true });
    }
  } catch {
    // ignore
  }
  try {
    if (typeof window !== 'undefined') {
      const listRaw = window.localStorage.getItem('completedLessons');
      const list = listRaw ? JSON.parse(listRaw) : [];
      if (!list.includes(lessonId)) {
        list.push(lessonId);
        window.localStorage.setItem('completedLessons', JSON.stringify(list));
      }
    }
  } catch {}
}

// Field resolvers for flexible schemas
const firstDefined = <T>(...vals: Array<T | undefined | null>): T | undefined => {
  for (const v of vals) if (v !== undefined && v !== null) return v as T;
  return undefined;
};

// Distinct image resolvers for questions vs answers
function resolveQuestionImage(obj: any): string | undefined {
  return firstDefined<string>(
    obj?.question_image_url,
    obj?.question_img_url,
    obj?.image_url,
    obj?.questionImageUrl,
    obj?.imageUrl,
    obj?.image?.url,
  );
}

function resolveAnswerImage(obj: any): string | undefined {
  return firstDefined<string>(
    obj?.answer_image_url,
    obj?.image_url,
    obj?.imageUrl,
  );
}

function resolveQuestionText(obj: any): string {
  return (
    firstDefined<string>(obj?.question_text, obj?.questionText, obj?.text, obj?.prompt) ?? ""
  );
}

function resolveExplanation(obj: any): string | undefined {
  return firstDefined<string>(obj?.explanation, obj?.explain, obj?.details);
}

function resolveXp(obj: any): number {
  const val = firstDefined<number>(
    obj?.xp,
    obj?.points,
    obj?.score,
    typeof obj?.stats === "object" ? obj?.stats?.xp : undefined,
    typeof obj?.meta === "object" ? obj?.meta?.xp : undefined,
  );
  return typeof val === "number" ? val : 10;
}

function resolveLessonIdField(obj: any): string | undefined {
  const direct = firstDefined<string>(obj?.lesson_id, obj?.lessonId);
  if (direct) return direct;
  if (obj?.lesson && typeof obj.lesson === "object") return obj.lesson.id;
  return undefined;
}

function resolveAnswerText(obj: any): string | undefined {
  return firstDefined<string>(obj?.answer_text, obj?.answerText, obj?.text);
}

function resolveIsCorrect(obj: any): boolean {
  const v = firstDefined<any>(obj?.is_correct, obj?.isCorrect, obj?.correct);
  return v === true;
}

function resolveAnswerOrder(obj: any): number | undefined {
  return firstDefined<number>(
    typeof obj?.order === "number" ? obj.order : undefined,
    obj?.order_index,
    obj?.orderIndex,
    typeof obj?.order === "object" ? obj?.order?.index : undefined,
  );
}

function normalizeAnswer(raw: any): Answer {
  return {
    id: String(raw.id),
    question_id: String(firstDefined<string>(raw?.question_id, raw?.questionId) ?? ""),
    answer_text: resolveAnswerText(raw),
    image_url: resolveAnswerImage(raw),
    is_correct: resolveIsCorrect(raw),
    order: resolveAnswerOrder(raw),
  };
}

function normalizeQuestion(raw: any): Question {
  const answersRaw = Array.isArray(raw?.answers) ? raw.answers : undefined;
  const answers = answersRaw?.map(normalizeAnswer);
  return {
    id: String(raw.id),
    type: String(firstDefined<string>(raw?.question_type, raw?.type, raw?.kind) ?? "generic"),
    question_text: resolveQuestionText(raw),
    image_url: resolveQuestionImage(raw),
    xp: resolveXp(raw),
    explanation: resolveExplanation(raw),
    lesson_id: resolveLessonIdField(raw),
    answers,
  };
}

export async function fetchQuestions(
  opts: { lessonId?: string; type?: string } = {}
): Promise<Question[]> {
  if (opts.lessonId && __questionsByLesson.has(opts.lessonId) && !opts.type) {
    return __questionsByLesson.get(opts.lessonId)!;
  }
  let query = supabase.from("questions").select("*");
  if (opts.lessonId) {
    query = query.eq("lesson_id", opts.lessonId);
  }
  if (opts.type) query = query.eq("question_type", opts.type);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as any[];
  const normalized = rows.map(normalizeQuestion);
  // Load answers separately (in case no FK is defined for nested select)
  const idList = normalized.map((q) => q.id).filter(Boolean);
  if (idList.length) {
    const answersMap = await fetchAnswersMapByQuestionIds(idList);
    normalized.forEach((q) => {
      q.answers = answersMap[q.id] ?? [];
      __questionById.set(q.id, q);
    });
  }
  if (opts.lessonId && !opts.type) __questionsByLesson.set(opts.lessonId, normalized);
  return normalized;
}

export async function fetchRandomQuestion(
  opts: { lessonId?: string; type?: string } = {}
): Promise<Question | null> {
  const all = await fetchQuestions(opts);
  if (!all.length) return null;
  return all[Math.floor(Math.random() * all.length)];
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  if (__questionById.has(id)) return __questionById.get(id)!;
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const q = normalizeQuestion(data);
  // Fetch answers separately
  const answersMap = await fetchAnswersMapByQuestionIds([q.id]);
  q.answers = answersMap[q.id] ?? [];
  __questionById.set(q.id, q);
  return q;
}

export async function submitAnswer(
  questionId: string,
  answerId: string,
  userId?: string
): Promise<{ isCorrect: boolean; xpEarned: number; correctAnswerId?: string }>{
  // Client-side check: fetch answers and compute correctness
  const question = await fetchQuestionById(questionId);
  if (!question) throw new Error("Question not found");
  const selected = question.answers?.find((a) => a.id === answerId);
  if (!selected) throw new Error("Answer not found");
  const correct = !!selected.is_correct;
  const xp = correct ? question.xp ?? 10 : 0;
  const correctAnswer = question.answers?.find((a) => a.is_correct);

  // Optional: persist progress if you add a table and policies
  // if (userId && correct) {
  //   await supabase.from("progress").insert({ user_id: userId, question_id: questionId, earned_xp: xp });
  // }

  return { isCorrect: correct, xpEarned: xp, correctAnswerId: correctAnswer?.id };
}

// Helper: fetch answers for a set of question IDs and group by question_id
async function fetchAnswersMapByQuestionIds(ids: string[]): Promise<Record<string, Answer[]>> {
  const { data, error } = await supabase
    .from("answers")
    .select("*")
    .in("question_id", ids.map((x) => Number.isNaN(Number(x)) ? x : Number(x))) as any;
  if (error) throw error;
  const rows = (data ?? []) as any[];
  const map: Record<string, Answer[]> = {};
  for (const raw of rows) {
    const ans = normalizeAnswer(raw);
    const key = String(ans.question_id);
    if (!map[key]) map[key] = [];
    map[key].push(ans);
  }
  return map;
}
