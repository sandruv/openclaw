import { useRef, useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { ChatLanding } from '../components/ChatLanding';
import { ChatLoader } from '../components/ChatLoader';
import { Sidebar } from '../sidebar';
import { useAIStore } from '@/stores/useAIStore';
import { LoadingDots } from '@/components/ui/loading-dots';

export function SingleInstance() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading, isThinking } = useAIStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      try {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      } catch (error) {
        console.warn('Error scrolling to bottom:', error);
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isThinking, scrollToBottom]);

  const handleStartChat = (initialMessage: string) => {
    sendMessage(initialMessage);
  };

  const chatContent = messages.length === 0 ? (
    <ChatLanding onStartChat={handleStartChat} />
  ) : (
    <Card className="w-full h-full shadow-none border-none">
      <CardHeader className="flex justify-center pb-2">
        <CardTitle className="flex items-center gap-2">
          <Image
            src="/yw-logo_only.svg"
            alt="YW Logo"
            width={20}
            height={20}
            className="h-6 w-auto"
          />
          <span className="text-md font-semibold">YWAI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="shadow-none">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-[calc(100vh-350px)] max-h-[80vh] mb-4 p-4 pt-0 border-none shadow-none"
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isThinking && (
              <ChatMessage
                message={{
                  role: 'assistant',
                  content: ''
                }}
              >
                thinking <LoadingDots />
              </ChatMessage>
            )}
          </div>
        </ScrollArea>
        <ChatInput onSendMessage={sendMessage} />
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-full">
      <div className={`flex-1 relative transition-all duration-300 ${isSidebarCollapsed ? 'mr-0' : 'mr-80'}`}>
        <ChatLoader isLoading={isLoading} />
        <div className="container max-w-4xl mx-auto p-4 h-full">
          {chatContent}
        </div>
      </div>
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="h-full"
      />
    </div>
  );
}
