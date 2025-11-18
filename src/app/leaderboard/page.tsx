"use client";

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import BottomNav from '@/components/BottomNav';

type Row = { display_name?: string | null; total_xp?: number | null };

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name,total_xp')
          .order('total_xp', { ascending: false })
          .limit(20);
        if (error) throw error;
        setRows(data ?? []);
      } catch (e: any) {
        // Graceful fallback if no table yet
        setRows([
          { display_name: 'Ellen P', total_xp: 8000 },
          { display_name: 'Buzz A', total_xp: 4000 },
          { display_name: 'Alan S', total_xp: 2000 },
          { display_name: 'Amy P', total_xp: 1000 },
        ]);
        setError(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
    <main className="min-h-dvh max-w-md mx-auto p-6 pb-28">
      <div className="text-2xl font-semibold mb-4">Leaderboard</div>
      {loading && <p>Loading…</p>}
      {error && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive p-3">{error}</div>
      )}
      <div className="space-y-3">
        {rows.length === 0 && !loading && (
          <div className="text-muted-foreground text-sm">No scores yet.</div>
        )}
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between bg-[rgb(50,90,50)] text-white rounded-2xl px-4 py-3 border-4 border-[rgba(255,245,180,0.9)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,245,180,0.95)] text-[rgb(40,60,35)] flex items-center justify-center font-semibold">{i + 1}</div>
              <div className="w-8 h-8 rounded-full bg-white/80" />
              <div className="font-medium">{r.display_name ?? 'Anon'}</div>
            </div>
            <div className="rounded-full bg-white/80 text-[rgb(40,60,35)] px-3 py-1 text-sm">{r.total_xp ?? 0} XP</div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <button className="px-5 py-2 rounded-full border-2 bg-white/80">See more</button>
      </div>
    </main>
    <BottomNav />
    </>
  );
}
