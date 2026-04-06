import { create } from 'zustand';
import { Message } from '@/types/ai';
import { conversationService } from '@/services/conversationService';
import { logger } from '@/lib/logger';
import { useAISdkStore } from './useAISdkStore';
import { useSessionStore } from './useSessionStore';

interface Conversation {
  id: string;
  ticketId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

interface ConvoState {
  activeConversationId: string | null;
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  createNewConversation: (ticketId?: string) => string | null;
  loadConversation: (conversationId: string) => void;
  saveConversation: (messages: Message[]) => void;
  loadAllConversations: () => void;
  togglePin: (conversationId: string) => void;
}

export const useConvoStore = create<ConvoState>((set, get) => ({
  activeConversationId: null,
  conversations: [],
  isLoading: false,
  error: null,

  loadAllConversations: () => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) {
      logger.warn('No user ID available for loading conversations');
      return;
    }

    try {
      set({ isLoading: true });
      const convos = conversationService.getAllConversations(userId.toString());
      set({ conversations: convos, isLoading: false });
      logger.info('Loaded conversations:', convos.length);
    } catch (error) {
      logger.error('Error loading conversations:', error);
      set({ error: 'Failed to load conversations', isLoading: false });
    }
  },

  createNewConversation: (ticketId?: string) => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) {
      logger.warn('No user ID available for creating conversation');
      return null;
    }

    try {
      const newConvo = conversationService.createConversation(userId.toString(), ticketId);
      set(state => ({ 
        activeConversationId: newConvo.id,
        conversations: [newConvo, ...state.conversations]
      }));
      useAISdkStore.getState().setMessages([]);
      logger.info('Created new conversation:', { id: newConvo.id, ticketId });
      return newConvo.id;
    } catch (error) {
      logger.error('Error creating conversation:', error);
      set({ error: 'Failed to create conversation' });
      return null;
    }
  },

  loadConversation: (conversationId: string) => {
    const userId = useSessionStore.getState().user?.id;
    if (!userId) {
      logger.warn('No user ID available for loading conversation');
      return;
    }

    try {
      set({ isLoading: true });
      const conversation = conversationService.getConversation(userId.toString(), conversationId);
      if (conversation) {
        set({ activeConversationId: conversationId, isLoading: false });
        useAISdkStore.getState().setMessages(conversation.messages);
        logger.info('Loaded conversation:', { id: conversationId });
      } else {
        set({ error: 'Conversation not found', isLoading: false });
      }
    } catch (error) {
      logger.error('Error loading conversation:', error);
      set({ error: 'Failed to load conversation', isLoading: false });
    }
  },

  saveConversation: (messages: Message[]) => {
    const userId = useSessionStore.getState().user?.id;
    const { activeConversationId, conversations } = get();
    
    if (!userId || !activeConversationId || messages.length === 0) {
      logger.warn('Missing required data for saving conversation:', {
        userId,
        conversationId: activeConversationId,
        messagesCount: messages.length
      });
      return;
    }

    try {
      const lastMessage = messages[messages.length - 1];
      const success = conversationService.updateConversation(
        userId.toString(),
        activeConversationId,
        lastMessage
      );

      if (success) {
        // Update the conversations array
        const updatedConversations = conversations.map(conv => 
          conv.id === activeConversationId 
            ? { ...conv, messages, updatedAt: new Date().toISOString() }
            : conv
        );
        set({ conversations: updatedConversations });
        logger.info('Saved conversation:', {
          userId,
          conversationId: activeConversationId,
          messageCount: messages.length
        });
      } else {
        throw new Error('Failed to update conversation');
      }
    } catch (error) {
      logger.error('Error saving conversation:', error);
      set({ error: 'Failed to save conversation' });
    }
  },

  togglePin: (conversationId: string) => {
    const userId = useSessionStore.getState().user?.id;
    const { conversations } = get();
    
    if (!userId) {
      logger.warn('No user ID available for toggling pin');
      return;
    }

    try {
      const success = conversationService.togglePin(userId.toString(), conversationId);
      
      if (success) {
        // Update the conversations array
        const updatedConversations = conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, isPinned: !conv.isPinned }
            : conv
        );
        set({ conversations: updatedConversations });
        logger.info('Toggled pin for conversation:', { conversationId });
      } else {
        throw new Error('Failed to toggle pin');
      }
    } catch (error) {
      logger.error('Error toggling pin:', error);
      set({ error: 'Failed to toggle pin' });
    }
  }
}));
