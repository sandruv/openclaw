import { create } from 'zustand'
import AISdkService from '@/services/aiSdkService'
import { AIRequest, AIResponse, Message } from '@/types/ai'
import { useTaskDetailsStore } from './useTaskDetailsStore'
import { useConvoStore } from './useConvoStore'
import { logger } from '@/lib/logger'

interface TicketAnalysis {
  analysis: string;
  steps: string;
  links: string;
  lastActivityId?: number;
  taskId?: number;
}

interface AISDKStore {
  initialize: boolean
  response: AIResponse | null
  analysis: Partial<TicketAnalysis> | null
  isLoading: boolean
  isThinking: boolean
  isStreaming: boolean
  error: string | null
  currentMessage: string
  messages: Message[]
  generateResponse: (request: AIRequest) => Promise<void>
  analyzeTicket: (taskId: number, forceRefresh?: boolean) => Promise<Partial<TicketAnalysis> | null>
  updateAnalysisIncremental: (taskId: number) => Promise<Partial<TicketAnalysis> | null>
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  setThinking: (isThinking: boolean) => void
}

export const useAISdkStore = create<AISDKStore>((set, get) => ({
  initialize: true,
  response: null,
  analysis: null,
  isLoading: false,
  isThinking: false,
  isStreaming: false,
  error: null,
  currentMessage: '',
  messages: [],

  addMessage: (message: Message) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },

  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  setThinking: (isThinking: boolean) => {
    set({ isThinking });
  },

  generateResponse: async (request: AIRequest) => {
    // Immediately set isThinking to true to show the thinking message
    set({ 
      isThinking: true,
      isLoading: true
    });
    
    // If no messages provided in request, use the ones from store
    const messages = request.messages || get().messages;
    if (!messages.length) {
      logger.warn('No messages provided for AI response');
      set({ isThinking: false, isLoading: false });
      return;
    }

    // Get the last user message to add to the store
    const lastUserMessage = messages.find(m => m.role === 'user');
    if (lastUserMessage) {
      // Create a new conversation if none exists
      const convoStore = useConvoStore.getState();
      if (!convoStore.activeConversationId) {
        logger.info('Creating new conversation for AI SDK');
        convoStore.createNewConversation();
      }
      
      // Add the user message to our store
      get().addMessage(lastUserMessage);
      convoStore.saveConversation(get().messages);
    }

    // Reset state before starting, but keep isThinking true
    set({ 
      isStreaming: false,  // Start with streaming false
      error: null, 
      currentMessage: '',
      response: null 
      // Deliberately not changing isThinking here to keep the thinking indicator visible
    });

    try {
      // Use the streaming version of generateResponse
      const responseGenerator = AISdkService.generateResponseStream({
        ...request,
        messages
      });
      
      // Set streaming to true now that we have a generator
      // Keep isThinking true while streaming to show the thinking indicator
      set({ isStreaming: true });
      
      let accumulatedResponse = '';
      let chunkCount = 0;
      
      for await (const textChunk of responseGenerator) {
        // Each chunk now contains only the extracted text content
        if (textChunk) {
          // Clean up any remaining 0: prefixes that might have slipped through
          const cleanedChunk = textChunk.replace(/^0:"(.*)"$/, '$1');
          
          // Process the chunk to handle escape sequences
          const formattedChunk = cleanedChunk
            // Replace literal \n with actual newlines
            .replace(/\\n/g, '\n')
            // Replace literal \t with actual tabs
            .replace(/\\t/g, '\t')
            // Replace literal \r with empty string
            .replace(/\\r/g, '');
          
          accumulatedResponse += formattedChunk;
          chunkCount++;
          
          // Update the UI with each chunk
          set({ 
            currentMessage: accumulatedResponse,
            isStreaming: true
          });
        }
      }
      
      if (!accumulatedResponse.trim()) {
        throw new Error('No response received from AI');
      }
      
      // Create the assistant message and add it to the store
      // Final formatting of the complete response
      const formattedResponse = accumulatedResponse
        // Ensure proper markdown line breaks by replacing single newlines with double newlines where needed
        .replace(/([^\n])\n([^\n])/g, '$1\n\n$2')
        // Remove any excessive newlines (more than 2 in a row)
        .replace(/\n{3,}/g, '\n\n');
        
      const assistantMessage: Message = {
        role: 'assistant',
        content: formattedResponse
      };
      
      get().addMessage(assistantMessage);
      
      // Save the conversation
      const convoStore = useConvoStore.getState();
      convoStore.saveConversation(get().messages);
      
      // Update the store with the final response
      set({ 
        isLoading: false,
        isStreaming: false,
        isThinking: false,  // Set thinking to false when response is complete
        currentMessage: accumulatedResponse,
        response: {
          message: accumulatedResponse,
          status: 'success'
        }
      });
    } catch (error: any) {
      logger.error('Error generating AI SDK response:', error);
      const isTokenLimit = error?.code === 'TOKEN_LIMIT_REACHED' || error?.message === 'TOKEN_LIMIT_REACHED';
      const errorMessage = isTokenLimit
        ? 'TOKEN_LIMIT_REACHED'
        : (error instanceof Error ? error.message : 'Unknown error');

      // Add error message as assistant response
      const displayMessage = isTokenLimit
        ? 'You have reached your monthly AI token limit. Please contact your administrator for additional tokens.'
        : `Error: ${errorMessage}`;
      const assistantMessage: Message = {
        role: 'assistant',
        content: displayMessage
      };

      get().addMessage(assistantMessage);

      // Save the conversation with the error
      const convoStore = useConvoStore.getState();
      convoStore.saveConversation(get().messages);

      set({
        isLoading: false,
        isStreaming: false,
        isThinking: false,
        error: errorMessage,
        response: null,
        currentMessage: displayMessage
      });
    }
  },

  analyzeTicket: async (taskId: number, forceRefresh = false) => {
    set({ 
      initialize: true, 
      error: null,
    })

    // Get task from store to check for cached analysis
    const task = useTaskDetailsStore.getState().task;
    
    // Skip if we already have analysis and not forcing refresh
    if (!forceRefresh && task?.analysis) {
      try {
        const parsedAnalysis = typeof task.analysis === 'string' 
          ? JSON.parse(task.analysis)
          : task.analysis;
          
        set({ 
          isLoading: false, 
          error: null,
          analysis: parsedAnalysis
        });
        return parsedAnalysis;
      } catch (error) {
        logger.error('Error parsing stored analysis:', error);
      }
    }

    set({ 
      isLoading: true, 
      error: null,
    })

    try {
      // Generate the analysis using the AI SDK service - now passes taskId
      const analysisGenerator = AISdkService.analyzeTicket(taskId, 'initial')
      let lastChunk: Partial<TicketAnalysis> = {}

      // Process each chunk of the analysis as it's generated
      for await (const chunk of analysisGenerator) {
        lastChunk = {
          ...lastChunk,
          ...chunk
        }

        set({
          analysis: lastChunk,
          isLoading: true
        })
      }

      // Save the completed analysis to the database
      if (taskId && typeof taskId === 'number') {
        console.log('Saving analysis to database for task:', taskId);
        try {
          const { updateTaskAnalysis } = await import('@/services/taskService');
          await updateTaskAnalysis(taskId, lastChunk, { skipNotification: true });
          
          // Update the task in the task details store with the new analysis
          if (useTaskDetailsStore.getState().task) {
            useTaskDetailsStore.setState({
              task: {
                ...useTaskDetailsStore.getState().task!,
                analysis: JSON.stringify(lastChunk)
              }
            });
          }
          console.log('Analysis saved to database');
        } catch (updateError) {
          logger.error('Failed to save analysis to database:', updateError);
        }
      }

      set({ 
        isLoading: false,
        analysis: lastChunk
      })
      
      return lastChunk;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        analysis: null
      })
      return null;
    }
  },

  updateAnalysisIncremental: async (taskId: number) => {
    // Don't show full loading state for incremental updates
    set({ 
      error: null,
    })

    try {
      console.log(`[AISdkStore] Incremental analysis update for task #${taskId}`);
      
      // Generate incremental analysis using the AI SDK service
      const analysisGenerator = AISdkService.analyzeTicket(taskId, 'incremental')
      let lastChunk: Partial<TicketAnalysis> = {}

      // Process each chunk of the analysis as it's generated
      for await (const chunk of analysisGenerator) {
        lastChunk = {
          ...lastChunk,
          ...chunk
        }

        set({
          analysis: lastChunk,
        })
      }

      // Save the updated analysis to the database
      if (taskId && typeof taskId === 'number') {
        try {
          const { updateTaskAnalysis } = await import('@/services/taskService');
          await updateTaskAnalysis(taskId, lastChunk, { skipNotification: true });
          
          // Update the task in the task details store
          if (useTaskDetailsStore.getState().task) {
            useTaskDetailsStore.setState({
              task: {
                ...useTaskDetailsStore.getState().task!,
                analysis: JSON.stringify(lastChunk)
              }
            });
          }
          console.log('Incremental analysis saved to database');
        } catch (updateError) {
          logger.error('Failed to save incremental analysis:', updateError);
        }
      }

      set({ 
        analysis: lastChunk
      })
      
      return lastChunk;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Incremental analysis failed:', errorMessage);
      set({ 
        error: errorMessage
      })
      return null;
    }
  }
}))
