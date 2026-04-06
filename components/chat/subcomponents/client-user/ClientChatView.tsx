'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useDashboardSettingsStore } from '@/stores/useDashboardSettingsStore';
import { chatService } from '@/services/chatService';
import { ChatMessageBubble } from '../ChatMessageBubble';
import { ChatInput } from '../ChatInput';
import { TypingIndicator } from '../TypingIndicator';
import { MessageDateDivider, shouldShowDateDivider } from '../MessageDateDivider';
import { QuickChatButtons } from './QuickChatButtons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Loader2, 
  ChevronUp, 
  SquareArrowOutUpRight, 
  SquareArrowOutDownLeft,
  Menu,
  Minus,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface ClientChatViewProps {
  onClose?: () => void;
  onToggleExpand?: () => void;
  onToggleHistory?: () => void;
  isExpanded?: boolean;
  showHistoryToggle?: boolean;
  historyOpen?: boolean;
}

/**
 * Simplified chat view for clients - single conversation flow
 * No conversation list, direct messaging to IT Helpdesk
 */
export function ClientChatView({ 
  onClose, 
  onToggleExpand, 
  onToggleHistory, 
  isExpanded = false,
  showHistoryToggle = true,
  historyOpen = false,
}: ClientChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showQuickButtons, setShowQuickButtons] = useState(true);

  // Get actions (stable, don't cause re-renders)
  const getOrCreateConversation = useChatStore((state) => state.getOrCreateConversation);
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sendTypingIndicator = useChatStore((state) => state.sendTypingIndicator);
  const getTypingUser = useChatStore((state) => state.getTypingUser);
  
  // Get reactive state values
  const currentUserId = useChatStore((state) => state.currentUserId);
  const isLoading = useChatStore((state) => state.isLoading);
  const isSending = useChatStore((state) => state.isSending);
  const isInitialized = useChatStore((state) => state.isInitialized);
  
  // Subscribe to conversations and messages directly from store
  const conversations = useChatStore((state) => state.conversations);
  const allMessages = useChatStore((state) => state.messages);
  
  // Derive conversationId from conversations
  const conversationId = !isInitialized || !currentUserId 
    ? null 
    : conversations.find(c => c.client_user_id === currentUserId)?.id || null;
  
  // Get messages for this conversation - memoized to prevent dependency changes
  const messages = useMemo(() => {
    return conversationId ? (allMessages[conversationId] || []) : [];
  }, [conversationId, allMessages]);
  
  const typingUser = conversationId ? getTypingUser(conversationId) : null;
  
  // Debug log to trace the issue
  useEffect(() => {
    console.log('[ClientChatView] State:', { 
      conversationId, 
      messagesCount: messages.length,
      currentUserId,
      isInitialized 
    });
  }, [conversationId, messages.length, currentUserId, isInitialized]);

  // Hide quick buttons once user has sent a message
  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickButtons(false);
    }
  }, [messages.length]);

  // Auto-create conversation when client opens chat
  useEffect(() => {
    if (isInitialized && currentUserId && !conversationId) {
      getOrCreateConversation(currentUserId);
    }
  }, [isInitialized, currentUserId, conversationId, getOrCreateConversation]);

  // Fetch initial messages when conversation is ready
  useEffect(() => {
    if (conversationId && messages.length === 0) {
      fetchMessages(conversationId);
    }
  }, [conversationId, messages.length, fetchMessages]);

  // Auto-scroll to bottom on new messages
  const prevMessageCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessageCount.current && !isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCount.current = messages.length;
  }, [messages, isLoadingMore]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (conversationId) {
      sendTypingIndicator(conversationId, true);
    }
  }, [conversationId, sendTypingIndicator]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore || !conversationId) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchMessages(conversationId, nextCursor);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, fetchMessages, hasMore, isLoadingMore, nextCursor]);

  const handleSend = async (content: string, files?: File[]) => {
    if (!conversationId) return;
    
    sendTypingIndicator(conversationId, false);
    setShowQuickButtons(false);
    
    // If files are attached, upload them first
    if (files && files.length > 0) {
      try {
        const uploadResult = await chatService.uploadFiles(conversationId, files);
        const uploadedFiles = (uploadResult as any).files || uploadResult.data?.files;
        
        if (uploadedFiles && uploadedFiles.length > 0) {
          // Send text message first if provided
          if (content) {
            await sendMessage(conversationId, content);
          }
          
          // Send file message for each uploaded file
          for (const uploadedFile of uploadedFiles) {
            await sendMessage(conversationId, uploadedFile.fileName, {
              messageType: 'file',
              fileUrl: uploadedFile.url,
              fileName: uploadedFile.fileName,
              fileType: uploadedFile.fileType,
              fileSize: uploadedFile.fileSize,
            });
          }
        }
      } catch (error) {
        console.error('[ClientChatView] File upload failed:', error);
      }
    } else if (content) {
      await sendMessage(conversationId, content);
    }
  };

  // Handle quick chat button click
  const handleQuickMessage = async (message: string) => {
    setShowQuickButtons(false);
    
    // Ensure conversation exists before sending
    if (!conversationId && currentUserId) {
      await getOrCreateConversation(currentUserId);
    }
    
    // Small delay to ensure conversation is created
    setTimeout(() => {
      const state = useChatStore.getState();
      const conv = state.conversations.find(c => c.client_user_id === state.currentUserId);
      if (conv) {
        sendMessage(conv.id, message);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-t-xl border border-gray-200 shadow-lg bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-background pt-5">
        {/* History toggle button */}
        {showHistoryToggle && onToggleHistory && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleHistory} 
            className="shrink-0 h-8 w-8 text-green-500 hover:text-green-600"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        {/* Logo and title */}
        <div className="h-9 w-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
          YW
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">YanceyWorks Help</p>
          <p className="text-[10px] text-green-600 uppercase tracking-wide">
            {typingUser ? 'Typing...' : 'We are online'}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          {onToggleExpand && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleExpand} 
              className="shrink-0 h-8 w-8 text-green-500 hover:text-green-600"
              title={isExpanded ? 'Detach from side' : 'Attach to side'}
            >
              {isExpanded ? (
                // Detach icon - arrow pointing away from panel
                <SquareArrowOutDownLeft className="h-4 w-4" />
              ) : (
                // Attach icon - arrow pointing into panel
                <SquareArrowOutUpRight className="h-4 w-4" />
              )}
            </Button>
          )}
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="shrink-0 h-8 w-8 text-green-500 hover:text-green-600"
              title="Close"
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick chat buttons when no messages */}
      {showQuickButtons && !isLoading && (
        <QuickChatButtons 
          onQuickMessage={handleQuickMessage}
          className="py-4"
        />
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-3">
          {/* Load more button */}
          {hasMore && messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className="self-center mb-2"
            >
              {isLoadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ChevronUp className="h-4 w-4 mr-2" />
              )}
              Load older messages
            </Button>
          )}

          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            messages.map((message, index) => {
              const messageDate = new Date(message.created_at);
              const previousDate = index > 0
                ? new Date(messages[index - 1].created_at)
                : null;
              const showDivider = shouldShowDateDivider(messageDate, previousDate);

              return (
                <div key={message.id}>
                  {showDivider && <MessageDateDivider date={messageDate} />}
                  <ChatMessageBubble
                    message={message}
                    isOwn={message.sender_id === currentUserId}
                    isAgent={false}
                  />
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          <TypingIndicator 
            userName="IT Helpdesk" 
            isVisible={!!typingUser} 
          />

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={isSending}
        placeholder="Message IT Helpdesk..."
      />
    </div>
  );
}
