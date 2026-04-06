import { create } from 'zustand';
import {
  ChatConversation,
  ChatMessage,
  ChatMessageEvent,
  ChatNewConversationEvent,
  ChatTypingEvent,
} from '@/types/chat';
import { chatService } from '@/services/chatService';

// ================================
// Store State Interface
// ================================

// Online user info from presence channel
export interface OnlineUser {
  id: number;
  name: string;
  email?: string;
  roleId?: number;
}

interface ChatStoreState {
  // UI State
  isOpen: boolean;
  activeConversationId: number | null;
  
  // Data
  conversations: ChatConversation[];
  messages: Record<number, ChatMessage[]>; // keyed by conversationId
  
  // User context
  currentUserId: number | null;
  isAgent: boolean;
  
  // Loading states
  isInitialized: boolean;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Typing indicators
  typingUsers: Record<number, { userId: number; userName: string; timeout: NodeJS.Timeout }>;
  
  // Online status
  onlineUsers: Map<number, OnlineUser>;
}

interface ChatStoreActions {
  // Initialization
  initializeChat: (userId: number, roleId: number) => Promise<void>;
  
  // Panel state
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  
  // Conversations
  fetchConversations: () => Promise<void>;
  getOrCreateConversation: (clientUserId: number) => Promise<ChatConversation | null>;
  setActiveConversation: (conversationId: number | null) => void;
  openConversation: (conversationId: number) => Promise<void>;
  
  // Messages
  fetchMessages: (conversationId: number, cursor?: number) => Promise<{ hasMore: boolean; nextCursor?: number }>;
  sendMessage: (conversationId: number, content: string, fileData?: {
    messageType?: 'text' | 'file';
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  }) => Promise<ChatMessage | null>;
  
  // Real-time events (from Pusher)
  receiveMessage: (event: ChatMessageEvent) => void;
  receiveNewConversation: (event: ChatNewConversationEvent) => void;
  handleTypingEvent: (event: ChatTypingEvent) => void;
  
  // Read status
  markAsRead: (conversationId: number) => Promise<void>;
  
  // Data access
  getConversation: (conversationId: number) => ChatConversation | undefined;
  getMessages: (conversationId: number) => ChatMessage[];
  getTotalUnreadCount: () => number;
  getClientConversationId: () => number | null;
  
  // Typing indicators
  sendTypingIndicator: (conversationId: number, isTyping: boolean) => void;
  getTypingUser: (conversationId: number) => string | null;
  
  // Online status
  setOnlineUsers: (users: OnlineUser[]) => void;
  addOnlineUser: (user: OnlineUser) => void;
  removeOnlineUser: (userId: number) => void;
  isUserOnline: (userId: number) => boolean;
  
  // Helpers
  getUserDisplayName: (user: ChatConversation['client_user'] | null) => string;
  getChatChannelName: (conversationId: number) => string;
}

