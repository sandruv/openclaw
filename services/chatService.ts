import { apiRequest } from '@/services/api/clientConfig';
import { ApiResponse } from '@/types/api';
import {
  ChatUser,
  ChatMessage,
  ChatConversation,
  ChatUnreadStatus,
  CreateConversationData,
  SendMessageData,
  UpdateConversationData,
  ConversationListParams,
  MessageListParams,
  ConversationListResponse,
  MessageListResponse,
  TypingIndicatorData,
} from '@/types/chat';

// Re-export types for convenience
export type {
  ChatUser,
  ChatMessage,
  ChatConversation,
  ChatUnreadStatus,
  CreateConversationData,
  SendMessageData,
  UpdateConversationData,
  ConversationListParams,
  MessageListParams,
  ConversationListResponse,
  MessageListResponse,
  TypingIndicatorData,
} from '@/types/chat';

// ================================
// Chat Service
// ================================

export const chatService = {
  // ================================
  // Conversations
  // ================================

  /**
   * Get all conversations for the current user
   * Agents see all conversations, clients see only their own
   */
  async getConversations(params: ConversationListParams = {}): Promise<ApiResponse<ConversationListResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params.channel) searchParams.set('channel', params.channel);
    if (params.status) searchParams.set('status', params.status);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `/chat/conversations?${queryString}` : '/chat/conversations';
    
    return apiRequest<ApiResponse<ConversationListResponse>>(url);
  },

  /**
   * Get or create a conversation with a client user
   * If conversation exists, returns it; otherwise creates a new one
   */
  async getOrCreateConversation(data: CreateConversationData): Promise<ApiResponse<ChatConversation>> {
    return apiRequest<ApiResponse<ChatConversation>>('/chat/conversations', {
      method: 'POST',
      data,
    });
  },

  /**
   * Get a specific conversation by ID with recent messages
   */
  async getConversation(conversationId: number): Promise<ApiResponse<ChatConversation>> {
    return apiRequest<ApiResponse<ChatConversation>>(`/chat/conversations/${conversationId}`);
  },

  /**
   * Update conversation status (archive, close, etc.)
   */
  async updateConversation(conversationId: number, data: UpdateConversationData): Promise<ApiResponse<ChatConversation>> {
    return apiRequest<ApiResponse<ChatConversation>>(`/chat/conversations/${conversationId}`, {
      method: 'PUT',
      data,
    });
  },

  // ================================
  // Messages
  // ================================

  /**
   * Get paginated messages for a conversation
   * Uses cursor-based pagination for efficient loading
   */
  async getMessages(conversationId: number, params: MessageListParams = {}): Promise<ApiResponse<MessageListResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params.cursor) searchParams.set('cursor', params.cursor.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString 
      ? `/chat/conversations/${conversationId}/messages?${queryString}` 
      : `/chat/conversations/${conversationId}/messages`;
    
    return apiRequest<ApiResponse<MessageListResponse>>(url);
  },

  /**
   * Send a message to a conversation
   */
  async sendMessage(conversationId: number, data: SendMessageData): Promise<ApiResponse<ChatMessage>> {
    return apiRequest<ApiResponse<ChatMessage>>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      data,
    });
  },

  // ================================
  // File Uploads (Phase 3)
  // ================================

  /**
   * Upload files for a chat conversation
   * Returns uploaded file URLs and metadata
   */
  async uploadFiles(conversationId: number, files: File[]): Promise<ApiResponse<{
    success: boolean;
    message: string;
    files: Array<{
      fileName: string;
      url: string;
      fileSize: number;
      fileType: string;
      blobName?: string;
      localPath?: string;
    }>;
    provider: string;
  }>> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('conversationId', conversationId.toString());

    // apiRequest now auto-detects FormData and handles Content-Type properly
    return apiRequest<ApiResponse<any>>('/chat/upload', {
      method: 'POST',
      data: formData,
    });
  },

  // ================================
  // Typing Indicators (Phase 2)
  // ================================

  /**
   * Send typing indicator for a conversation
   */
  async sendTypingIndicator(conversationId: number, data: TypingIndicatorData): Promise<void> {
    await apiRequest(`/chat/conversations/${conversationId}/typing`, {
      method: 'POST',
      data,
    });
  },

  // ================================
  // Unread Status
  // ================================

  /**
   * Mark a conversation as read for the current user
   */
  async markAsRead(conversationId: number): Promise<ApiResponse<ChatUnreadStatus>> {
    return apiRequest<ApiResponse<ChatUnreadStatus>>(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  },

  /**
   * Get unread count for all conversations
   */
  async getUnreadCounts(): Promise<ApiResponse<{ total: number; byConversation: Record<number, number> }>> {
    return apiRequest<ApiResponse<{ total: number; byConversation: Record<number, number> }>>('/chat/unread');
  },

  // ================================
  // Helper Functions
  // ================================

  /**
   * Get display name for a user
   */
  getUserDisplayName(user: ChatUser | null | undefined): string {
    if (!user) return 'System';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return user.email;
  },

  /**
   * Get initials for avatar display
   */
  getUserInitials(user: ChatUser | null | undefined): string {
    if (!user) return 'S';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.last_name) return user.last_name[0].toUpperCase();
    return user.email[0].toUpperCase();
  },

  /**
   * Format message timestamp for display
   */
  formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  },

  /**
   * Check if user is an agent (role_id 1 or 2)
   */
  isAgent(user: ChatUser | null | undefined): boolean {
    if (!user) return false;
    return user.role_id === 1 || user.role_id === 2;
  },

  /**
   * Get conversation channel display name
   */
  getChannelDisplayName(channel: 'chat' | 'sms'): string {
    return channel === 'sms' ? 'SMS' : 'Chat';
  },

  /**
   * Get status color class
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'archived':
        return 'text-gray-500 dark:text-gray-400';
      case 'closed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  },
};
