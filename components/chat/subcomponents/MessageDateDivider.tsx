'use client';

import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

interface MessageDateDividerProps {
  date: Date;
}

/**
 * Formats a date for display in chat message dividers
 * - Today: "Today"
 * - Yesterday: "Yesterday"  
 * - This week: Day name (e.g., "Monday")
 * - This year: Month Day (e.g., "Dec 4")
 * - Older: Month Day, Year (e.g., "Dec 4, 2023")
 */
export function formatMessageDate(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE'); // Monday, Tuesday, etc.
  }
  if (isThisYear(date)) {
    return format(date, 'MMM d'); // Dec 4
  }
  return format(date, 'MMM d, yyyy'); // Dec 4, 2023
}

export function MessageDateDivider({ date }: MessageDateDividerProps) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium px-2">
        {formatMessageDate(date)}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/**
 * Groups messages by date for rendering with dividers
 * Returns messages with date boundaries marked
 */
export function shouldShowDateDivider(
  currentDate: Date,
  previousDate: Date | null
): boolean {
  if (!previousDate) return true;
  
  // Show divider if messages are on different days
  return (
    currentDate.getDate() !== previousDate.getDate() ||
    currentDate.getMonth() !== previousDate.getMonth() ||
    currentDate.getFullYear() !== previousDate.getFullYear()
  );
}
