'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { ChatAvatar } from '../ChatAvatar';
import { ChatMessageBubble } from '../ChatMessageBubble';
import { ChatInput } from '../ChatInput';
import { TypingIndicator } from '../TypingIndicator';
import { MessageDateDivider, shouldShowDateDivider } from '../MessageDateDivider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Loader2, ChevronUp } from 'lucide-react';
import { chatService } from '@/services/chatService';

interface ChatConversationProps {
  conversationId: number;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function HelpdeskChatView({
  conversationId,
  onBack,
  showBackButton = true,
}: ChatConversationProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const {
    getConversation,
    getMessages,
    fetchMessages,
    sendMessage,
    sendTypingIndicator,
    getTypingUser,
    isUserOnline,
    currentUserId,
    isAgent,
    isLoading,
    isSending,
  } = useChatStore();

  const conversation = getConversation(conversationId);
  const messages = getMessages(conversationId);
  const typingUser = getTypingUser(conversationId);
  
  // Check if client is online (for header display)
  const clientOnline = isAgent && conversation?.client_user_id 
    ? isUserOnline(conversation.client_user_id) 
    : false;

  // Auto-scroll to bottom on new messages (only for new messages, not when loading older)
  const prevMessageCount = useRef(messages.length);
  useEffect(() => {
    // Only auto-scroll if we added messages at the end (new messages)
    if (messages.length > prevMessageCount.current && !isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCount.current = messages.length;
  }, [messages, isLoadingMore]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    sendTypingIndicator(conversationId, true);
  }, [conversationId, sendTypingIndicator]);

  // Load more messages (infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const result = await fetchMessages(conversationId, nextCursor);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, fetchMessages, hasMore, isLoadingMore, nextCursor]);

  // Reset pagination when conversation changes
  useEffect(() => {
    setHasMore(true);
    setNextCursor(undefined);
  }, [conversationId]);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  const handleSend = async (content: string, files?: File[]) => {
    // Stop typing indicator
    sendTypingIndicator(conversationId, false);
    
    // If files are attached, upload them first
    if (files && files.length > 0) {
      try {
        console.log('[ChatConversation] Uploading files:', files.length);
        
        // Upload files - response comes directly (not wrapped in data)
        const uploadResult = await chatService.uploadFiles(conversationId, files);
        console.log('[ChatConversation] Upload result:', uploadResult);
        
        // The upload API returns { success, message, files, provider } directly
        const uploadedFiles = (uploadResult as any).files || uploadResult.data?.files;
        console.log('[ChatConversation] Uploaded files:', uploadedFiles);
        
        if (uploadedFiles && uploadedFiles.length > 0) {
          // If there's text content, send it as a separate text message first
          if (content) {
            console.log('[ChatConversation] Sending text message:', content);
            await sendMessage(conversationId, content);
          }
          
          // Send a file message for each uploaded file
          for (const uploadedFile of uploadedFiles) {
            console.log('[ChatConversation] Sending file message:', uploadedFile.fileName);
            const result = await sendMessage(conversationId, uploadedFile.fileName, {
              messageType: 'file',
              fileUrl: uploadedFile.url,
              fileName: uploadedFile.fileName,
              fileType: uploadedFile.fileType,
              fileSize: uploadedFile.fileSize,
            });
            console.log('[ChatConversation] File message sent result:', result);
          }
        } else {
          console.warn('[ChatConversation] No files in upload result');
        }
      } catch (error) {
        console.error('[ChatConversation] File upload failed:', error);
      }
    } else if (content) {
      // Send text message only
      await sendMessage(conversationId, content);
    }
  };

  // Role-based display
  const headerName = isAgent
    ? chatService.getUserDisplayName(conversation.client_user)
    : 'IT Helpdesk';

  const avatarUser = isAgent
    ? conversation.client_user
    : { name: 'IT Helpdesk' };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-background">
        {showBackButton && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <ChatAvatar 
          user={avatarUser} 
          size="sm" 
          showOnlineStatus={isAgent}
          isOnline={clientOnline}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{headerName}</p>
          <p className="text-xs text-muted-foreground">
            {isAgent 
              ? clientOnline 
                ? 'Online' 
                : conversation.client.name
              : 'Available'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollContainerRef}>
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
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              {isAgent
                ? 'No messages yet'
                : 'Start a conversation with IT Helpdesk'}
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
                    isAgent={isAgent}
                  />
                </div>
              );
            })
          )}
          
          {/* Typing indicator */}
          <TypingIndicator userName={typingUser || undefined} isVisible={!!typingUser} />
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={isSending}
        placeholder={
          isAgent
            ? 'Type a message...'
            : 'Message IT Helpdesk...'
        }
      />
    </div>
  );
}
