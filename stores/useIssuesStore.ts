import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createTask } from '@/services/taskService'
import { logger } from '@/lib/logger'
import { TaskStatusType } from '@/lib/taskStatusIdProvider'
import { useSessionStore } from '@/stores/useSessionStore'
import { getClients } from '@/services/clientService'
import { getUsers } from '@/services/userService'

interface Issue {
  summary: string
  description: string
}

interface IssueConfig {
  clientId: number | null
  userId: number | null
  agentId: number | null
  isInitialized: boolean
  isInitializing: boolean
  initError: string | null
}

interface IssuesStore {
  issue: Issue
  config: IssueConfig
  isSubmitting: boolean
  errors: {
    summary?: string
    description?: string
  }
  
  setIssue: (issue: Partial<Issue>) => void
  setSummary: (summary: string) => void
  setDescription: (description: string) => void
  clearErrors: () => void
  setFieldError: (field: keyof Issue, error: string | undefined) => void
  validateIssue: () => boolean
  initializeConfig: () => Promise<void>
  submitIssue: () => Promise<any>
  resetIssue: () => void
}

const initialIssue: Issue = {
  summary: "",
  description: ""
}

const initialConfig: IssueConfig = {
  clientId: null,
  userId: null,
  agentId: null,
  isInitialized: false,
  isInitializing: false,
  initError: null
}

export const useIssuesStore = create<IssuesStore>()(devtools(
  (set, get) => ({
    issue: initialIssue,
    config: initialConfig,
    isSubmitting: false,
    errors: {},
    
    setIssue: (issue) => set((state) => ({ 
      issue: { ...state.issue, ...issue } 
    })),
    
    setSummary: (summary) => set((state) => ({ 
      issue: { ...state.issue, summary },
      errors: { ...state.errors, summary: undefined }
    })),
    
    setDescription: (description) => set((state) => ({ 
      issue: { ...state.issue, description },
      errors: { ...state.errors, description: undefined }
    })),
    
    clearErrors: () => set({ errors: {} }),
    
    setFieldError: (field, error) => {
      const { errors } = get()
      const newErrors = { ...errors }
      
      if (error) {
        newErrors[field] = error
      } else {
        delete newErrors[field]
      }
      
      set({ errors: newErrors })
    },
    
    validateIssue: () => {
      const { issue } = get()
      const errors: { summary?: string; description?: string } = {}
      
      if (!issue.summary?.trim()) {
        errors.summary = 'Summary is required'
      }
      
      if (!issue.description?.trim()) {
        errors.description = 'Description is required'
      }
      
      set({ errors })
      return Object.keys(errors).length === 0
    },
    
    initializeConfig: async () => {
      const { config } = get()
      
      // Don't initialize if already done or in progress
      if (config.isInitialized || config.isInitializing) {
        return
      }
      
      set((state) => ({
        config: { ...state.config, isInitializing: true, initError: null }
      }))
      
      try {
        const currentUser = useSessionStore.getState().user
        if (!currentUser?.id) {
          throw new Error('No authenticated user found')
        }
        
        // Find Yanceyworks client
        const clientsResponse = await getClients({ search: 'Yanceyworks', limit: 1 })
        if (!clientsResponse.data?.list?.length) {
          throw new Error('Yanceyworks client not found')
        }
        const yanceyworksClient = clientsResponse.data.list[0]
        
        // Use current authenticated user
        const currentUserId = currentUser.id
        
        // Find Sandru agent (search by name)
        const sandruResponse = await getUsers({ search: 'sandru', limit: 1 })
        let agentId = currentUser.id // fallback to current user
        
        if (sandruResponse.data?.list?.length) {
          const sandruUser = sandruResponse.data.list[0]
          agentId = sandruUser.id
        } else {
          logger.warn('Sandru user not found, using current user as agent')
        }
        
        set((state) => ({
          config: {
            ...state.config,
            clientId: yanceyworksClient.id,
            userId: currentUserId,
            agentId: agentId,
            isInitialized: true,
            isInitializing: false,
            initError: null
          }
        }))
        
        logger.info('Issue config initialized successfully:', {
          clientId: yanceyworksClient.id,
          userId: currentUserId,
          agentId: agentId
        })
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize config'
        logger.error('Error initializing issue config:', error)
        
        set((state) => ({
          config: {
            ...state.config,
            isInitializing: false,
            initError: errorMessage
          }
        }))
        
        throw error
      }
    },
    
    submitIssue: async () => {
      const { issue, config, validateIssue, initializeConfig } = get()
      
      set({ isSubmitting: true })
      
      try {
        if (!validateIssue()) {
          throw new Error('Please fill in all required fields')
        }
        
        // Initialize config if not already done
        if (!config.isInitialized) {
          await initializeConfig()
        }
        
        const { clientId, userId, agentId } = get().config
        
        if (!clientId || !userId || !agentId) {
          throw new Error('Configuration not properly initialized')
        }
        
        const form_data = {
          summary: issue.summary,
          content: issue.description.replaceAll('"', "'"),
          ticket_type_id: 4, // Project
          priority_id: 2, // Medium
          impact_id: 2, // Multiple Users
          client_id: clientId, // Cached Yanceyworks client ID
          user_id: userId, // Current authenticated user
          site_id: 1, // Office (default)
          category_id: 7, // Request
          subcategory_id: 3, // Check
          ticket_source_id: 5, // Principal Request
          agent_id: agentId, // Cached Sandru or fallback user
          urgency_id: 1,
          status_id: TaskStatusType.New, // New
          date_closed: null,
        }
        
        logger.info('useIssuesStore: submitIssue - form_data:', form_data)
        
        const response = await createTask(form_data)
        if (response.status !== 200) {
          const { data } = response
          throw new Error(JSON.stringify(data))
        }
        
        logger.info('Issue submitted successfully:', response)
        
        // Reset form after successful submission
        set({ 
          issue: initialIssue,
          errors: {},
          isSubmitting: false 
        })
        
        return response.data
      } catch (error) {
        logger.error('Error submitting issue:', error)
        set({ isSubmitting: false })
        throw error
      } finally {
        set({ isSubmitting: false })
      }
    },
    
    resetIssue: () => set({ 
      issue: initialIssue, 
      errors: {}, 
      isSubmitting: false 
    }),
  }),
  { name: 'issues-store' }
))
