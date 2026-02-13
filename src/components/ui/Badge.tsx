'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeVariant =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  common: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  legendary: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  bronze: 'bg-orange-800/20 text-orange-400 border-orange-700/30',
  silver: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  platinum: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  diamond: 'bg-sky-400/20 text-sky-300 border-sky-400/30',
  master: 'bg-red-500/20 text-red-300 border-red-500/30',
  grandmaster: 'bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-200 border-amber-500/30',
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
