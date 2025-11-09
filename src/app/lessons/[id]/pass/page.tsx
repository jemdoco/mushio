"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import supabase from '@/lib/supabaseClient';

export default function LessonPassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const key = `lessonXp:${id}`;
    let xpValue = 0;
    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
      xpValue = raw ? Number(raw) || 0 : 0;
      setXp(xpValue);
    } catch {}

    // Mark lesson completed server-side and local
    (async () => {
      // Always mark local completion, even if auth is unavailable
      try {
        const listRaw = typeof window !== 'undefined' ? window.localStorage.getItem('completedLessons') : null;
        const list = listRaw ? JSON.parse(listRaw) : [];
        if (!list.includes(id)) {
          list.push(id);
          if (typeof window !== 'undefined') window.localStorage.setItem('completedLessons', JSON.stringify(list));
        }
      } catch {}

      // Best-effort server updates (auth may be missing on mobile IP testing)
      try {
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id;
        if (userId) {
          try { await supabase.from('progress').upsert({ user_id: userId, lesson_id: String(id), completed: true }); } catch {}
          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('total_xp')
              .eq('user_id', userId)
              .maybeSingle();
            const current = Number(prof?.total_xp ?? 0);
            const next = current + (Number.isFinite(xpValue) ? xpValue : 0);
            await supabase.from('profiles').upsert({ user_id: userId, total_xp: next });
          } catch {}
        }
      } catch {
        // ignore
      }
    })();
  }, [id]);

  return (
    <main className="min-h-dvh flex items-center justify-center p-6" style={{ backgroundColor: '#2f5f2f', color: '#fff' }}>
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="text-5xl">⭐️⭐️⭐️</div>
        <h1 className="text-3xl font-extrabold tracking-wide">CLEARED!</h1>
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#e8f2d4', color: '#2f5f2f' }}>
          <div className="text-xl font-semibold">TOTAL: {xp} XP</div>
        </div>
        <div className="space-x-3">
          <Button className="rounded-xl" onClick={() => router.push('/lessons/path')}>Next lesson</Button>
        </div>
      </div>
    </main>
  );
}
