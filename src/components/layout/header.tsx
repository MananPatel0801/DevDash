
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="DevDash Home">
          <LayoutDashboard className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">DevDash</span>
        </Link>
        <ThemeToggleButton />
      </div>
    </header>
  );
}
