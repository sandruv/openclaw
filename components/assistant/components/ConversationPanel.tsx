import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquarePlus } from 'lucide-react';
import { useConvoStore } from '@/stores/useConvoStore';
import { cn } from '@/lib/utils';

interface ConversationPanelProps {
  onSelectConversation: (conversationId: string) => void;
  activeConversationId?: string;
}

export function ConversationPanel({ onSelectConversation, activeConversationId }: ConversationPanelProps) {
  const { conversations, createNewConversation, loadAllConversations } = useConvoStore();

  useEffect(() => {
    loadAllConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewConversation = () => {
    const newConvoId = createNewConversation();
    if (newConvoId) {
      onSelectConversation(newConvoId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button 
          onClick={handleNewConversation} 
          className="w-full"
          variant="outline"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          New
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length === 0 && (
            <div className="flex items-center justify-center h-full border-b border-muted py-3 px-4">
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          )}
          {conversations.length > 0 && (
            <p className="text-muted-foreground text-sm ml-3 my-2">Conversations</p>
          )}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md hover:bg-accent/50 transition-colors",
                "flex items-center justify-between",
                activeConversationId === conversation.id && "bg-accent"
              )}
            >
              <div className="flex justify-between items-center w-full">
                <p className="text-md truncate">
                  {conversation.messages[0]?.content || "New Conversation"}
                </p>
                <p className="text-xs text-muted-foreground" style={{ lineHeight: "0.5px" }}>
                  {formatDate(conversation.updatedAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
