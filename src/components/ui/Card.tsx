'use client';

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function Card({ className, children, onClick, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 shadow-xl',
        onClick && 'cursor-pointer hover:bg-white/10 transition-colors duration-200',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
