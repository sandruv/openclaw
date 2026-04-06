import { useRef, useCallback, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { LoadingDots } from '@/components/ui/loading-dots';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { StarIcon } from '@/components/dashboard/subcomp/StarIcon';
import { useThemeColor } from '@/hooks/useThemeColor'

export interface ChatColumnProps {
  title: string;
  logo: string;
  messages: any[];
  isThinking?: boolean;
  className?: string;
  color?: string;
  model?: string;
  errorMessage?: string | null;
  children?: React.ReactNode;
}

export const ChatColumn = ({ 
  title, 
  logo, 
  messages, 
  isThinking, 
  className, 
  color = "#2563eb",
  model,
  errorMessage,
  children 
}: ChatColumnProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const themeColor = useThemeColor();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, children, scrollToBottom]);

  return (
    <div className={cn(
      "flex flex-col h-full bg-gray-100", 
      className
    )}>
      {/* Messages Area */}
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 h-[calc(100vh-300px)]"
      >
        <div className="px-8 py-6 max-w-4xl mx-auto">
          {messages.length === 0 && !errorMessage ? (
            <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground">
              <StarIcon color={themeColor.base} size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Start a new conversation</p>
              <p className="text-sm text-center max-w-md">
                Ask me anything - I can help with research, writing, analysis, and more.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.filter(message => message.role !== 'system').map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  logo={logo}
                  color={themeColor.base}
                />
              ))}
            </div>
          )}

          {/* Inline Error Banner */}
          {errorMessage && (
            <div className="my-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm break-words whitespace-normal flex-1">{errorMessage}</p>
            </div>
          )}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-center gap-3 mt-4" style={{color: themeColor.base}}>
              <div className="w-6 h-[2px] rounded-full bg-primary animate-pulse" style={{backgroundColor: themeColor.base}}></div>
              <div className="flex items-center gap-2">
                <span className="text-sm animate-pulse">thinking</span>
                <LoadingDots />
              </div>
            </div>
          )}

          {children}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>
      </ScrollArea>
    </div>
  );
};
