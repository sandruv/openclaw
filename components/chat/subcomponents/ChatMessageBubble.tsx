'use client';

import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types/chat';
import { chatService } from '@/services/chatService';
import { Check, CheckCheck, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {formatDistanceShort} from '@/lib/dateTimeFormat';
import { FileAttachment } from './FileAttachment';
interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  /** Whether the viewer is an agent (affects how sender names are displayed) */
  isAgent?: boolean;
}

export function ChatMessageBubble({
  message,
  isOwn,
  isAgent = true,
}: ChatMessageBubbleProps) {
  const statusIcon = () => {
    if (!isOwn) return null;

    switch (message.status) {
      case 'sending':
        return <span className="h-3 w-3 animate-pulse rounded-full bg-gray-500/40" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-300" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-300" />;
      default:
        return null;
    }
  };

  // Determine sender display name based on viewer role
  const getSenderLabel = () => {
    if (isOwn) return null; // Don't show label for own messages

    // Client sees all agent messages as "IT Helpdesk"
    if (!isAgent && message.sender_role === 'agent') {
      return 'IT Helpdesk';
    }

    // System messages
    if (message.sender_role === 'system') {
      return 'System';
    }

    // Agents see actual sender names
    return message.sender ? chatService.getUserDisplayName(message.sender) : 'Unknown';
  };

  const senderLabel = getSenderLabel();

  // Get timestamp from created_at
  const timestamp = message.created_at ? new Date(message.created_at) : new Date();
  const timeAndIndicator = function() {
    return <> 
      <div
        className={cn(
          'flex items-end',
          isOwn ? 'justify-end' : 'justify-start'
        )}
      >
        {statusIcon()}
        <span
          className={cn(
            'text-[10px]',
            'text-gray-500'
          )}
        >
          {formatDistanceShort(timestamp)}
        </span>
        
      </div>    
      {message.status === 'failed' && (
        <p className="text-[10px] text-red-200 mt-1">Failed to send</p>
      )}   
    </>
  }
  return (
    <div className={cn('flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex gap-1')}>
        
        {isOwn && timeAndIndicator()}
        {message.message_type !== 'file' && (
          <div
          className={cn(
            'max-w-[300px] rounded-2xl px-3 py-2',
            isOwn
              ? 'bg-green-500 text-white rounded-br-md'
              : 'bg-muted rounded-bl-md',
            message.status === 'failed' && 'opacity-70'
          )}
        >
          {/* Show sender name for incoming messages (agents see client names) */}
          {senderLabel && (
            <p
              className={cn(
                'text-[10px] font-medium mb-0.5',
                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {senderLabel}
            </p>
          )}
          {/* Message content */}
          {message.content && message.message_type === 'text' && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
        )}
        {/* File attachment */}
        {message.message_type === 'file' && message.file_url && message.file_name && (
          <div className={cn("max-w-[250px] bg-transparent")}>
            <FileAttachment
              fileName={message.file_name}
              fileUrl={message.file_url}
              fileType={message.file_type || 'application/octet-stream'}
              fileSize={message.file_size || 0}
            />
          </div>
        )}
        {!isOwn && timeAndIndicator()}
      </div>
      
    </div>
  );
}
