'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LessonFailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  return (
    <main className="min-h-dvh flex items-center justify-center p-6" style={{ backgroundColor: '#2f5f2f', color: '#fff' }}>
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="text-6xl">👎</div>
        <h1 className="text-3xl font-extrabold tracking-wide">BETTER LUCK NEXT TIME!</h1>
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#cc3b2e', color: '#fff' }}>
          TOTAL: 0 XP
        </div>
        <Button className="rounded-xl" onClick={() => router.push('/lessons/path')}>Retry ›</Button>
      </div>
    </main>
  );
}
