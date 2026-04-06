import Image from 'next/image';
import { ChatInput } from './ChatInput';
import { RecentConversations } from './RecentConversations';
import { Sparkles } from 'lucide-react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StarIcon } from './StarIcon';
interface ChatLandingProps {
  onStartChat: (initialMessage: string) => void;
  hideBadges?: boolean;
}

export function ChatLanding({ onStartChat, hideBadges = false }: ChatLandingProps) {
  const themeColor = useThemeColor()
  // Handler for when a conversation is selected from the recent conversations list
  const handleSelectConversation = (conversationId: string) => {
    // Pass empty string to navigate without sending a new message
    onStartChat("");
  };
  
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-6 mb-5 ">
      {/* Title with Sparkle Icon */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl text-center font-semibold flex items-center gap-2 justify-center"
      style={{ color: themeColor.text }}>
        <StarIcon color={themeColor.text} size={24} />
        What can we help you with?
      </h1>

      {/* Input Form */}
      <ChatInput onSendMessage={onStartChat} hideBadges={hideBadges} className="w-full" />
      
      {/* Recent Conversations Component */}
      {/* <RecentConversations onSelectConversation={handleSelectConversation} limit={3} /> */}
    </div>
  );
}
