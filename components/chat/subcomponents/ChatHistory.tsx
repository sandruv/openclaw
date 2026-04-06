'use client';

import { useMemo } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Filter, Pin, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

interface ChatHistoryProps {
  onSelectConversation?: (conversationId: number) => void;
  className?: string;
}

interface GroupedConversation {
  label: string;
  conversations: Array<{
    id: number;
    title: string;
    lastMessage: string;
    timestamp: string;
    isRead: boolean;
    isPinned?: boolean;
  }>;
}

function getDateGroupLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This Week';
  if (isThisMonth(date)) return 'This Month';
  return format(date, 'MMMM yyyy');
}

export function ChatHistory({ onSelectConversation, className }: ChatHistoryProps) {
  const { conversations, activeConversationId, messages } = useChatStore();

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const groups: Record<string, GroupedConversation['conversations']> = {};
    
    // Sort conversations by last_message_at descending
    const sorted = [...conversations].sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime;
    });

    sorted.forEach((conv) => {
      const date = conv.last_message_at ? new Date(conv.last_message_at) : new Date(conv.created_at);
      const label = getDateGroupLabel(date);
      
      if (!groups[label]) {
        groups[label] = [];
      }

      // Get conversation title from first message or default
      const convMessages = messages[conv.id] || [];
      const firstUserMessage = convMessages.find(m => m.sender_role === 'client');
      const title = firstUserMessage?.content.slice(0, 30) || conv.last_message?.content?.slice(0, 30) || 'New conversation';
      
      groups[label].push({
        id: conv.id,
        title: title + (title.length >= 30 ? '...' : ''),
        lastMessage: conv.last_message?.content?.slice(0, 40) || 'No messages yet',
        timestamp: format(date, 'h:mma'),
        isRead: (conv.unread_count || 0) === 0,
        isPinned: false, // Can be extended for pinned conversations
      });
    });

    // Convert to array maintaining order
    const orderedLabels = ['Today', 'Yesterday', 'This Week', 'This Month'];
    const result: GroupedConversation[] = [];
    
    orderedLabels.forEach(label => {
      if (groups[label]) {
        result.push({ label, conversations: groups[label] });
        delete groups[label];
      }
    });
    
    // Add remaining months
    Object.entries(groups).forEach(([label, convs]) => {
      result.push({ label, conversations: convs });
    });

    return result;
  }, [conversations, messages]);

  const handleSelectConversation = (conversationId: number) => {
    onSelectConversation?.(conversationId);
  };

  return (
    <div className={cn("flex flex-col h-full rounded-t-xl bg-white border border-gray-200 shadow-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 pt-6 border-b">
        <h3 className="font-semibold text-xs uppercase tracking-wide">Chat History</h3>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-green-500 hover:text-green-600"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-green-500 hover:text-green-600"
          >
            <Pin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {groupedConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No chat history yet
            </div>
          ) : (
            groupedConversations.map((group) => (
              <div key={group.label} className="mb-4">
                {/* Date Group Label */}
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </div>
                
                {/* Conversations in Group */}
                {group.conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg transition-colors mb-1",
                      "hover:bg-accent",
                      activeConversationId === conv.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-start gap-2">                      
                      <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between gap-2">
                          <div className="max-w-32">
                            <p className={cn(
                              "text-sm truncate",
                              !conv.isRead && "font-semibold"
                            )}>
                              {conv.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {conv.lastMessage}
                            </p>
                          </div>
                          
                          {/* Read status indicator */}
                          <div className="mt-1 shrink-0 flex flex-col justify-center items-end">
                            {conv.isRead ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
                            )}

                            <span className="text-[10px] text-muted-foreground shrink-0 mt-1">
                              {conv.timestamp}
                            </span>
                          </div>
                        </div>
                        
                      </div>
                    </div>  
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
