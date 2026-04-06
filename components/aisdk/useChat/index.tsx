'use client';

import { useChat } from '@ai-sdk/react';
import { useSessionStore } from '@/stores/useSessionStore';
import { useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatComponent() {
  const { token, user } = useSessionStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/aisdk/tools',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-250px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={cn(
              "flex",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div className={cn(
              "max-w-[70%] p-3 py-2 rounded-lg",
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-muted rounded-bl-none'
            )}>
              <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder='Ask questions like "Show me the latest ticket" or "Find high priority tickets"'
            className="flex-1 p-2 h-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-muted"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "h-10 w-10 rounded-md border flex items-center justify-center",
              "hover:bg-primary hover:text-primary-foreground transition-colors",
              "focus:outline-none focus:ring-0 cursor-pointer",
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            <Send className={cn(
              "h-5 w-5",
              isLoading && "animate-pulse"
            )} />
          </button>
        </form>
      </div>
    </div>
  );
}