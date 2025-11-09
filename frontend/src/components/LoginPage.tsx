import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🍄</div>
          <h1 className="text-4xl tracking-tight text-primary">MushroomLearn</h1>
          <p className="text-muted-foreground">
            Discover and identify mushrooms through interactive learning
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card p-8 rounded-3xl border-4 border-primary/20 shadow-lg space-y-6">
          <div className="space-y-2">
            <h2 className="text-center text-primary">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-center text-muted-foreground">
              {isSignup
                ? 'Start your mushroom learning journey'
                : 'Continue your learning adventure'}
            </p>
          </div>

          <div className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm">Name</label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="rounded-2xl border-2 border-border bg-input-background h-12"
                />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="rounded-2xl border-2 border-border bg-input-background h-12"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="rounded-2xl border-2 border-border bg-input-background h-12"
              />
            </div>

            <Button
              onClick={onLogin}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSignup ? 'Sign Up' : 'Log In'}
            </Button>

            <button
              onClick={() => setIsSignup(!isSignup)}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              {isSignup
                ? 'Already have an account? Log in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span>🌱</span>
            <span>Learn at your own pace</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>🏆</span>
            <span>Earn XP and track progress</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>🍄</span>
            <span>Identify 100+ mushroom species</span>
          </div>
        </div>
      </div>
    </div>
  );
}
