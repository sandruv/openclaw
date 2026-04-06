import { create } from 'zustand';
import { AIModel, Message } from '@/types/ai';
import { generateResponse as generateDeepSeekResponse, checkDeepseek } from '@/services/deepseekService';
import type { AIRequest } from '@/types/ai';
import { getErrorMessage } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface DeepSeekStore {
  isLoading: boolean;
  isThinking: boolean;
  error: string | null;
  model: string;
  messages: Message[];
  checkConnection: () => Promise<void>;
  generateResponse: (prompt: string) => Promise<{ message?: string; error?: string; status?: number }>;
  setMessages: (messages: Message[]) => void;
}

export const useDeepseekStore = create<DeepSeekStore>((set, get) => ({
  isLoading: false,
  isThinking: false,
  error: null,
  model: "deepseek-chat",
  messages: [{
    role: 'system' as const,
    content: 'You are a IT Helpdesk.'
  }],

  setMessages: (messages: Message[]) => set({ messages }),

  checkConnection: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await checkDeepseek();
      logger.info('DeepSeek connection check:', response);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logger.error('DeepSeek connection check failed:', error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  generateResponse: async (prompt: string) => {
    const { messages, model } = get();

    const thread = [...messages, {
      role: 'user' as const,
      content: prompt
    }]

    set({ 
      messages: thread,
      isThinking: true, 
      error: null 
    });

    try {
      const response = await generateDeepSeekResponse({ messages: thread });

      if (response.status === 200 && response.data?.message) {
        
        set(() => ({
          messages: [...thread, {
            role: 'assistant',
            content: response.data.message
          }],
          isThinking: false
        }));
        
        return { message: response.data.message, status: response.status };
      }

      set({ isThinking: false });
      return { error: 'No response received' };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ 
        error: errorMessage,
        isThinking: false
      });
      return { error: errorMessage };
    }
  }
}));
