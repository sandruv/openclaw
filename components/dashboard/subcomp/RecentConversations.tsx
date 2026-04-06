import { useConvoStore } from '@/stores/useConvoStore';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConversationButtonsLoader } from '../loaders/ConversationButtonsLoader';
import { cn } from '@/lib/utils';

interface RecentConversationsProps {
  onSelectConversation: (conversationId: string) => void;
  limit?: number;
}

export function RecentConversations({ 
  onSelectConversation, 
  limit = 3 
}: RecentConversationsProps) {
  const router = useRouter();
  const { conversations, loadAllConversations, isLoading } = useConvoStore();
  
  useEffect(() => {
    loadAllConversations();
  }, [loadAllConversations]);
  
  // Get the limited number of most recent conversations
  const recentConversations = conversations.slice(0, limit);
  
  // Function to get the first message from a conversation
  const getFirstMessage = (messages: any[]) => {
    if (!messages || messages.length === 0) return "New Conversation";
    return messages[0].content.length > 60 
      ? `${messages[0].content.substring(0, 60)}...` 
      : messages[0].content;
  };
  
  // Function to handle clicking on a conversation
  const handleConversationClick = (conversationId: string) => {
    useConvoStore.getState().loadConversation(conversationId);
    onSelectConversation(conversationId);
  };

  // Show loading skeletons when loading
  if (isLoading) {
    return <ConversationButtonsLoader count={limit} buttonWidth="150px" buttonHeight="32px" />;
  }
  
  // Return null if no conversations and not loading
  if (recentConversations.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full" style={{marginTop: "5px"}}>
      <div className="flex justify-between w-full overflow-hidden pb-1">
        <div className="flex flex-row gap-2">
          {recentConversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant="outline"
              size="sm"
              className="flex-shrink-0 max-w-[200px] justify-start text-left h-8 px-3"
              onClick={() => handleConversationClick(conversation.id)}
            >
              <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="truncate">{getFirstMessage(conversation.messages)}</span>
            </Button>
          ))}
        </div>

        <Link 
          href="/dashboard/chat-search" 
          className="flex items-center text-xs text-primary hover:text-underline group transition-all duration-200"
        >
          <span>See more conversations</span>
          <span className="inline-flex items-center transition-transform duration-200 group-hover:translate-x-0.5">
            <ChevronRight className={cn(
              "h-3 w-3 ml-1.5", 
              "transition-all duration-200 group-hover:scale-110"
            )} />
          </span>
        </Link>
      </div>
    </div>
  );
}
