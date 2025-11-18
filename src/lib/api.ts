import supabase from "@/lib/supabaseClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseFunctionSlug =
  process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_SLUG ?? "make-server-1dd7ea02";
const functionsBaseUrl = supabaseUrl
  ? `${supabaseUrl}/functions/v1/${supabaseFunctionSlug}`
  : null;

async function callFunctionsApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!functionsBaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are defined.",
    );
  }
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${supabaseAnonKey}`);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${functionsBaseUrl}${path}`, {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      detail || `Supabase function ${path} failed (${response.status})`,
    );
  }
  return response.json() as Promise<T>;
}

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

function normalizeLesson(raw: any): Lesson {
  return {
    ...(raw || {}),
    id: resolveLessonIdRaw(raw),
    title: resolveLessonTitle(raw),
    description: resolveLessonDescription(raw),
    icon: resolveLessonIcon(raw) ?? raw?.icon,
  };
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
    const payload = await callFunctionsApi<{ lessons?: any[] }>("/lessons");
    const normalized = (payload.lessons ?? []).map(normalizeLesson);
    __lessonsCache = normalized.sort((a, b) => resolveOrder(a) - resolveOrder(b));
    return __lessonsCache;
  })();
  return __lessonsPromise;
}

export async function fetchLessonById(id: string): Promise<Lesson | null> {
  const lessons = await fetchLessons();
  return lessons.find((lesson) => lesson.id === id) ?? null;
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
  const params = new URLSearchParams();
  if (opts.lessonId) params.set("lessonId", opts.lessonId);
  if (opts.type) params.set("type", opts.type);
  const query = params.toString();
  const payload = await callFunctionsApi<{ questions?: any[] }>(
    `/questions${query ? `?${query}` : ""}`,
  );
  const normalized = (payload.questions ?? []).map((raw: any) => {
    const q = normalizeQuestion(raw);
    __questionById.set(q.id, q);
    return q;
  });
  if (opts.lessonId && !opts.type) __questionsByLesson.set(opts.lessonId, normalized);
  return normalized;
}

export async function fetchRandomQuestion(
  opts: { lessonId?: string; type?: string } = {}
): Promise<Question | null> {
  const params = new URLSearchParams();
  if (opts.lessonId) params.set("lessonId", opts.lessonId);
  if (opts.type) params.set("type", opts.type);
  const query = params.toString();
  const payload = await callFunctionsApi<{ question?: any }>(
    `/questions/random${query ? `?${query}` : ""}`,
  );
  return payload.question ? normalizeQuestion(payload.question) : null;
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  if (__questionById.has(id)) return __questionById.get(id)!;
  const payload = await callFunctionsApi<{ question?: any }>(`/questions/${id}`);
  if (!payload.question) return null;
  const q = normalizeQuestion(payload.question);
  __questionById.set(q.id, q);
  return q;
}

export async function submitAnswer(
  questionId: string,
  answerId: string,
  userId?: string
): Promise<{ isCorrect: boolean; xpEarned: number; correctAnswerId?: string }>{
  const payload = await callFunctionsApi<{
    isCorrect: boolean;
    xpEarned: number;
    correctAnswerId?: string;
  }>(`/questions/${questionId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answerId, userId }),
  });
  return payload;
}
