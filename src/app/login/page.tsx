'use client';

import { useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

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
    <main className="min-h-dvh bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="text-6xl mb-2">🍄</div>
          <h1 className="text-3xl tracking-tight text-primary">MushroomLearn</h1>
          <p className="text-muted-foreground">Learn, identify, and track your progress</p>
        </div>

        <div className="bg-card p-6 rounded-3xl border-4 border-primary/20 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-center text-primary">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-sm text-center text-muted-foreground">
              {isSignup ? 'Start your mushroom learning journey' : 'Continue your learning adventure'}
            </p>
          </div>

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

          <div className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm">Name</label>
                <Input id="name" placeholder="Your name" className="rounded-2xl h-11" />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="rounded-2xl h-11"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                className="rounded-2xl h-11"
              />
            </div>

            <Button
              onClick={handleAuth}
              disabled={loading || !email || !password}
              className="w-full h-11 rounded-2xl"
            >
              {loading ? 'Working…' : isSignup ? 'Sign Up' : 'Log In'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleMagicLink}
              disabled={loading || !email}
              className="w-full h-11 rounded-2xl"
            >
              {loading ? 'Working…' : 'Send Magic Link'}
            </Button>

            <button
              onClick={() => setIsSignup(!isSignup)}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
              type="button"
            >
              {isSignup ? 'Already have an account? Log in' : "Don’t have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <div>Learn at your own pace • Earn XP • Identify species</div>
        </div>
      </div>
    </main>
  );
}
