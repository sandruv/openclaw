import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDate } from "@/lib/dateTimeFormat"
import { AVATAR_COLORS } from "@/constants/colors"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const trimHtmlContent = (html: string, maxLength: number = 100): string => {
  if (!html) return ""
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ')
  // Remove &nbsp; entities
  const withoutNbsp = text.replace(/&nbsp;/g, ' ')
  // Remove extra spaces
  const cleanText = withoutNbsp.replace(/\s+/g, ' ').trim()
  // Trim to maxLength and add ellipsis if needed
  return cleanText.length > maxLength 
    ? cleanText.substring(0, maxLength) + '...'
    : cleanText
}

export function getInitials(name: string): string {
  const trimmedName = name.trim()
  const words = trimmedName.split(' ')

  if (words.length >= 2) {
    // Get first character from first and last word
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  } else if (words.length === 1 && words[0].length >= 2) {
    // Get first two characters from single word
    return words[0].substring(0, 2).toUpperCase()
  } else {
    // Fallback for empty or single character strings
    return (trimmedName.substring(0, 2) || '??').toUpperCase()
  }
}


/**
 * Get a consistent avatar color for a user based on their ID
 * @param id User ID or any unique identifier
 * @returns A Tailwind CSS background color class
 */
export function getAvatarColor(id: number | string): string {
  // Convert string IDs to numbers for consistent color assignment
  let numericId: number;
  
  if (typeof id === 'string') {
    // Simple hash function for strings
    numericId = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  } else {
    numericId = id;
  }
  
  if(id === 0) return 'bg-gray-400'
  // Get a consistent index based on the ID
  const colorIndex = Math.abs(numericId) % AVATAR_COLORS.length;
  
  return AVATAR_COLORS[colorIndex];
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  return String(error)
}

export function getInitialsFromNames(firstName: string, lastName: string) {
  if (!firstName || !lastName) return 'Me'
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}


/**
 * Extract and clean content from HTML email content
 * @param htmlContent The HTML content from email
 * @returns Extracted information including sender, subject, body, and cleaned text
 */
export interface ExtractedContent {
  sender?: string
  subject?: string
  body: string
  cleanedText: string
  timestamp?: string
}

export function contentExtraction(htmlContent: string): ExtractedContent {
  if (!htmlContent) {
    return {
      body: '',
      cleanedText: ''
    }
  }

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent

  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style')
  scripts.forEach(el => el.remove())

  // Remove images and other media elements
  const media = tempDiv.querySelectorAll('img, video, audio, iframe, embed, object')
  media.forEach(el => el.remove())

  // Try to extract sender information
  let sender: string | undefined
  const fromElements = tempDiv.querySelectorAll('[class*="from"], [class*="sender"], .sender, .from')
  if (fromElements.length > 0) {
    sender = fromElements[0].textContent?.trim()
  }

  // Try to extract subject
  let subject: string | undefined
  const subjectElements = tempDiv.querySelectorAll('[class*="subject"], .subject, h1, h2')
  if (subjectElements.length > 0) {
    subject = subjectElements[0].textContent?.trim()
  }

  // Try to extract timestamp
  let timestamp: string | undefined
  const timeElements = tempDiv.querySelectorAll('[class*="date"], [class*="time"], .date, .time, time')
  if (timeElements.length > 0) {
    timestamp = timeElements[0].textContent?.trim()
  }

  // Get the main body content
  let body = tempDiv.textContent || tempDiv.innerText || ''

  // Clean up the text
  let cleanedText = body
    // Remove multiple whitespace and newlines
    .replace(/\s+/g, ' ')
    // Remove common email artifacts
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Remove email headers and footers patterns
    .replace(/From:.*?To:.*?Subject:.*?/gi, '')
    .replace(/Sent from my.*$/gi, '')
    .replace(/This email.*confidential.*$/gi, '')
    .replace(/Please consider.*environment.*$/gi, '')
    // Remove excessive punctuation
    .replace(/[.]{3,}/g, '...')
    .replace(/[-]{3,}/g, '---')
    .replace(/[=]{3,}/g, '===')
    // Trim and clean up
    .trim()

  // If we couldn't extract specific parts, try to parse common email patterns
  if (!sender && cleanedText.includes('From:')) {
    const fromMatch = cleanedText.match(/From:\s*([^\n\r]+)/i)
    if (fromMatch) {
      sender = fromMatch[1].trim()
    }
  }

  if (!subject && cleanedText.includes('Subject:')) {
    const subjectMatch = cleanedText.match(/Subject:\s*([^\n\r]+)/i)
    if (subjectMatch) {
      subject = subjectMatch[1].trim()
    }
  }

  // Remove the extracted headers from the cleaned text
  if (sender) {
    cleanedText = cleanedText.replace(new RegExp(`From:\\s*${sender.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'), '')
  }
  if (subject) {
    cleanedText = cleanedText.replace(new RegExp(`Subject:\\s*${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'), '')
  }

  // Final cleanup
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim()

  return {
    sender,
    subject,
    body: body.trim(),
    cleanedText,
    timestamp
  }
}

export { formatDate }

type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: ThrottleOptions = {}
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;
  let context: any, args: any;

  // Called after the wait time has passed
  const later = () => {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    func.apply(context, args);
    if (!timeout) {
      context = args = null;
    }
  };

  const throttled = function (this: any, ...params: Parameters<T>): void {
    context = this;
    args = params;
    const now = Date.now();

    if (!previous && options.leading === false) {
      previous = now;
    }

    const remaining = wait - (now - previous);
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
      if (!timeout) {
        context = args = null;
      }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
  };

  // Type assertion to ensure the throttled function has the same signature as T
  return throttled as unknown as T;
}
