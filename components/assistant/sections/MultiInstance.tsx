import { useState } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ChatColumn } from '../components/ChatColumn';
import { ChatMessage } from '../components/ChatMessage';
import { GoogleSearchColumn } from '../components/GoogleSearchColumn';
import { ConversationPanel } from '../components/ConversationPanel';
import { TokenUsageBar } from '@/components/ai/TokenUsageBar';
import { useConvoStore } from '@/stores/useConvoStore';
import { useAISdkStore } from '@/stores/useAISdkStore';

import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from "react-resizable-panels";

export function MultiInstance() {
  const aiSdkStore = useAISdkStore();
  const convoStore = useConvoStore();
  const [usageRefresh, setUsageRefresh] = useState(0);

  const handleStartChat = async (initialMessage: string) => {
    // Use the new AI SDK implementation with streaming
    await aiSdkStore.generateResponse({
      messages: [{ role: 'user', content: initialMessage }]
    });
    // Refresh usage bar after message completes
    setUsageRefresh(prev => prev + 1);
  };

  // Determine which store to use for the chat interface
  const messages = aiSdkStore.messages
  const isThinking = aiSdkStore.isThinking
  const errorMessage = aiSdkStore.error 

  // Create streaming message if we're actively streaming
  const streamingMessage = aiSdkStore.isStreaming && aiSdkStore.currentMessage ? {
    role: 'assistant' as const,
    content: aiSdkStore.currentMessage
  } : null;

  return (
    <div className="container max-w-full mx-auto h-[calc(100vh-70px)] flex flex-col relative">
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel 
            defaultSize={20} 
            minSize={12} 
            maxSize={20}
            collapsible
            collapsedSize={0.1}
          >
            <ConversationPanel 
              onSelectConversation={convoStore.loadConversation}
              activeConversationId={convoStore.activeConversationId || undefined}
            />
          </Panel>

          <PanelResizeHandle className="relative w-1 bg-border hover:bg-primary/50 transition-colors">
          </PanelResizeHandle>

          <Panel defaultSize={40} minSize={20} maxSize={100}>
            <ChatColumn 
              title={"Assistant"}
              logo="/yw-logo_only.svg"
              messages={messages}
              isThinking={isThinking}
              color="#16A34A"
              model=""
              errorMessage={errorMessage}
              className={cn(
                "h-[calc(100vh-240px)] md:rounded-lg",
              )}
            >
              {streamingMessage && (
                <ChatMessage
                  message={streamingMessage}
                  logo="/yw-logo_only.svg"
                  color="#16A34A"
                />
              )}
            </ChatColumn>

            <TokenUsageBar refreshTrigger={usageRefresh} className="border-t" />
            <div className="p-4 border-t flex flex-col gap-2">
              <ChatInput
                onSendMessage={handleStartChat}
                hideBadges
                disabled={aiSdkStore.error === 'TOKEN_LIMIT_REACHED'}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="relative w-1 bg-border hover:bg-primary/50 transition-colors">
          </PanelResizeHandle>

          <Panel 
            defaultSize={40} 
            minSize={20} 
            maxSize={50}
            collapsible
            collapsedSize={0.2}
          >
            <GoogleSearchColumn />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
