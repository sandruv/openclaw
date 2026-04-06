import { Message } from '@/types/ai';
import { logger } from '@/lib/logger';

interface Conversation {
  id: string;
  ticketId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

class ConversationService {
  private getStorageKeyPrefix(userId: string): string {
    return `convo-${userId}`;
  }

  private getStorageKey(userId: string, ticketId: string | undefined, id: string): string {
    return `${this.getStorageKeyPrefix(userId)}-${ticketId || '01'}-${id}`;
  }

  private getNextId(userId: string): string {
    const prefix = this.getStorageKeyPrefix(userId);
    const existingKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(prefix))
      .map(key => {
        const parts = key.split('-');
        return parseInt(parts[parts.length - 1], 10);
      })
      .filter(id => !isNaN(id));

    if (existingKeys.length === 0) return '1';
    return (Math.max(...existingKeys) + 1).toString();
  }

  createConversation(userId: string, ticketId?: string): Conversation {
    const id = this.getNextId(userId);
    const conversation: Conversation = {
      id,
      ticketId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const storageKey = this.getStorageKey(userId, ticketId, id);
    localStorage.setItem(storageKey, JSON.stringify(conversation));
    logger.info('Created conversation:', { userId, ticketId, id, storageKey });

    return conversation;
  }

  getAllConversations(userId: string): Conversation[] {
    const prefix = this.getStorageKeyPrefix(userId);
    const conversations: Conversation[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const conversation = JSON.parse(localStorage.getItem(key) || '');
          conversations.push(conversation);
        } catch (error) {
          logger.error('Error parsing conversation:', { key, error });
        }
      }
    }

    // Sort by updatedAt descending (newest first)
    return conversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getConversation(userId: string, id: string): Conversation | null {
    // Search through all keys since we don't know the ticketId
    const prefix = this.getStorageKeyPrefix(userId);
    const key = Object.keys(localStorage).find(k => 
      k.startsWith(prefix) && k.endsWith(`-${id}`)
    );

    if (!key) return null;

    try {
      const conversation = JSON.parse(localStorage.getItem(key) || '');
      return conversation;
    } catch (error) {
      logger.error('Error getting conversation:', { key, error });
      return null;
    }
  }

  updateConversation(userId: string, id: string, message: Message): boolean {
    const conversation = this.getConversation(userId, id);
    if (!conversation) return false;

    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, message],
      updatedAt: new Date().toISOString()
    };

    const key = this.getStorageKey(userId, conversation.ticketId, id);
    localStorage.setItem(key, JSON.stringify(updatedConversation));
    logger.info('Updated conversation:', { userId, id, key });

    return true;
  }

  deleteConversation(userId: string, id: string): boolean {
    const conversation = this.getConversation(userId, id);
    if (!conversation) return false;

    const key = this.getStorageKey(userId, conversation.ticketId, id);
    localStorage.removeItem(key);
    logger.info('Deleted conversation:', { userId, id, key });

    return true;
  }

  deleteAllConversations(userId: string): void {
    const prefix = this.getStorageKeyPrefix(userId);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
    logger.info('Deleted all conversations for user:', userId);
  }

  togglePin(userId: string, id: string): boolean {
    const conversation = this.getConversation(userId, id);
    if (!conversation) return false;

    const updatedConversation = {
      ...conversation,
      isPinned: !conversation.isPinned,
      updatedAt: new Date().toISOString()
    };

    const key = this.getStorageKey(userId, conversation.ticketId, id);
    localStorage.setItem(key, JSON.stringify(updatedConversation));
    logger.info('Toggled pin for conversation:', { userId, id, isPinned: updatedConversation.isPinned });

    return true;
  }
}

export const conversationService = new ConversationService();
