'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useAuth } from '@/contexts/AuthContext';
import { useChatPusher } from '@/hooks/useChatPusher';
import { ChatList } from '../subcomponents/it-heldpesk/ChatList';
import { HelpdeskChatView } from '../subcomponents/it-heldpesk/HelpdeskChatView';
import { ClientChatView } from '../subcomponents/client-user/ClientChatView';
import { MessageCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatPage() {
  const { user } = useAuth();
  const {
    activeConversationId,
    setActiveConversation,
    openConversation,
    conversations,
    onlineUsers,
    getTotalUnreadCount,
    initializeChat,
    isAgent,
  } = useChatStore();

  // Initialize chat - wait for valid user
  useEffect(() => {
    if (user && user.id > 0) {
      const roleId = user.role_id ? parseInt(String(user.role_id), 10) : 1;
      initializeChat(user.id, roleId);
    }
  }, [user, initializeChat]);

  // Connect to Pusher for real-time updates
  useChatPusher();

  const handleSelectConversation = (conversationId: number) => {
    openConversation(conversationId);
  };

  const handleBack = () => {
    setActiveConversation(null);
  };

  const totalUnread = getTotalUnreadCount();
  const onlineCount = onlineUsers.size;

  // Client view: Full-page single conversation
  if (!isAgent) {
    return (
      <div className="flex h-full bg-background">
        <div className="flex-1">
          <ClientChatView />
        </div>
      </div>
    );
  }

  // Agent view: Side-by-side layout
  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Conversations List */}
      <div
        className={cn(
          'flex flex-col border-r bg-muted/30',
          'w-full md:w-[320px] lg:w-[360px] xl:w-[360px]',
          // On mobile, hide when conversation is active
          activeConversationId ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-lg">Messages</h1>
            {totalUnread > 0 && (
              <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{onlineCount} online</span>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-hidden">
          <ChatList
            onSelectConversation={handleSelectConversation}
            activeConversationId={activeConversationId}
          />
        </div>
      </div>

      {/* Right Panel - Active Conversation */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          // On mobile, show only when conversation is active
          activeConversationId ? 'flex' : 'hidden md:flex'
        )}
      >
        {activeConversationId ? (
          <HelpdeskChatView
            conversationId={activeConversationId}
            onBack={handleBack}
            showBackButton={true}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/10">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <MessageCircle className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="font-semibold text-xl text-foreground mb-2">
        No conversation selected
      </h2>
      <p className="text-muted-foreground max-w-[300px]">
        Select a conversation from the list to start chatting with clients
      </p>
    </div>
  );
}
