'use client';

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  /** Name of the user who is typing */
  userName?: string;
  /** Whether to show the indicator */
  isVisible?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function TypingIndicator({
  userName,
  isVisible = true,
  className,
}: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className={cn('flex items-center gap-2 text-xs text-muted-foreground px-2 py-1', className)}>
      <span className="flex gap-0.5">
        <span 
          className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" 
          style={{ animationDelay: '0ms', animationDuration: '600ms' }} 
        />
        <span 
          className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" 
          style={{ animationDelay: '150ms', animationDuration: '600ms' }} 
        />
        <span 
          className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" 
          style={{ animationDelay: '300ms', animationDuration: '600ms' }} 
        />
      </span>
      {userName && <span>{userName} is typing...</span>}
      {!userName && <span>Someone is typing...</span>}
    </div>
  );
}
