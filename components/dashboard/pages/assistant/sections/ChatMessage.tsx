import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/types/ai';
import { useUserStore } from '@/stores/useUserStore';
import { cn } from '@/lib/utils';
import { getInitialsFromNames } from '@/lib/utils';
import { StarIcon } from '@/components/dashboard/subcomp/StarIcon';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  logo?: string;
  color?: string;
  children?: React.ReactNode;
}

export function ChatMessage({ message, isLoading, logo = "/yw-logo_only.svg", color = "#2563eb", children }: ChatMessageProps) {
  const user = useUserStore(state => state.user);
  const initials = user ? getInitialsFromNames(user.first_name, user.last_name) : 'U';

  // Split assistant message into intro paragraph and rest of content
  const { introParagraph, restContent } = useMemo(() => {
    if (message.role !== 'assistant') {
      return { introParagraph: '', restContent: message.content };
    }
    
    const content = message.content.trim();
    // Find the first paragraph break (double newline or single newline followed by another paragraph)
    const firstBreak = content.search(/\n\n|\n(?=[A-Z])/);
    
    if (firstBreak > 0 && firstBreak < 500) {
      return {
        introParagraph: content.slice(0, firstBreak).trim(),
        restContent: content.slice(firstBreak).trim()
      };
    }
    
    // If no clear break, use first sentence or first 200 chars
    const firstSentenceEnd = content.search(/[.!?]\s/);
    if (firstSentenceEnd > 0 && firstSentenceEnd < 300) {
      return {
        introParagraph: content.slice(0, firstSentenceEnd + 1).trim(),
        restContent: content.slice(firstSentenceEnd + 1).trim()
      };
    }
    
    return { introParagraph: '', restContent: content };
  }, [message.content, message.role]);

  // User message - right aligned with blue bubble
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-sm" style={{ backgroundColor: color }}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message - left aligned with StarIcon and structured content
  return (
    <div className="flex items-start gap-3 mb-6">
      {/* Star Icon */}
      <div className="flex-shrink-0 mt-1">
        <StarIcon color={color} size={20} />
      </div>
      
      {/* Message Content */}
      <div className="flex-1 min-w-0 max-w-[85%]">
        {/* Intro paragraph in primary color */}
        {introParagraph && (
          <>
            <p className="text-sm text-primary leading-relaxed mb-3">
              {introParagraph}
            </p>
            {restContent && (
              <div className="border-t border-border my-4" />
            )}
          </>
        )}
        
        {/* Rest of content in normal text */}
        {restContent && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed mb-4 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="text-sm list-disc pl-4 mb-4 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-sm list-decimal pl-4 mb-4 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-4 text-xs">{children}</pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground mb-4">{children}</blockquote>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-semibold mb-3">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-semibold mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold mb-2">{children}</h3>
                ),
              }}
            >
              {restContent}
            </ReactMarkdown>
          </div>
        )}
        
        {/* If no split happened, show full content */}
        {!introParagraph && !restContent && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        
        {/* Closing question if present */}
        {children}
      </div>
    </div>
  );
}
