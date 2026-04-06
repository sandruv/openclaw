'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { ChatList } from './it-heldpesk/ChatList';
import { HelpdeskChatView } from './it-heldpesk/HelpdeskChatView';
import { ClientChatView } from './client-user/ClientChatView';
import { Button } from '@/components/ui/button';
import { X, MessageSquarePlus, MessageCircle } from 'lucide-react';

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const {
    activeConversationId,
    setActiveConversation,
    openConversation,
    isAgent,
    getClientConversationId,
    currentUserId,
  } = useChatStore();

  // For clients, auto-open their single conversation
  useEffect(() => {
    if (!isAgent && !activeConversationId) {
      const clientConvId = getClientConversationId();
      if (clientConvId) {
        setActiveConversation(clientConvId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAgent, activeConversationId]);

  const handleSelectConversation = (conversationId: number) => {
    openConversation(conversationId);
  };

  // Client view: Single conversation flow (no list sidebar)
  if (!isAgent) {
    return (
      <div className="flex flex-col h-full bg-background rounded-lg border shadow-lg overflow-hidden">
        <ClientChatView onClose={onClose} />
      </div>
    );
  }

  // Agent view: Side-by-side layout (List + Conversation)
  return (
    <div className="flex h-full bg-background rounded-lg border shadow-lg overflow-hidden">
      {/* Left Panel - Conversations List */}
      <div className="w-[240px] flex flex-col border-r bg-muted/30">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-background">
          <h3 className="font-semibold text-sm">Messages</h3>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-hidden">
          <ChatList
            onSelectConversation={handleSelectConversation}
            activeConversationId={activeConversationId}
            compact
          />
        </div>
      </div>

      {/* Right Panel - Active Conversation */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversationId ? (
          <HelpdeskChatView
            conversationId={activeConversationId}
            showBackButton={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/10">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground mb-1">No conversation selected</h4>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Select a conversation from the list to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
