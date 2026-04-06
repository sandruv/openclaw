"use client";

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, Search, Bot, Plus, Settings2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGoogleStore } from '@/stores/useGoogleStore';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useAISdkStore } from '@/stores/useAISdkStore';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
  hideBadges?: boolean;
  isHeader?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, className = '', hideBadges = false, isHeader = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { query } = useGoogleStore();
  const { isThinking } = useAISdkStore();
  const themeColor = useThemeColor();

  useEffect(() => {
    if (query) {
      setMessage(query);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setTimeout(() => setMessage(''), 500);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="bg-white dark:bg-muted rounded-lg p-3 border border-border shadow-sm">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Write a message here..."
          className={cn("resize-none text-base bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none", isHeader? "min-h-[20px]" : "min-h-[90px]")}
          rows={1}
          disabled={isLoading}
        />

        <div className={cn("flex items-center justify-between mt-2", isHeader? "absolute top-1 right-3" : "")}>
          <div className="flex items-center gap-2">
            { !isHeader && (
              <>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-8"
                  style={{ color: themeColor.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = themeColor.hover
                    e.currentTarget.style.backgroundColor = themeColor.bgLighter
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = themeColor.text
                    e.currentTarget.style.backgroundColor = ''
                  }}
                  onClick={() => console.log('Plus clicked')}
                >
                  <Plus className="h-5 w-5" />
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="h-7 px-3 gap-1.5"
                  style={{ color: themeColor.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = themeColor.hover
                    e.currentTarget.style.backgroundColor = themeColor.bgLighter
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = themeColor.text
                    e.currentTarget.style.backgroundColor = ''
                  }}
                  onClick={() => console.log('Tools clicked')}
                >
                  <Settings2 className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">TOOLS</span>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            { !isHeader && (
              <div   
                className="h-7 px-4 gap-2 flex items-center border rounded-lg"
                style={{ 
                  color: themeColor.text,
                  borderColor: themeColor.base
                }}
              >
                <Bot className="h-4 w-4" />
                <span className="text-xs font-medium">AI Automated</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className={cn("text-white font-medium", isHeader? "w-8 h-8" : "h-7 px-6")}
              style={{ backgroundColor: themeColor.base }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColor.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColor.base}
              disabled={isLoading || isThinking}
            >
              {isLoading || isThinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-xs uppercase">SEND</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
