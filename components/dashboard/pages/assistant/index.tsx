import { ChatInput } from '@/components/dashboard/subcomp/ChatInput';
import { useGptStore } from '@/stores/useGptStore';
import { useDeepseekStore } from '@/stores/useDeepseekStore';
import { ChatColumn } from './sections/ChatColumn';
import { ChatMessage } from './sections/ChatMessage'; 
import { useEffect } from 'react';
import { ConversationPanel } from './sections/conversation-panel';
import { useAISdkStore } from '@/stores/useAISdkStore';
import { useConvoStore } from '@/stores/useConvoStore';

import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from "react-resizable-panels";

export default function Assistant() {
  const gptStore = useGptStore();
  const deepseekStore = useDeepseekStore();
  const aiSdkStore = useAISdkStore();
  const convoStore = useConvoStore();

  useEffect(() => {
    let mounted = true;

    const checkConnections = async () => {
      if (!mounted) return;
      
      try {
        await Promise.all([
          gptStore.checkConnection(),
          deepseekStore.checkConnection()
        ]);
      } catch (error) {
        logger.error('Error checking connections:', error);
      }
    };

    checkConnections();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartChat = async (initialMessage: string) => {
    if (!initialMessage.trim()) return;
    
    // Set thinking state immediately before making the API call
    // This ensures the thinking indicator appears right away
    aiSdkStore.setThinking(true);
    
    // Use the AI SDK implementation with streaming
    await aiSdkStore.generateResponse({
      messages: [{ role: 'user', content: initialMessage }]
    });
  };
  
  // Create streaming message if we're actively streaming
  const streamingMessage = aiSdkStore.isStreaming && aiSdkStore.currentMessage ? {
    role: 'assistant' as const,
    content: aiSdkStore.currentMessage
  } : null;

  return (
    <div className="container max-w-full mx-auto h-[calc(100vh-120px)] flex flex-col relative">
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel 
            defaultSize={20} 
            minSize={15} 
            maxSize={40}
            collapsible
            collapsedSize={0.1}
          >
            <ConversationPanel 
              onSelectConversation={convoStore.loadConversation}
              activeConversationId={convoStore.activeConversationId || undefined}
            />
          </Panel>

          <PanelResizeHandle className="relative w-1 bg-gray-100 hover:bg-gray-200 transition-colors">
          </PanelResizeHandle>

          <Panel defaultSize={40} minSize={20} maxSize={100}>
            <div className="px-10">
              <ChatColumn 
                title="Assistant"
                logo="/yw-logo_only.svg"
                messages={aiSdkStore.messages}
                isThinking={aiSdkStore.isThinking}
                color="#16A34A"
                model=""
                errorMessage={aiSdkStore.error}
                className={cn(
                  "h-[calc(100vh-300px)] md:rounded-lg",
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

              <div className="p-2">
                <ChatInput onSendMessage={handleStartChat} hideBadges />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