export const useChatStore = create<ChatStoreState & ChatStoreActions>(
  (set, get) => ({
    // ================================
    // Initial State
    // ================================
    isOpen: false,
    activeConversationId: null,
    conversations: [],
    messages: {},
    currentUserId: null,
    isAgent: false,
    isInitialized: false,
    isLoading: false,
    isSending: false,
    error: null,
    typingUsers: {},
    onlineUsers: new Map(),

    // ================================
    // Initialization
    // ================================
    initializeChat: async (userId, roleId) => {
      const isAgent = roleId === 1 || roleId === 3;
      console.log('[Chat] Initializing:', { userId, roleId, isAgent });
      
      set({
        currentUserId: userId,
        isAgent,
        isInitialized: true,
        error: null,
      });
      
      // Fetch existing conversations
      await get().fetchConversations();
    },

    // ================================
    // Panel State
    // ================================
    toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
    openChat: () => set({ isOpen: true }),
    closeChat: () => set({ isOpen: false, activeConversationId: null }),

    // ================================
    // Conversations
    // ================================
    fetchConversations: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await chatService.getConversations({ status: 'active' });
        
        if (response.status === 200 && response.data) {
          set({ conversations: response.data.conversations });
          console.log('[Chat] Fetched conversations:', response.data.conversations);
        } else {
          set({ error: response.message || 'Failed to fetch conversations' });
        }
      } catch (error) {
        console.error('[Chat] Error fetching conversations:', error);
        set({ error: 'Failed to fetch conversations' });
      } finally {
        set({ isLoading: false });
      }
    },

    getOrCreateConversation: async (clientUserId) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await chatService.getOrCreateConversation({ clientUserId });
        
        if ((response.status === 200 || response.status === 201) && response.data) {
          const conversation = response.data;
          
          // Add to conversations if not exists
          set((state) => {
            const exists = state.conversations.some(c => c.id === conversation.id);
            if (!exists) {
              return { conversations: [conversation, ...state.conversations] };
            }
            return state;
          });
          
          console.log('[Chat] Got/created conversation:', conversation.id);
          return conversation;
        } else {
          set({ error: response.message || 'Failed to get/create conversation' });
          return null;
        }
      } catch (error) {
        console.error('[Chat] Error getting/creating conversation:', error);
        set({ error: 'Failed to get/create conversation' });
        return null;
      } finally {
        set({ isLoading: false });
      }
    },

    setActiveConversation: (conversationId) => {
      set({ activeConversationId: conversationId });
    },

    openConversation: async (conversationId) => {
      set({ activeConversationId: conversationId });
      
      // Fetch messages if not already loaded
      const messages = get().messages[conversationId];
      if (!messages || messages.length === 0) {
        await get().fetchMessages(conversationId);
      }
      
      // Mark as read
      await get().markAsRead(conversationId);
    },

    // ================================
    // Messages
    // ================================
    fetchMessages: async (conversationId, cursor) => {
      set({ isLoading: true });
      
      try {
        const response = await chatService.getMessages(conversationId, { cursor, limit: 50 });
        
        if (response.status === 200 && response.data) {
          const { messages: newMessages, hasMore, nextCursor } = response.data;
          
          set((state) => {
            const existingMessages = state.messages[conversationId] || [];
            
            // If cursor provided, prepend (loading older messages)
            // Otherwise, replace (initial load)
            const updatedMessages = cursor
              ? [...newMessages, ...existingMessages]
              : newMessages;
            
            return {
              messages: {
                ...state.messages,
                [conversationId]: updatedMessages,
              },
            };
          });
          
          console.log('[Chat] Fetched messages:', newMessages.length, 'hasMore:', hasMore);
          return { hasMore, nextCursor };
        }
        
        return { hasMore: false };
      } catch (error) {
        console.error('[Chat] Error fetching messages:', error);
        return { hasMore: false };
      } finally {
        set({ isLoading: false });
      }
    },

    sendMessage: async (conversationId, content, fileData) => {
      const state = get();
      if (!state.currentUserId || state.isSending) return null;
      
      set({ isSending: true, error: null });
      
      // Create optimistic message
      const tempId = -Date.now(); // Negative ID for temp
      const optimisticMessage: ChatMessage = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: state.currentUserId,
        sender_role: state.isAgent ? 'agent' : 'client',
        content,
        message_type: fileData?.messageType || 'text',
        file_url: fileData?.fileUrl,
        file_name: fileData?.fileName,
        file_type: fileData?.fileType,
        file_size: fileData?.fileSize,
        status: 'sending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Add optimistic message
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            optimisticMessage,
          ],
        },
      }));
      
      try {
        const response = await chatService.sendMessage(conversationId, {
          content,
          messageType: fileData?.messageType,
          fileUrl: fileData?.fileUrl,
          fileName: fileData?.fileName,
          fileType: fileData?.fileType,
          fileSize: fileData?.fileSize,
        });
        
        if (response.status === 201 && response.data) {
          const realMessage = response.data;
          
          // Replace optimistic message with real one
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: state.messages[conversationId]?.map((msg) =>
                msg.id === tempId ? realMessage : msg
              ) || [realMessage],
            },
            // Update conversation's last message
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? { ...conv, last_message: realMessage, last_message_at: realMessage.created_at }
                : conv
            ),
          }));
          
          console.log('[Chat] Message sent:', realMessage.id);
          return realMessage;
        } else {
          // Mark as failed
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: state.messages[conversationId]?.map((msg) =>
                msg.id === tempId ? { ...msg, status: 'failed' as const } : msg
              ),
            },
            error: response.message || 'Failed to send message',
          }));
          return null;
        }
      } catch (error) {
        console.error('[Chat] Error sending message:', error);
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId]?.map((msg) =>
              msg.id === tempId ? { ...msg, status: 'failed' as const } : msg
            ),
          },
          error: 'Failed to send message',
        }));
        return null;
      } finally {
        set({ isSending: false });
      }
    },

    // ================================
    // Real-time Events
    // ================================
    receiveMessage: (event) => {
      const { conversationId, message } = event;
      const state = get();
      
      console.log('[Chat] Received message:', { conversationId, messageId: message.id });
      
      // Don't add if it's our own message (already added optimistically)
      if (message.sender_id === state.currentUserId) {
        console.log('[Chat] Ignoring own message');
        return;
      }
      
      set((prevState) => {
        // Access control: Only process messages for conversations the user has access to
        const conversation = prevState.conversations.find(c => c.id === conversationId);
        if (!conversation) {
          console.log('[Chat] Received message for unknown/unauthorized conversation, ignoring:', conversationId);
          return prevState;
        }
        
        const existingMessages = prevState.messages[conversationId] || [];
        
        // Check for duplicates
        if (existingMessages.some((m) => m.id === message.id)) {
          return prevState;
        }
        
        const isActiveConversation =
          prevState.activeConversationId === conversationId && prevState.isOpen;
        
        // Update messages
        const updatedMessages = {
          ...prevState.messages,
          [conversationId]: [...existingMessages, message],
        };
        
        // Update conversation
        const updatedConversations = prevState.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message: message,
                last_message_at: message.created_at,
                unread_count: isActiveConversation
                  ? 0
                  : (conv.unread_count || 0) + 1,
              }
            : conv
        );
        
        // Sort by last message
        updatedConversations.sort((a, b) => {
          const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return bTime - aTime;
        });
        
        return {
          messages: updatedMessages,
          conversations: updatedConversations,
        };
      });
    },

    receiveNewConversation: (event) => {
      const { conversation } = event;
      
      set((state) => {
        // Check if already exists
        if (state.conversations.some(c => c.id === conversation.id)) {
          return state;
        }
        
        // Access control: Only add conversation if user should see it
        // Agents (role_id 1 or 2) see all conversations
        // Clients only see their own conversations
        const shouldAddConversation = 
          state.isAgent || 
          conversation.client_user_id === state.currentUserId;
        
        if (!shouldAddConversation) {
          console.log('[Chat] New conversation received but not for current user, ignoring:', conversation.id);
          return state;
        }
        
        console.log('[Chat] New conversation received:', conversation.id);
        return {
          conversations: [conversation, ...state.conversations],
        };
      });
    },

    handleTypingEvent: (event) => {
      const { conversationId, userId, userName, isTyping } = event;
      const state = get();
      
      // Don't show own typing
      if (userId === state.currentUserId) return;
      
      set((prevState) => {
        const typingUsers = { ...prevState.typingUsers };
        
        if (isTyping) {
          // Clear existing timeout
          if (typingUsers[conversationId]) {
            clearTimeout(typingUsers[conversationId].timeout);
          }
          
          // Set new timeout to clear typing after 3s
          const timeout = setTimeout(() => {
            set((s) => {
              const updated = { ...s.typingUsers };
              delete updated[conversationId];
              return { typingUsers: updated };
            });
          }, 3000);
          
          typingUsers[conversationId] = { userId, userName, timeout };
        } else {
          // Clear typing
          if (typingUsers[conversationId]) {
            clearTimeout(typingUsers[conversationId].timeout);
            delete typingUsers[conversationId];
          }
        }
        
        return { typingUsers };
      });
    },

    // ================================
    // Read Status
    // ================================
    markAsRead: async (conversationId) => {
      // Optimistically update
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        ),
      }));
      
      // Call API (fire and forget)
      try {
        await chatService.markAsRead(conversationId);
      } catch (error) {
        console.error('[Chat] Error marking as read:', error);
      }
    },

    // ================================
    // Data Access
    // ================================
    getConversation: (conversationId) =>
      get().conversations.find((c) => c.id === conversationId),

    getMessages: (conversationId) => get().messages[conversationId] || [],

    getTotalUnreadCount: () =>
      get().conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0),

    getClientConversationId: () => {
      const state = get();
      if (!state.isAgent && state.currentUserId) {
        // Find the conversation that belongs to the current client user
        const clientConversation = state.conversations.find(
          (conv) => conv.client_user_id === state.currentUserId
        );
        return clientConversation?.id || null;
      }
      return null;
    },

    // ================================
    // Typing Indicators
    // ================================
    sendTypingIndicator: (conversationId, isTyping) => {
      // Fire and forget
      chatService.sendTypingIndicator(conversationId, { isTyping }).catch(console.error);
    },

    getTypingUser: (conversationId) => {
      const typing = get().typingUsers[conversationId];
      return typing ? typing.userName : null;
    },

    // ================================
    // Online Status
    // ================================
    setOnlineUsers: (users) => {
      const onlineUsers = new Map<number, OnlineUser>();
      users.forEach(user => onlineUsers.set(user.id, user));
      set({ onlineUsers });
      console.log('[Chat] Set online users:', users.length);
    },

    addOnlineUser: (user) => {
      set((state) => {
        const onlineUsers = new Map(state.onlineUsers);
        onlineUsers.set(user.id, user);
        console.log('[Chat] User came online:', user.name);
        return { onlineUsers };
      });
    },

    removeOnlineUser: (userId) => {
      set((state) => {
        const onlineUsers = new Map(state.onlineUsers);
        const user = onlineUsers.get(userId);
        onlineUsers.delete(userId);
        console.log('[Chat] User went offline:', user?.name || userId);
        return { onlineUsers };
      });
    },

    isUserOnline: (userId) => {
      return get().onlineUsers.has(userId);
    },

    // ================================
    // Helpers
    // ================================
    getUserDisplayName: (user) => {
      return chatService.getUserDisplayName(user);
    },

    getChatChannelName: (conversationId) => `private-chat-${conversationId}`,
  })
);
