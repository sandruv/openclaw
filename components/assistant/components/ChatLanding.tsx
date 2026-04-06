import Image from 'next/image';
import { ChatInput } from './ChatInput';

interface ChatLandingProps {
  onStartChat: (initialMessage: string) => void;
  hideBadges?: boolean;
}

export function ChatLanding({ onStartChat, hideBadges = false }: ChatLandingProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-8 pt-8 mt-20">
      {/* Logo Header with Glow Effect */}
      <div className="w-full flex justify-center relative">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
          <Image
            src="/yw-logo_only.svg"
            alt="YW Logo"
            width={20}
            height={20}
            className="h-12 w-auto relative"
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl text-center">
        What can we help you with?
      </h1>

      {/* Input Form */}
      <ChatInput onSendMessage={onStartChat} hideBadges={hideBadges} className="w-full" />
    </div>
  );
}
