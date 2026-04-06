'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image'; 

interface QuickChatButton {
  id: string;
  label: string;
  message: string;
  icon: string;
  color?: string;
}

const quickButtons: QuickChatButton[] = [
  {
    id: 'help',
    label: 'HELP',
    message: 'Hi, I need help!',
    icon: '/dashboard-assets/chat-assets/help.svg',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'question',
    label: 'QUESTION',
    message: 'Hi, I have a question.',
    icon: '/dashboard-assets/chat-assets/question.svg',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'buy',
    label: 'BUY',
    message: 'Hi, I would like to make a purchase.',
    icon: '/dashboard-assets/chat-assets/buy.svg',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'user-change',
    label: 'USER CHANGE',
    message: 'Hi, I need help with a user change request.',
    icon: '/dashboard-assets/chat-assets/user-change.svg',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'follow-up',
    label: 'FOLLOW UP',
    message: 'Hi, I am following up on a previous request.',
    icon: '/dashboard-assets/chat-assets/follow-up.svg',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'other',
    label: 'OTHER',
    message: 'Hi, I have a request.',
    icon: '/dashboard-assets/chat-assets/other.svg',
    color: 'bg-green-500 hover:bg-green-600',
  },
];

interface QuickChatButtonsProps {
  onQuickMessage: (message: string) => void;
  className?: string;
  compact?: boolean;
}

export function QuickChatButtons({ onQuickMessage, className, compact = false }: QuickChatButtonsProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-6 h-full", className)}>
      <div className="grid grid-cols-2 gap-4 max-w-[320px]">
        {quickButtons.map((btn) => (
          <Button
            key={btn.id}
            onClick={() => onQuickMessage(btn.message)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 h-[100px] w-[100px] rounded-xl text-white p-2",
              btn.color
            )}
          >
            { btn.id === 'other' || btn.id === 'user-change' ? (
              <Image width={30} height={20} src={btn.icon} alt={btn.label} />
            ) : (
              <Image width={40} height={30} src={btn.icon} alt={btn.label} />
            )}
            <span className="text-xs font-semibold tracking-wider text-wrap">{btn.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
