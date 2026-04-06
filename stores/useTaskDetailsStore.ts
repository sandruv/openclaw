import { create } from 'zustand'
import { Task, Status, Tier, ActivityType, TaskAction, TaskUpdateFormData } from '@/types/tasks'
import { getTask, getStatuses, getTiers, updateTask } from '@/services/taskService'
import { CreateTask } from '@/types/newTask'
import { createActivity as createActivityService } from '@/services/taskActivityService'
import { logger } from '@/lib/logger'
import { localStorageService } from '@/services/localStorageService'
import { getErrorMessage } from '@/lib/utils'
import { unmergeTasks } from '@/services/bulkActionService'
import { Message } from '@/types/ai'
import AISdkService from '@/services/aiSdkService'

interface TaskDetailsStore {
  task: Task | null
  statuses: Status[]
  tiers: Tier[]
  activityType: ActivityType[]
  isLoading: boolean
  isNavigating: boolean
  error: Error | null
  timer: number
  isTimerRunning: boolean
  currentAction: TaskAction
  // Conversation state for InteractTab
  interactMessages: Message[]
  interactIsThinking: boolean
  interactIsStreaming: boolean
  interactCurrentMessage: string
  interactError: string | null
  setCurrentAction: (action: TaskAction) => void
  getTaskById: (id: string, isUpdate?: boolean) => Promise<any>
  fetchStatuses: () => Promise<void>
  fetchTiers: () => Promise<void>
  clearError: () => void
  unmergeChildTicket: (childTicketId: string) => Promise<{ success: boolean, error: string | null }>
  createActivity: (data: any, is_email?: boolean) => Promise<{ success: boolean, error: string | null }>
  updateTask: (data: Partial<CreateTask>) => Promise<void>
  startTimer: () => void
  stopTimer: () => void
  loadTimer: () => void
  saveTimer: (timer: number) => void
  // Conversation methods for InteractTab
  addInteractMessage: (message: Message) => void
  setInteractMessages: (messages: Message[]) => void
  loadInteractConversation: () => void
  clearInteractMessages: () => void
  generateInteractResponse: (messages: Message[]) => Promise<void>
}

interface ActivityFormData {
  content: string
  activity_type_id: number
  status_id?: number
  agent_id?: number
  assigned_to?: number
  email_to?: string[]
  email_cc?: string[]
  attachments?: File[]
  date_start: Date
  date_end: Date
  time_elapse?: number
  ticket_id?: number
}

