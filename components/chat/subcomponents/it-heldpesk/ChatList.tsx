'use client';

import { useChatStore } from '@/stores/useChatStore';
import { ChatAvatar } from '../ChatAvatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { chatService } from '@/services/chatService';

interface ChatListProps {
  onSelectConversation: (conversationId: number) => void;
  /** Currently active conversation ID for highlighting */
  activeConversationId?: number | null;
  /** Compact mode for sidebar display */
  compact?: boolean;
}

export function ChatList({
  onSelectConversation,
  activeConversationId,
  compact = false,
}: ChatListProps) {
  const { conversations, isAgent, isLoading, isUserOnline } = useChatStore();

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-muted-foreground text-sm">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-muted-foreground text-sm">No conversations yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          {isAgent ? 'Waiting for client messages' : 'Start a new chat to begin'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto styled-scrollbar">
      <div className="flex flex-col">
        {conversations.map((conversation) => {
          const isActive = activeConversationId === conversation.id;
          
          // Role-based display: agents see client name, clients see "IT Helpdesk"
          const displayName = isAgent
            ? chatService.getUserDisplayName(conversation.client_user)
            : 'IT Helpdesk';
          
          // For avatar, use client user for agents, generic for clients
          const avatarUser = isAgent
            ? conversation.client_user
            : { name: 'IT Helpdesk' };

          // Check if client user is online (for agents)
          const clientOnline = isAgent && conversation.client_user_id 
            ? isUserOnline(conversation.client_user_id) 
            : false;

          // Get last message time
          const lastMessageTime = conversation.last_message_at || conversation.updated_at;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                'flex items-center gap-2.5 transition-colors text-left w-full',
                'border-b last:border-b-0',
                compact ? 'p-2.5' : 'p-3 gap-3',
                isActive
                  ? 'bg-primary/10 hover:bg-primary/15 border-l-2 border-l-green-500'
                  : 'hover:bg-muted/50'
              )}
            >
              <ChatAvatar
                user={avatarUser}
                size={compact ? 'sm' : 'md'}
                showOnlineStatus={isAgent}
                isOnline={clientOnline}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={cn(
                      'font-medium truncate',
                      compact ? 'text-xs' : 'text-sm'
                    )}
                  >
                    {displayName}
                  </span>
                  {lastMessageTime && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(lastMessageTime), {
                        addSuffix: false,
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1.5 mt-0.5">
                  <p
                    className={cn(
                      'text-muted-foreground truncate',
                      compact ? 'text-[11px]' : 'text-xs'
                    )}
                  >
                    {conversation.last_message?.content || 'No messages yet'}
                  </p>
                  {(conversation.unread_count || 0) > 0 && (
                    <span
                      className={cn(
                        'shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium',
                        compact
                          ? 'h-4 min-w-4 px-1 text-[9px]'
                          : 'h-5 min-w-5 px-1.5 text-[10px]'
                      )}
                    >
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
