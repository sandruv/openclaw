"use client";

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, File, Clipboard } from 'lucide-react';
import { useState } from 'react';
import { useAIStore } from '@/stores/useAIStore';
import { useGptStore } from '@/stores/useGptStore';
import { PROVIDER_NAMES, PROVIDER_COLORS, type Provider } from '@/lib/aiProviders';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
  hideBadges?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, className = '', hideBadges = false, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { selectedProvider } = useAIStore();
  const { selectedModel } = useAIStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="bg-muted rounded-lg p-2 border border-solid border-2  focus-within:border-lime-500">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask a question..."
          className="min-h-[70px] resize-none text-base pr-12 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          disabled={isLoading || disabled}
        />

        <div className="buttons-container flex align-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="ghost"
              size="icon"
              className="rounded-sm border hover:bg-lime-500 hover:text-white"
              disabled={isLoading || disabled}
            >
              <File className="h-4 w-4" />
            </Button>

            <Button 
              type="button" 
              variant="ghost"
              size="icon"
              className="rounded-sm border hover:bg-lime-500 hover:text-white"
              disabled={isLoading || disabled}
            >
              <Clipboard className="h-4 w-4" />
            </Button>

            <div className="flex gap-1.5 ml-2">
              {!hideBadges && (
                <>
                  <Badge 
                variant="secondary" 
                    className={cn(
                  "text-white text-xs",
                      PROVIDER_COLORS[selectedProvider as Provider]
                    )}
                  >
                    {PROVIDER_NAMES[selectedProvider as Provider]}
                  </Badge>
              <Badge variant="outline" className="text-xs">
                    {selectedModel}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            size="icon"
            className="rounded-sm bg-lime-500 hover:bg-lime-600"
            disabled={isLoading || disabled}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
