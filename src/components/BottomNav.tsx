"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const item = (href: string, label: string) => {
    const active = pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`flex-1 text-center py-3 rounded-xl border-2 ${
          active ? 'bg-primary text-primary-foreground' : 'bg-card'
        }`}
      >
        {label}
      </Link>
    );
  };
  return (
    <nav className="sticky bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-gradient-to-t from-background/90 to-background/40 backdrop-blur border-t">
      <div className="max-w-md mx-auto flex items-center gap-3">
        {item('/lessons/path', 'Path')}
        {item('/leaderboard', 'Leaderboard')}
        {item('/profile', 'Profile')}
      </div>
    </nav>
  );
}