export const useTaskDetailsStore = create<TaskDetailsStore>((set, get) => ({
  task: null,
  statuses: [],
  tiers: [],
  activityType: [],
  isLoading: false,
  isNavigating: false,
  error: null,
  timer: 0,
  isTimerRunning: false,
  currentAction: TaskAction.Viewing,
  // Conversation state for InteractTab
  interactMessages: [],
  interactIsThinking: false,
  interactIsStreaming: false,
  interactCurrentMessage: '',
  interactError: null,
  setCurrentAction: (action: TaskAction) => {
    logger.debug('./useTicketDetailsStore: (setCurrentAction)', action)
    set({ currentAction: action })
  },
  getActivityType: async () => {
    try {
      // set({ isLoading: true, error: null })
      // const response = await getActivityType()
      // if (response.status === 200 && response.data) {
      //   set({ activityType: response.data })
      // } else {
      //   throw new Error(response.message || 'Failed to fetch activity types')
      // }
      const data = [
        { id: 1, name: 'Triage' },
        { id: 2, name: 'Private Note' },
        { id: 3, name: 'User Email' },
        { id: 4, name: 'Client Response'  },
        { id: 5, name: 'Resolve' }
      ]
      set({ activityType: data })
    } catch (err) {
      set({ error: err as Error })
      logger.error('Error fetching activity types:', err)
    } finally {
      set({ isLoading: false })
    }
  },
  getTaskById: async (id: string, isUpdate: boolean = false) => {
    logger.info('./useTicketDetailsStore: (getTaskById)', id, isUpdate ? '(update)' : '')
    const currentTask = get().task
    // isUpdate = true means silent refresh (from Pusher events), no loading states
    // isNavigating = switching between tasks (different task id)
    const isNavigating = !isUpdate && currentTask !== null && currentTask.id !== Number(id)
    const isInitialLoad = !isUpdate && currentTask === null
    
    try {
      if (!isUpdate) {
        set({ 
          isLoading: isInitialLoad, // Only show full loading on initial load
          isNavigating: isNavigating, // Show navigation loading when switching between tasks
          error: null, 
          currentAction: TaskAction.Viewing 
        })
      }
      const response = await getTask(id)
      if (response.status === 200 && response.data) {
        set({ task: response.data })
      } else {
        throw new Error(response.message || 'Failed to fetch ticket')
      }

      return response
    } catch (err) {
      set({ error: err as Error })
      logger.error('Error fetching ticket:', err)
      return err
    } finally {
      if (!isUpdate) {
        set({ isLoading: false, isNavigating: false })
      }
    }
  },
  fetchStatuses: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await getStatuses()
      if (response.status === 200 && response.data) {
        // Filter out "Assigned" status - it's automatically set on reassignment
        const filteredStatus = ["Assigned", "New"]
        const filteredStatuses = response.data.filter(status => !filteredStatus.includes(status.name))
        set({ statuses: filteredStatuses })
      } else {
        throw new Error(response.message || 'Failed to fetch statuses')
      }
    } catch (err) {
      set({ error: err as Error })
      logger.error('Error fetching statuses:', err)
    } finally {
      set({ isLoading: false })
    }
  },
  fetchTiers: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await getTiers()
      if (response.status === 200 && response.data) {
        set({ tiers: response.data })
      } else {
        throw new Error(response.message || 'Failed to fetch tiers')
      }
    } catch (err) {
      set({ error: err as Error })
      logger.error('Error fetching tiers:', err)
    } finally {
      set({ isLoading: false })
    }
  },
  clearError: () => set({ error: null }),
  unmergeChildTicket: async (childTicketId: string) => {
    const currentTask = get().task
    if (!currentTask) {
      logger.error('No task selected')
      return {
        success: false,
        error: 'No task selected'
      }
    }
  
    try {
      set({ isLoading: true, error: null })
      
      const response = await unmergeTasks({
        masterTaskId: currentTask.id,
        childTicketIds: childTicketId
      })
      
      if (response.status !== 200) {
        throw new Error(response.message || 'Failed to unmerge child ticket')
      }
  
      // Refresh the current task to update child tickets list
      await get().getTaskById(currentTask.id.toString())
      
      return {
        success: true,
        error: null
      }
    } catch (err) {
      set({ error: err as Error })
      logger.error('Error unmerging child ticket:', err)
      return {
        success: false,
        error: getErrorMessage(err)
      }
    } finally {
      set({ isLoading: false })
    }
  },
  createActivity: async (data: ActivityFormData, is_email = false) => {
    let assigned_agent_id = 0;
    const currentTask = get().task

    if (!currentTask) {
      logger.error('No task selected')
      return {
        success: false,
        error: 'No task selected'
      }
    }

    try {
      set({ isLoading: true, error: null })
      
      // Test storage connection first if files are attached
      if(data.attachments && data.attachments.length > 0) {
        console.log("Testing storage connection before activity creation...")
        const connectionTest = await localStorageService.testConnection();
        
        if (!connectionTest.connected) {
          logger.error(`Storage connection test failed: ${connectionTest.message}`);
          throw new Error(`Storage connection failed: ${connectionTest.message}. Cannot create activity with attachments.`);
        }
        console.log("Storage connection test successful, proceeding with activity creation")
      }
      
      // Handle agent reassignment for user email activities
      if(data.activity_type_id === 3 && data.assigned_to) {
        assigned_agent_id = Number(data.assigned_to)
        delete data.assigned_to
      }

      console.log('Test - activity_type_id', data.activity_type_id)
      // Create FormData for all requests
      const formData = new FormData();
      formData.append('assigned_agent_id', assigned_agent_id.toString());
      formData.append('activity_type_id', data.activity_type_id.toString());
      
      // Add all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments' && value) {
          // Handle attachments separately
          value.forEach((file: File, index: number) => {
            formData.append(`attachments[${index}]`, file);
          });
        } 
        else if (key === 'email_to' && value) {
          value.forEach((email: string, index: number) => {
            formData.append(`email_to[${index}]`, email);
          });
        } else if (key === 'email_cc' && value) {
          value.forEach((email: string, index: number) => {
            formData.append(`email_cc[${index}]`, email);
          });
        }
        else {
          formData.append(key, value);
        }
      });

      // Add ticket_id
      formData.append('ticket_id', currentTask.id.toString());

      const response = await createActivityService({
        data: formData,
        isEmail: is_email
      })
      
      console.log("Created activity:", response)
      if (response.status !== 200) {
        const errorMessage = `Failed to create ${is_email ? 'email' : 'regular'} activity`
        throw new Error(response.message || errorMessage)
      }

      // Upload files if provided
      if(data.attachments && data.attachments.length > 0) {
        
        console.log("Uploading to local storage...")
        try {
          const uploadResponse = await localStorageService.uploadFiles(
            data.attachments, 
            response.data.id, 
            currentTask.id
          );
          
          console.log("Uploaded to storage:", uploadResponse);
          // File updates will be handled by the Pusher event system
          // No need to call getTaskById() here as it causes duplicate updates
        } catch (uploadError) {
          const errorMsg = `File upload failed: ${getErrorMessage(uploadError)}`;
          logger.error(errorMsg);
          console.error('Files could not be uploaded:', uploadError);
        }
      }

      // No longer need to refresh ticket data manually
      // The Pusher 'task:update' event with action 'file_update' will handle this
      return {
        success: true,
        error: null
      }
    } catch (err) {
      set({ error: err as Error })
      // logger.error('useTaskDetailsStore: (createActivity) Error creating activity:', err)
      return {
        success: false,
        error: getErrorMessage(err)
      }
    } finally {
      set({ isLoading: false })
    }
  },
  updateTask: async (data) => {
    const currentTask = get().task
    if (!currentTask) {
      logger.error('No task selected')
      return
    }

    // Add ticket_id to data if no ticket id
    if (!data.id) {
      data.id = currentTask.id
    }

    try {
      set({ isLoading: true, error: null })
      const response = await updateTask(data)
      
      if (response.status !== 200) {
        throw new Error(response.message || 'Failed to update task')
      }

      // Refresh ticket data - not necessary because of the socket event
      // await get().getTaskById(currentTask.id.toString())
    } catch (err) {
      set({ error: err as Error })
      logger.error('Error updating task:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  startTimer: () => {
    const { task } = get()
    if (task?.id) {
      set({ isTimerRunning: true })
      localStorage.setItem(`task_timer_running_${task.id}`, 'true')
    }
  },
  stopTimer: () => {
    const { task, saveTimer } = get()
    if (task?.id) {
      set({ isTimerRunning: false })
      localStorage.setItem(`task_timer_running_${task.id}`, 'false')
    }
  },
  loadTimer: () => {
    const { task } = get()
    if (task?.id) {
      const savedTimer = localStorage.getItem(`task_timer_${task.id}`)
      const savedIsRunning = localStorage.getItem(`task_timer_running_${task.id}`)
      if (savedTimer) {
        set({ 
          timer: parseInt(savedTimer, 10),
          isTimerRunning: savedIsRunning === 'true'
        })
      } else {
        set({ timer: 0, isTimerRunning: true })
      }
    }
  },
  saveTimer: (timer: number) => {
    const { task } = get()
    set({ timer })
    logger.info(`Saving timer for task ${task?.id}: ${timer}`)
    if (task?.id) {
      localStorage.setItem(`task_timer_${task.id}`, timer.toString())
    }
  },
  
  // Conversation methods for InteractTab
  addInteractMessage: (message: Message) => {
    const { task } = get()
    const newMessages = [...get().interactMessages, message]
    set({ interactMessages: newMessages })
    
    // Auto-save to localStorage
    if (task?.id) {
      localStorage.setItem(`interact_conversation_${task.id}`, JSON.stringify(newMessages))
    }
  },
  
  setInteractMessages: (messages: Message[]) => {
    const { task } = get()
    set({ interactMessages: messages })
    
    // Save to localStorage
    if (task?.id) {
      localStorage.setItem(`interact_conversation_${task.id}`, JSON.stringify(messages))
    }
  },
  
  loadInteractConversation: () => {
    const { task } = get()
    if (!task?.id) {
      // Clear messages if no task
      set({ 
        interactMessages: [],
        interactCurrentMessage: '',
        interactError: null,
        interactIsThinking: false,
        interactIsStreaming: false
      })
      return
    }
    
    try {
      const saved = localStorage.getItem(`interact_conversation_${task.id}`)
      if (saved) {
        const messages = JSON.parse(saved) as Message[]
        set({ 
          interactMessages: messages,
          interactCurrentMessage: '',
          interactError: null,
          interactIsThinking: false,
          interactIsStreaming: false
        })
        logger.info(`Loaded ${messages.length} messages for task ${task.id}`)
      } else {
        // Clear messages if no saved conversation exists for this task
        set({ 
          interactMessages: [],
          interactCurrentMessage: '',
          interactError: null,
          interactIsThinking: false,
          interactIsStreaming: false
        })
        logger.info(`No saved conversation for task ${task.id}`)
      }
    } catch (error) {
      logger.error('Error loading interact conversation:', error)
      // Clear messages on error
      set({ 
        interactMessages: [],
        interactCurrentMessage: '',
        interactError: null,
        interactIsThinking: false,
        interactIsStreaming: false
      })
    }
  },
  
  clearInteractMessages: () => {
    const { task } = get()
    set({
      interactMessages: [],
      interactCurrentMessage: '',
      interactError: null,
      interactIsThinking: false,
      interactIsStreaming: false
    })
    
    // Clear from localStorage
    if (task?.id) {
      localStorage.removeItem(`interact_conversation_${task.id}`)
    }
  },
  
  generateInteractResponse: async (messages: Message[]) => {
    const { task } = get()
    if (!task) {
      logger.error('No task available for interact response')
      return
    }

    // Set thinking state IMMEDIATELY (synchronous)
    set({
      interactIsThinking: true,
      interactError: null,
      interactCurrentMessage: '',
      interactIsStreaming: false
    })

    try {
      // Build context with task information
      const systemContext = `You are helping with Task #${task.id}: "${task.summary || 'N/A'}". Provide helpful, specific guidance related to this task.`
      
      const conversationMessages: Message[] = [
        { role: 'assistant', content: systemContext },
        ...messages
      ]

      // Use streaming response from AISdkService
      const responseGenerator = AISdkService.generateResponseStream({
        messages: conversationMessages
      })

      // Set streaming immediately after getting generator
      set({ interactIsStreaming: true })

      let accumulatedResponse = ''
      let lastUpdateTime = 0
      const UPDATE_INTERVAL = 150 // Only update UI every 150ms

      for await (const textChunk of responseGenerator) {
        if (textChunk) {
          const cleanedChunk = textChunk.replace(/^0:"(.*)"$/, '$1')
          const formattedChunk = cleanedChunk
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\r/g, '')
          
          accumulatedResponse += formattedChunk

          // Batch updates - only update UI every UPDATE_INTERVAL ms
          const now = Date.now()
          if (now - lastUpdateTime >= UPDATE_INTERVAL) {
            set({
              interactCurrentMessage: accumulatedResponse,
              interactIsStreaming: true
            })
            lastUpdateTime = now
          }
        }
      }

      // Final update to ensure we have the complete response
      set({
        interactCurrentMessage: accumulatedResponse,
        interactIsStreaming: true
      })

      if (!accumulatedResponse.trim()) {
        throw new Error('No response received from AI')
      }

      // Format final response
      const formattedResponse = accumulatedResponse
        .replace(/([^\n])\n([^\n])/g, '$1\n\n$2')
        .replace(/\n{3,}/g, '\n\n')

      const assistantMessage: Message = {
        role: 'assistant',
        content: formattedResponse
      }

      get().addInteractMessage(assistantMessage)

      set({
        interactIsThinking: false,
        interactIsStreaming: false,
        interactCurrentMessage: accumulatedResponse
      })
    } catch (error: any) {
      logger.error('Error generating interact response:', error)
      const isTokenLimit = error?.code === 'TOKEN_LIMIT_REACHED' || error?.message === 'TOKEN_LIMIT_REACHED'
      const errorMessage = isTokenLimit
        ? 'TOKEN_LIMIT_REACHED'
        : (error instanceof Error ? error.message : 'Unknown error')

      const displayMessage = isTokenLimit
        ? 'You have reached your monthly AI token limit. Please contact your administrator for additional tokens.'
        : `Error: ${errorMessage}`

      const assistantMessage: Message = {
        role: 'assistant',
        content: displayMessage
      }

      get().addInteractMessage(assistantMessage)

      set({
        interactIsThinking: false,
        interactIsStreaming: false,
        interactError: errorMessage,
        interactCurrentMessage: displayMessage
      })
    }
  },
}))
