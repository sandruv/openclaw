import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { NewTask, NewTaskStore, ValidationErrors, ErrorState } from '@/types/newTask'
import { createTask } from '@/services/taskService'
import { createUser } from '@/services/userService'
import { localStorageService } from '@/services/localStorageService'
import { logger } from '@/lib/logger'
import { TaskStatusType } from '@/lib/taskStatusIdProvider'
import { useSessionStore } from '@/stores/useSessionStore'
import { useUserStore } from '@/stores/useUserStore'
import { validateEmail } from '@/services/userService'

const initialNewTask: NewTask = {
  task: {
    summary: "",
    description: "",
    type: null,
    priority: null,
    impact: null,
    time_of_request: new Date(),
    after_hours: false,
  },
  end_user: {
    client: null,
    user: null,
    site: { label: 'Office', value: 'office' },
    technical_aptitude: 3,
    manual_user: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: ""
    }
  },
  additional: {
    category: null,
    subcategory: null,
    ticket_source: null,
    request_category: null,
    attachments: []
  }
}

export const useNewTaskStore = create<NewTaskStore>()(devtools(
  (set, get) => ({
    newTask: initialNewTask,
    
    // Centralized error state
    errorState: {
      errors: {},
      isValidating: false,
      hasErrors: false
    } as ErrorState,
    
    setNewTask: (task) => set((state) => ({ newTask: { ...state.newTask, ...task } })),
    resetNewTask: () => set({ newTask: initialNewTask, errorState: { errors: {}, isValidating: false, hasErrors: false } }),
    
    // Centralized error management
    setErrors: (errors: ValidationErrors) => {
      const hasErrors = Object.keys(errors).length > 0
      set({ errorState: { errors, isValidating: false, hasErrors } })
    },
    
    setFieldError: (field: keyof ValidationErrors, error: string | undefined) => {
      const { errorState } = get()
      const newErrors = { ...errorState.errors }
      
      if (error) {
        newErrors[field] = error
      } else {
        delete newErrors[field]
      }
      
      const hasErrors = Object.keys(newErrors).length > 0
      set({ errorState: { errors: newErrors, isValidating: errorState.isValidating, hasErrors } })
    },
    
    clearErrors: () => set({ errorState: { errors: {}, isValidating: false, hasErrors: false } }),
    
    setValidating: (isValidating: boolean) => {
      const { errorState } = get()
      set({ errorState: { ...errorState, isValidating } })
    },
    validateManualUser: () => {
      const { newTask } = get()
      const { manual_user } = newTask.end_user
      const errors: ValidationErrors = {}

      if (!manual_user.first_name.trim()) {
        errors.first_name = 'First name is required'
      }
      if (!manual_user.last_name.trim()) {
        errors.last_name = 'Last name is required'
      }
      if (!manual_user.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(manual_user.email)) {
        errors.email = 'Invalid email format'
      }
      if (!manual_user.phone.trim()) {
        errors.phone = 'Phone number is required'
      }
      if (!manual_user.address.trim()) {
        errors.address = 'Address is required'
      }

      return errors
    },
    validateManualUserAsync: async () => {
      const { newTask, validateManualUser, setValidating, setErrors } = get()
        const { manual_user } = newTask.end_user
        
        setValidating(true)
        
        try {
          // First run synchronous validation
          const errors = validateManualUser()
          
          // If email format is valid, check for duplicates
          if (!errors.email && manual_user.email.trim()) {
            try {
              const result = await validateEmail(manual_user.email.trim())
              
              if (result.exists && result.user) {
                errors.email = `Email already exists!`
              }
            } catch (error) {
              logger.error('Email validation error:', error)
              // Don't block form submission if email validation fails
              // errors.email = 'Unable to validate email. Please try again.'
            }
          }
          
          // Update centralized error state
          setErrors(errors)
          return errors
        } finally {
          setValidating(false)
        }
      },
      validateNewTask: () => {
        const { newTask, validateManualUser, setErrors } = get()
        const errors: ValidationErrors = {}

        // Validate end_user
        if (!newTask.end_user.user) {
          // Include specific manual user validation errors instead of generic message
          const manualUserErrors = validateManualUser()
          Object.assign(errors, manualUserErrors)
        }

        if (!newTask.end_user.client) {
            errors.client = 'Client is required'
        }

        // Validate technical aptitude range
        if (newTask.end_user.technical_aptitude < 1 || newTask.end_user.technical_aptitude > 100) {
          errors.technical_aptitude = 'Technical aptitude must be between 1 and 100'
        }

        // Validate task
        if (!newTask.task.type) {
          errors.type = 'Task type is required'
        }

        if (!newTask.task.summary?.trim()) {
          errors.summary = 'Summary is required'
        }

        if (!newTask.task.impact) {
          errors.impact = 'Impact is required'
        }

        if (!newTask.task.description?.trim()) {
          errors.description = 'Description is required'
        }

        if (!newTask.task.priority) {
          errors.priority = 'Priority is required'
        }

        if (!newTask.additional.category) {
          errors.category = 'Category is required'
        }

        // Validate additional
        if (!newTask.additional.ticket_source) {
          errors.ticket_source = 'Ticket source is required'
        }

        // Request category validation
        if (newTask.task.type?.value === 'request' && !newTask.additional.request_category) {
          errors.request_category = 'Request category is required'
        }

        logger.debug("useNewTaskStore: validateNewTask - ", newTask)
        
        // Update centralized error state
        setErrors(errors)
        return errors
      },
      submitNewTask: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { newTask, validateNewTask } = get()
        const errors = { ...validateNewTask() }

        if (Object.keys(errors).length > 0) {
          throw new Error(Object.values(errors).join(', '))
        }

        const content = newTask.task.description.replaceAll("\"", "'")
        const currentUser = useSessionStore.getState().user

        if (!currentUser?.id) {
          throw new Error('No authenticated user found')
        }

        const form_data = {
          summary: newTask.task.summary,
          content: content,
          ticket_type_id: Number(newTask.task.type?.value),
          priority_id: Number(newTask.task.priority?.value),
          impact_id: Number(newTask.task.impact?.value),
          client_id: Number(newTask.end_user.client?.value),
          user_id: Number(newTask.end_user.user?.value),
          site_id: Number(newTask.end_user.site?.value),
          
          category_id: Number(newTask.additional.category?.value),
          subcategory_id: Number(newTask.additional.subcategory?.value),
          ticket_source_id: Number(newTask.additional.ticket_source?.value),
          
          agent_id: currentUser.id,
          urgency_id: 1,
          status_id: TaskStatusType.New,
          date_closed: null,
          
          time_of_request: newTask.task.time_of_request?.toISOString() || null,
          after_hours: newTask.task.after_hours,
        }

        logger.info('useNewTicketStore: submitNewTask - form_data:', form_data)

        try {
          const response = await createTask(form_data)
          if(response.status !== 200) {
            const { data } = response
            throw new Error(JSON.stringify(data))
          }

          logger.info('Task created successfully:', response)

          // Handle file uploads after ticket creation
          const attachments = newTask.additional.attachments
          if (attachments && attachments.length > 0) {
            logger.info(`Uploading ${attachments.length} attachments for ticket ${response.data.id}`, response.data)
            try {              
              // Call uploadFiles with the correct parameters
              const uploadResponse = await localStorageService.uploadFiles(attachments, undefined, response.data.id)
              
              // Check if the upload was successful
              if (uploadResponse && uploadResponse.status === 200) {
                logger.info('Attachments uploaded successfully for ticket:', uploadResponse)
                return {
                  ...response.data,
                  attachments: uploadResponse.data
                }
              } else {
                throw new Error(uploadResponse?.message || 'Upload failed')
              }
            } catch (uploadError) {
              logger.error('Failed to upload attachments:', uploadError)
              // Return ticket data with upload error status
              return {
                ...response.data,
                attachmentError: uploadError instanceof Error ? uploadError.message : 'Failed to upload attachments'
              }
            }
          }

          return response.data
        } catch (error) {
          logger.error('Error submitting task:', error)
          throw error
        }
      },
      createManualUserAndSubmitTask: async () => {
        const { newTask, validateManualUserAsync, validateNewTask } = get()
        const errors = validateNewTask()
        
        if (Object.keys(errors).length > 0) {
          throw new Error(Object.values(errors).join(', '))
        }

        // If no user selected, create a new user first
        if (!newTask.end_user.user) {
          const manualUserErrors = await validateManualUserAsync()
          if (Object.keys(manualUserErrors).length > 0) {
            throw new Error('Manual user information is incomplete: ' + Object.values(manualUserErrors).join(', '))
          }

          try {
            const userStore = useUserStore.getState()
            const { manual_user } = newTask.end_user
            const client_id = newTask.end_user.client?.value

            if (!client_id) {
              throw new Error('Client is required for creating a new user')
            }

            const newUser = await userStore.addUser({
              first_name: manual_user.first_name,
              last_name: manual_user.last_name,
              email: manual_user.email,
              phone_number: manual_user.phone,
              address: manual_user.address,
              client_id: client_id,
              role_id: 2, // Assuming 2 is for end users
              is_user_vip: false,
              sophistication_id: newTask.end_user.technical_aptitude,
              password: '123456' // Default password
            })

            logger.info('New user created:', newUser)

            if (!newUser) {
              throw new Error('Failed to find newly created user')
            }

            // Update the ticket with the new user
            set(state => ({
              newTask: {
                ...state.newTask,
                end_user: {
                  ...state.newTask.end_user,
                  user: {
                    value: String(newUser.id),
                    label: `${newUser.first_name} ${newUser.last_name}`
                  }
                }
              }
            }))
          } catch (error) {
            throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }

        // Now submit the task with the user attached
        return await get().submitNewTask()
      },
    }),
    { name: 'new-task-store' }
  )
)