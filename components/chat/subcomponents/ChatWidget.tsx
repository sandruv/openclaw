'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useChatPusher } from '@/hooks/useChatPusher';
import { ChatPanel } from './ChatPanel';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
  /** Position of the widget */
  position?: 'bottom-right' | 'bottom-left';
  /** Custom class for positioning */
  className?: string;
  /** Current user ID */
  userId?: number;
  /** Current user role ID (1=admin, 2=agent, others=client) */
  roleId?: number;
  /** Whether to show the chat panel */
  showChat?: boolean;
}

export function ChatWidget({
  position = 'bottom-right',
  className,
  userId,
  roleId = 3, // Default to client role
  showChat = false,
}: ChatWidgetProps) {
  const {
    isOpen,
    toggleChat,
    closeChat,
    getTotalUnreadCount,
    initializeChat,
    isInitialized,
    isAgent,
  } = useChatStore();

  // Initialize Pusher subscriptions
  useChatPusher();

  // Initialize chat on mount - wait for valid userId
  useEffect(() => {
    // Don't initialize until we have a valid userId
    if (!userId || userId <= 0 || !roleId) {
      return;
    }
    
    // Initialize or reinitialize if userId changes
    initializeChat(userId, roleId);
  }, [initializeChat, userId, roleId]);

  const unreadCount = getTotalUnreadCount();

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute mb-2',
            // Wider for agents (side-by-side layout), compact for clients
            isAgent ? 'w-[700px] h-[520px]' : 'w-[340px] h-[480px]',
            position === 'bottom-right' ? 'bottom-full right-0' : 'bottom-full left-0'
          )}
        >
          <ChatPanel onClose={closeChat} />
        </div>
      )}

      {/* Toggle Button */}
      {showChat && (
        <Button
          onClick={toggleChat}
          size="lg"
          className={cn(
            'rounded-full h-10 w-10 shadow-lg bg-green-500 hover:bg-green-600',
            isOpen && ''
          )}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
