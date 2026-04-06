import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';
import { Message } from '@/types/ai';
import { useUserStore } from '@/stores/useUserStore';
import { cn } from '@/lib/utils';
import { getInitialsFromNames } from '@/lib/utils'

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  logo?: string;
  color?: string;
  children?: React.ReactNode;
}

export function ChatMessage({ message, isLoading, logo = "/yw-logo_only.svg", color, children }: ChatMessageProps) {
  const user = useUserStore(state => state.user);
  const initials = user ? getInitialsFromNames(user.first_name, user.last_name) : 'U';

  return (
    <div
      className={`flex items-start gap-2 ${
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        {message.role === 'user' ? (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar 
            className="w-8 h-8 p-[2px] border-2"
            style={{ borderColor: color }}
          >
            <AvatarImage src={logo} alt="Assistant" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
      </div>
      <div
        className={`max-w-[80%] p-3 rounded-lg text-sm ${
          message.role === 'user'
            ? 'bg-primary/5'
            : 'bg-muted'
        }`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>
            {message.content}
          </ReactMarkdown>
          {children}
        </div>
      </div>
    </div>
  );
}
