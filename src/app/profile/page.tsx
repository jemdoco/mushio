'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNav from '@/components/BottomNav';

type Profile = {
  user_id: string;
  display_name?: string | null;
  about?: string | null;
  country?: string | null;
  region?: string | null;
  total_xp?: number | null;
  badges?: any[] | null;
};

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [displayName, setDisplayName] = useState('');
  const [about, setAbout] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? null;
      setUserId(id);
      try {
        if (id) {
          const { data: rows, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', id)
            .maybeSingle();
          if (error) throw error;
          if (rows) {
            setProfile(rows as any);
            setDisplayName(rows.display_name ?? '');
            setAbout(rows.about ?? '');
            setCountry(rows.country ?? '');
            setRegion(rows.region ?? '');
            setTotalXp(rows.total_xp ?? 0);
          }
        } else {
          // No auth on mobile IP? Load local profile stub.
          try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem('profileLocal') : null;
            const local = raw ? JSON.parse(raw) : null;
            if (local) {
              setDisplayName(local.display_name ?? '');
              setAbout(local.about ?? '');
              setCountry(local.country ?? '');
              setRegion(local.region ?? '');
              setTotalXp(Number(local.total_xp ?? 0));
            }
          } catch {}
        }
      } catch (e: any) {
        setError(e?.message ?? 'Could not load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!userId) return;
    setError(null);
    setSaveState('saving');
    const row = {
      user_id: userId,
      display_name: displayName,
      about,
      country,
      region,
    };
    try {
      // Save locally for offline/mobile sessions
      try { if (typeof window !== 'undefined') window.localStorage.setItem('profileLocal', JSON.stringify(row)); } catch {}
      if (userId) {
        const { error } = await supabase.from('profiles').upsert(row);
        if (error) throw error;
      }
      setProfile(row);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1200);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save');
      setSaveState('idle');
    }
  };

  const badges = (profile?.badges as any[]) ?? [];

  return (
    <>
    <main className="min-h-dvh max-w-md mx-auto p-6 space-y-4 pb-28">
      <h1 className="text-2xl font-bold">Profile</h1>
      {loading && <p>Loading…</p>}
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 text-destructive p-3">{error}</div>
      )}
      {!editMode ? (
        <div className="rounded-2xl border-2 border-violet-300 bg-[rgba(245,240,230,0.9)] p-4 flex gap-4 items-center" style={{color:'#2b3b2b'}}>
          <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden bg-gray-300" aria-hidden />
          <div className="flex-1">
            <div className="text-lg font-semibold">{displayName || 'Your Name'}</div>
            <div className="text-xs opacity-80">{about || 'Description: (Add something about you)'}</div>
            <div className="text-xs opacity-80 mt-1">{country || 'Country'} {country && region ? '•' : ''} {region || 'Region'}</div>
            <div className="text-xs mt-1">XP {totalXp}</div>
          </div>
          <div>
            <Button size="sm" className="rounded-xl" onClick={() => setEditMode(true)}>Edit</Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
          <label className="text-sm">Display name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="rounded-xl" />
          <label className="text-sm">About</label>
          <Input value={about} onChange={(e) => setAbout(e.target.value)} className="rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Country</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm">Region</label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          {/* XP is not editable by the user; displayed in the header card only */}
          <div className="pt-2 flex gap-2">
            <Button
              className={`rounded-xl ${saveState==='saved' ? 'bg-green-600 hover:bg-green-600 text-white' : ''}`}
              disabled={saveState==='saving'}
              onClick={save}
            >
              {saveState==='saving' ? 'Saving...' : saveState==='saved' ? 'Saved!' : 'Save'}
            </Button>
            <Button variant="secondary" className="rounded-xl" onClick={() => setEditMode(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border-2 border-border bg-card p-4">
        <h2 className="text-lg mb-2">Badges</h2>
        {badges.length ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span key={i} className="px-3 py-1 rounded-full border bg-background">{String(b?.name ?? 'Badge')}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No badges yet.</p>
        )}
      </div>
    </main>
    <BottomNav />
    </>
  );
}
