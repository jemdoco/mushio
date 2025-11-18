'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // If already signed in, skip the login screen
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        router.replace('/lessons/path');
        return;
      }
      setCheckingSession(false);
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user && event === 'SIGNED_IN') {
          router.replace('/lessons/path');
        }
      });
      return () => {
        listener.subscription.unsubscribe();
      };
    })();
  }, [router]);

  const resetMessages = () => {
    setError(null);
    setStatus(null);
  };

  const handleAuth = async () => {
    resetMessages();
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setStatus('Check your email to confirm your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatus('Signed in successfully. Redirecting…');
        router.push('/lessons/path');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    resetMessages();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setStatus('Magic link sent. Check your email.');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[rgb(48,99,54)] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full bg-white/90 flex items-center justify-center shadow-inner overflow-hidden">
            <span className="text-5xl">🍄</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">mushio</h1>
            <p className="text-sm text-white/80 mt-1">Sign in to continue</p>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive p-3 text-sm">
              {error}
            </div>
          )}
          {status && (
            <div className="rounded-lg border border-success/40 bg-success/10 text-success p-3 text-sm">
              {status}
            </div>
          )}

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="h-12 rounded-full bg-white/90 text-center text-base"
          />

          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            className="h-12 rounded-full bg-white/90 text-center text-base"
          />

          <Button
            onClick={handleAuth}
            disabled={loading || !email || !password}
            className="w-full h-12 rounded-full bg-[rgb(60,108,88)] hover:bg-[rgb(55,98,80)] text-white"
          >
            {loading ? 'Working…' : isSignup ? 'Sign Up' : 'Log In'}
          </Button>

          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="w-full h-12 rounded-full bg-white/70 text-[rgb(48,99,54)] font-semibold hover:bg-white"
          >
            {isSignup ? 'Back to Login' : 'Sign up'}
          </button>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading || !email}
            className="w-full text-sm text-white/85 hover:text-white"
          >
            {loading ? 'Working…' : 'Send magic link'}
          </button>
        </div>
      </div>
    </main>
  );
}
