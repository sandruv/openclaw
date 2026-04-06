import { create } from 'zustand'
import { GPTModel, Message } from '@/types/ai'
import { getModels, generateResponse as generateGPTResponse, checkGpt } from '@/services/gptService'
import { getErrorMessage } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface GptState {
  models: GPTModel[]
  isLoading: boolean
  isThinking: boolean
  error: string | null
  selectedModel: string
  streamingEnabled: boolean
  temperature: number
  maxTokens: number
  messages: Message[]
  checkConnection: () => Promise<void>
  fetchModels: () => Promise<void>
  setSelectedModel: (modelId: string) => void
  setStreamingEnabled: (enabled: boolean) => void
  setTemperature: (temp: number) => void
  setMaxTokens: (tokens: number) => void
  setMessages: (messages: Message[]) => void
  generateResponse: (prompt: string) => Promise<{ message?: string; error?: string; status?: number }>
}

export const useGptStore = create<GptState>((set, get) => ({
  models: [],
  isLoading: false,
  isThinking: false,
  error: null,
  selectedModel: 'gpt-3.5-turbo',
  streamingEnabled: false,
  temperature: 1.3,
  maxTokens: 10000,
  messages: [{
    role: 'system' as const,
    content: 'You are a IT Helpdesk.'
  }],

  checkConnection: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await checkGpt();
      logger.info('GPT connection check:', response);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logger.error('GPT connection check failed:', error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchModels: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await getModels();
      set({ models: response.data, isLoading: false })
    } catch (error) {
      set({ 
        error: getErrorMessage(error),
        isLoading: false 
      })
    }
  },

  setSelectedModel: (modelId: string) => {
    set({ selectedModel: modelId })
  },

  setStreamingEnabled: (enabled: boolean) => {
    set({ streamingEnabled: enabled })
  },

  setTemperature: (temp: number) => {
    set({ temperature: temp })
  },

  setMaxTokens: (tokens: number) => {
    set({ maxTokens: tokens })
  },

  setMessages: (messages: Message[]) => set({ messages }),

  generateResponse: async (prompt: string) => {
    const { selectedModel, messages } = get();

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
      const response = await generateGPTResponse({
          messages: thread, 
          model: selectedModel, 
          temperature: get().temperature, 
          max_tokens: get().maxTokens
        });

      if (response.status === 200 && response.data?.message) {
        
        set(state => ({
          messages: [...state.messages, {
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
}))
