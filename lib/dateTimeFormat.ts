import { formatDistanceToNow } from 'date-fns'

export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    return dateObj.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  } catch {
    return 'N/A';
  }
}

export function formatDistanceShort(date: Date) {
  const full = formatDistanceToNow(date, { addSuffix: false })
  
  // Handle the "less than a minute" case
  if (full === 'less than a minute') {
    return '1m'
  }
  
  const match = full.match(/(\d+)\s*(second|minute|hour|day|week|month|year)/i)

  if (!match) return full

  const [, value, unit] = match

  const unitMap = {
    second: 's',
    minute: 'm',
    hour: 'h',
    day: 'd',
    week: 'w',
    month: 'mo',
    year: 'y',
  }

  return `${value}${unitMap[unit as keyof typeof unitMap]}`
}

/**
 * Format a duration in seconds to a human-readable string (HH:MM:SS)
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (!seconds && seconds !== 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0')
  ].join(':');
}

/**
 * Parse a duration string (HH:MM:SS) to seconds
 * @param durationString - Formatted duration string
 * @returns Duration in seconds
 */
export function parseDuration(durationString: string): number {
  const [hours, minutes, seconds] = durationString.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
}

/**
 * Format a duration in seconds to a short human-readable string (1h, 24m, 10s)
 * @param seconds - Duration in seconds
 * @returns Short formatted duration string
 */
export function formatDurationShort(seconds: number): string {
  if (!seconds && seconds !== 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  // Return the most significant non-zero unit
  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  } else if (minutes > 0) {
    return `${minutes}m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
  } else {
    return `${remainingSeconds}s`;
  }
}

/**
 * Format a duration in seconds to hours and minutes only (no seconds)
 * @param seconds - Duration in seconds
 * @returns Formatted string with hours and minutes (e.g., "2h 30m", "45m", "0m")
 */
export function formatDurationShorter(seconds: number): string {
  if (!seconds && seconds !== 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${remainingSeconds}s`;
  }
}

// date: October 17, 2025 | 12:00 am
export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    // instead of at, it should be |
    const stringDate = dateObj.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    return stringDate.replace('at', '|');
  } catch {
    return 'N/A';
  }
}

export function formatDateWord(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    // instead of at, it should be |
    const stringDate = dateObj.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return stringDate.replace('at', '|');
  } catch {
    return 'N/A';
  }
}