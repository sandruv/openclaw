import { create } from 'zustand';
import { AIModel, AIProvider, Message, TicketAnalysisResponse } from '@/types/ai';
import { DEFAULT_MODELS } from '@/lib/aiProviders';
import { logger } from '@/lib/logger';
import { generateResponse as generateGPTResponse, checkGpt } from '@/services/gptService';
import { generateResponse as generateDeepSeekResponse, checkDeepseek } from '@/services/deepseekService';
import { getErrorMessage } from '@/lib/utils';
import { useGptStore } from './useGptStore';
import { useTaskDetailsStore } from './useTaskDetailsStore';
import { useConvoStore } from './useConvoStore';

interface AIState {
  models: AIModel[];
  selectedModel: string;
  selectedProvider: AIProvider;
  isLoading: boolean;
  isThinking: boolean;
  initializing: boolean;
  error: string | null;
  messages: Message[];
  ticketAnalysis: TicketAnalysisResponse | null;
  setSelectedModel: (modelId: string) => void;
  setSelectedProvider: (provider: AIProvider) => void;
  sendMessage: (input: string) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setAppropriateProvider: () => void;
  analyzeTicket: (summary: string, forceRefresh?: boolean) => Promise<TicketAnalysisResponse>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  models: DEFAULT_MODELS,
  selectedModel: 'deepseek-chat',
  selectedProvider: 'deepseek',
  isLoading: false,
  initializing: true,
  isThinking: false,
  error: null,
  messages: [],
  ticketAnalysis: null,

  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setSelectedModel: (modelId: string) => {
    const model = get().models.find(m => m.id === modelId);
    if (model) {
      set({ 
        selectedModel: modelId,
        selectedProvider: model.provider
      });
    }
  },

  setSelectedProvider: (provider: AIProvider) => {
    set({ selectedProvider: provider });
    // Optionally select the first model from the new provider
    const providerModels = get().models.filter(m => m.provider === provider);
    if (providerModels.length > 0) {
      set({ selectedModel: providerModels[0].id });
    }
  },

