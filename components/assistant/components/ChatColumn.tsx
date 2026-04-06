import { useRef, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { ChatMessage } from './ChatMessage';
import { LoadingDots } from '@/components/ui/loading-dots';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

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
  color,
  model,
  errorMessage,
  children 
}: ChatColumnProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Scroll on new messages, thinking state change, or streaming updates
    scrollToBottom();
  }, [messages, isThinking, children, scrollToBottom]);

  return (
    <Card className={cn(
      "border-1 rounded-none shadow-none p-2",
      className
    )}>
      <CardHeader className={cn("flex flex-row items-center gap-2 px-4 py-2", ""+color)}>
        <Image
          src={logo}
          width={24}
          height={24}
          alt={title}
          className="rounded-sm mt-1"
        />
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl mt-0">{title}</CardTitle>
          {model && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs font-normal text-white",
              )}
              style={{ backgroundColor: color }}
            >
              {model}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[calc(100vh-318px)] rounded-none"
        >
          <div className="flex flex-col gap-2 p-4">
            {messages.length === 0 && !errorMessage ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">No messages yet</p>
                <p className="text-sm text-center">
                  Start a conversation by typing a message below
                </p>
              </div>
            ) : (
              messages.filter(message => message.role !== 'system').map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  logo={logo}
                  color={color}
                />
              ))
            )}

            {/* Inline Error Banner */}
            {errorMessage && (
              <div className="my-2 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-800">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-sm break-words whitespace-normal flex-1">{errorMessage}</p>
              </div>
            )}

            {isThinking && (
              <div className="flex items-center gap-2">
                <div className="w-[40px] border-b-2 border-gray-200"></div>
                <div className="text-sm text-muted-foreground">thinking <LoadingDots /></div>
              </div>
            )}
            {children}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
