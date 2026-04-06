// ================================
// Chat Types - Centralized definitions matching database schema
// ================================

// ================================
// Core Entity Types
// ================================

export type ChatSenderRole = 'agent' | 'client' | 'system';
export type ChatChannel = 'chat' | 'sms';
export type ChatConversationStatus = 'active' | 'archived' | 'closed';
export type ChatMessageType = 'text' | 'file' | 'system';
export type ChatMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatUser {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role_id: number;
}

export interface ChatClient {
  id: number;
  name: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  sender_role: ChatSenderRole;
  content: string;
  message_type: ChatMessageType;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  status: ChatMessageStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  sender?: ChatUser | null;
}

export interface ChatConversation {
  id: number;
  channel: ChatChannel;
  client_id: number;
  client_user_id: number;
  phone_number?: string | null;
  status: ChatConversationStatus;
  last_message_at?: string | null;
  created_at: string;
  updated_at: string;
  client: ChatClient;
  client_user: ChatUser;
  messages?: ChatMessage[];
  unread_count?: number;
  last_message?: ChatMessage;
}

export interface ChatUnreadStatus {
  id: number;
  conversation_id: number;
  user_id: number;
  last_read_at: string;
  unread_count: number;
}

// ================================
// Request/Response Types
// ================================

export interface CreateConversationData {
  clientUserId: number;
  channel?: ChatChannel;
  phoneNumber?: string;
}

export interface SendMessageData {
  content: string;
  messageType?: ChatMessageType;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface UpdateConversationData {
  status?: ChatConversationStatus;
}

export interface ConversationListParams {
  channel?: ChatChannel;
  status?: ChatConversationStatus;
  page?: number;
  limit?: number;
}

export interface MessageListParams {
  cursor?: number; // Last message ID for cursor-based pagination
  limit?: number;
}

export interface ConversationListResponse {
  conversations: ChatConversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessageListResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: number;
}

export interface TypingIndicatorData {
  isTyping: boolean;
}

// ================================
// UI State Types
// ================================

export interface ChatState {
  isOpen: boolean;
  activeConversationId: number | null;
  conversations: ChatConversation[];
  messages: Record<number, ChatMessage[]>; // keyed by conversationId
  currentUserId: number | null;
  isAgent: boolean;
}

// ================================
// Pusher Event Types
// ================================

export interface ChatMessageEvent {
  conversationId: number;
  message: ChatMessage;
}

export interface ChatTypingEvent {
  conversationId: number;
  userId: number;
  userName: string;
  isTyping: boolean;
}

export interface ChatNewConversationEvent {
  conversation: ChatConversation;
}