  setAppropriateProvider: async () => {
    try {
      // First try Deepseek
      const deepseekResponse = await checkDeepseek();
      
      if (deepseekResponse.status === 200) {
        // Deepseek is working, keep or set it as the provider
        set({ selectedProvider: 'deepseek', selectedModel: 'deepseek-chat' });
        logger.info('Set deepseek as the provider', deepseekResponse);
        return;
      }
      
      logger.warn('Deepseek check failed:', deepseekResponse.message);
      
      // Try OpenAI as fallback
      const gptResponse = await checkGpt();
      
      if (gptResponse.status === 200) {
        set({ selectedProvider: 'openai', selectedModel: 'gpt-3.5-turbo' });
        logger.info('Set openai as the provider', gptResponse);
        return;
      }
      
      // Both services failed
      logger.info('Both AI providers are unavailable');
      throw new Error('No AI provider available');
      
    } catch (error) {
      logger.info('Error checking providers:', error);
      // Default to OpenAI if checks fail
      set({ error: getErrorMessage(error) });
    }
  },

  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  addMessage: (message: Message) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },

  analyzeTicket: async (summary: string, forceRefresh = false) => {
    set({ initializing: true, error: null });

    // Get ticket id from ticket details store
    const task = useTaskDetailsStore.getState().task;
    const taskId = task?.id || 'no-id';

    // Check localStorage cache first (skip if forceRefresh is true)
    const cacheKey = `ticket-analysis-${taskId}-${summary.slice(0, 50)}`; // Use ticket id and first 50 chars of summary as key
    const cachedResult = !forceRefresh && localStorage.getItem(cacheKey);
    
    if (cachedResult) {
      try {
        const parsedCache = JSON.parse(cachedResult);
        set({ 
          initializing: false, 
          isThinking: false,
          ticketAnalysis: parsedCache
        });
        return parsedCache;
      } catch (error) {
        // If cache is invalid, remove it
        localStorage.removeItem(cacheKey);
      }
    }

    const prompt = `
      Analyze this support ticket:
      Summary: ${summary}

      Your response should be strictly in the following JSON format that starts with:
      {
        "analysis": "A brief analysis of the issue in markdown format",
        "steps": "Suggested next steps in markdown format",
        "links": "Related links in markdown format"
      }
    `;

    const messages: Message[] = [
      {
        role: 'system' as const,
        content: 'You are a IT Helpdesk.',
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    set({ isThinking: true, error: null });

    try {
      // First try Deepseek then gpt
      let response;
      try {
        response = await generateDeepSeekResponse({ messages });
      } catch (error) {
        logger.error('Error generating DeepSeek response:', error);
        set({ selectedProvider: 'openai', selectedModel: 'gpt-3.5-turbo' });
        response = await generateGPTResponse({ messages, model: 'gpt-3.5-turbo' });
      } 

      logger.info('AIStore analyzeTicket:', response.data);
      
      let parsedMessage;
      try {
        // Extract JSON part from the response
        const jsonRegex = /\{[\s\S]*\}/;
        const jsonMatch = response.data.message.match(jsonRegex);
        
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        
        // Parse the extracted JSON
        parsedMessage = JSON.parse(jsonMatch[0]);
        
        // Ensure we preserve any markdown formatting in the response fields
        parsedMessage = {
          analysis: parsedMessage.analysis?.trim() || '',
          steps: parsedMessage.steps?.trim() || '',
          links: parsedMessage.links?.trim() || '',
        };
      } catch (parseError) {
        logger.error('Failed to parse AI response:', parseError);
        logger.error('Response content:', response.data.message);
        throw new Error('Invalid response format from AI service');
      }

      if (!parsedMessage || typeof parsedMessage !== 'object') {
        throw new Error('Invalid response structure from AI service');
      }

      const result = {
        message: response.data.message,
        analysis: parsedMessage.analysis || '',
        steps: parsedMessage.steps || '',
        links: parsedMessage.links || '',
      };

      // Cache the successful result
      localStorage.setItem(cacheKey, JSON.stringify(result));

      set({ 
        initializing: false, 
        isThinking: false,
        ticketAnalysis: result
      });
      
      return result;
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logger.error('Error analyzing ticket:', error);

      set({ 
        error: errorMessage, 
        initializing: false, 
        isThinking: false,
        ticketAnalysis: null
      });
      
      return {
        message: '',
        error: errorMessage,
      };
    }
  },

  sendMessage: async (input: string) => {
    logger.info('Sending message:', input);
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    const convoStore = useConvoStore.getState();
    
    // Create a new conversation if none is active
    if (!convoStore.activeConversationId) {
      logger.info('Creating new conversation');
      convoStore.createNewConversation();
    }
    
    get().addMessage(userMessage);
    convoStore.saveConversation(get().messages);
    set({ isThinking: true, error: null });

    logger.info('thinking:', get().messages);

    try {
      logger.info('AIStore sendMessage:', userMessage);
      let response;
      // Try Deepseek first
      try {
        response = await generateDeepSeekResponse({
          messages: get().messages,
        });
      } catch (deepseekError) {
        logger.warn('Deepseek failed, falling back to GPT:', deepseekError);
        // Fall back to GPT if Deepseek fails
        response = await generateGPTResponse({
          messages: get().messages
        });
      }

      const assistantMessage = {
        role: 'assistant' as const,
        content: response.data.message
      };

      logger.info('Assistant response:', assistantMessage);
      get().addMessage(assistantMessage);
      convoStore.saveConversation(get().messages);
      set({ isThinking: false });
      
    } catch (error) {
      logger.error('Error in both Deepseek and GPT:', error);
      const errorMessage = getErrorMessage(error);
      
      get().addMessage({
        role: 'assistant',
        content: errorMessage
      });
      convoStore.saveConversation(get().messages);

      set({
        isThinking: false,
        error: errorMessage
      });
    }
  },
}));
