import { logger } from "@/lib/logger"
import { TaskStatusType } from '@/lib/taskStatusIdProvider'
import { TicketActivityType } from '@/lib/ticketTypeIdProvider'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { useToast } from "@/components/ui/toast-provider"
import { getErrorMessage } from '@/lib/utils'

export interface BaseFormData {
  content: string
  timeSpent?: {
    hours: string
    minutes: string
  }
  attachments?: File[]
}

export interface ResolveFormData extends BaseFormData {
  category?: string
  emailDetails?: {
    to: string[]
    cc?: string[]
    attachments?: File[]
  }
}

export interface EmailFormData extends BaseFormData {
  selectedStatus: string
  emailDetails: {
    to: string[]
    cc?: string[]
    attachments?: File[]
  }
}

export interface FormProcessResult {
  success: boolean
  error?: string
}

export class FormProcessor {
  /**
   * Get current store states
   */
  private static getStoreStates() {
    return {
      createActivity: useTaskDetailsStore.getState().createActivity,
      user: useSessionStore.getState().user
    }
  }

  /**
   * Process resolve form submission
   */
  static async processResolveForm(data: ResolveFormData, showToast?: (toast: any) => void): Promise<FormProcessResult> {
    try {
      const { createActivity, user } = this.getStoreStates()
      
      const activity_type_id = 5 // TODO: for activity type
      const form_data = {
        content: data.content,
        activity_type_id,
        status_id: TaskStatusType.Closed, // Set to Closed status
        agent_id: user?.id,
        date_start: new Date(),
        date_end: new Date(),
        time_elapse: Number(data.timeSpent?.hours || 0) * 60 + Number(data.timeSpent?.minutes || 0),
        email_to: data.emailDetails?.to,
        email_cc: data.emailDetails?.cc,
        attachments: data.emailDetails?.attachments || data.attachments,
      }
      
      logger.info('Processing resolve form:', form_data)
      await createActivity(form_data, data.emailDetails?.to && data.emailDetails.to.length > 0 ? true : undefined)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (showToast) {
        showToast({
          title: "Success",
          description: "Task has been resolved successfully.",
          type: "success"
        })
      }
      
      return { success: true }
    } catch (error) {
      logger.error('Error resolving task:', error)
      const errorMessage = getErrorMessage(error)
      
      if (showToast) {
        showToast({
          title: "Error",
          description: "Failed to resolve task. Please try again.",
          type: "error"
        })
      }
      
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Process email form submission
   */
  static async processEmailForm(data: EmailFormData, showToast?: (toast: any) => void): Promise<FormProcessResult> {
    try {
      const { createActivity, user } = this.getStoreStates()
      
      const form_data = {
        content: data.content,
        activity_type_id: TicketActivityType.UserEmail,
        status_id: data.selectedStatus ? parseInt(data.selectedStatus) : undefined,
        agent_id: user?.id,
        email_to: data.emailDetails.to,
        email_cc: data.emailDetails.cc,
        attachments: data.emailDetails.attachments || data.attachments,
        date_start: new Date(),
        date_end: new Date(),
        time_elapse: Number(data.timeSpent?.hours || 0) * 60 + Number(data.timeSpent?.minutes || 0),
      }

      // Uncomment when AI validation is needed
      // const validation = await AISdkService.validateContent(content)
      // if (!validation.valid) {
      //   throw validation.message
      // }
      
      logger.info('Processing email form:', form_data)
      const { success, error } = await createActivity(form_data, true) // Pass true for is_email parameter
      
      if (!success) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      if (showToast) {
        showToast({
          title: "Success",
          description: "Email has been sent successfully.",
          type: "success"
        })
      }
      
      return { success: true }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      logger.error('Error sending email:', error)

      if (showToast) {
        showToast({
          title: "Failed to send email. Please try again.",
          description: errorMessage,
          type: "error"
        })
      }
      
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Process form with optional confirmation dialog
   * @param formType - Type of form being processed
   * @param formData - Form data to process
   * @param skipConfirmation - Whether to skip confirmation dialog
   * @param onSuccess - Callback for successful processing
   * @param onError - Callback for error handling
   * @param showConfirmDialog - Function to show confirmation dialog
   * @param showToast - Toast function for notifications
   */
  static async processFormWithConfirmation(
    formType: 'resolve' | 'email',
    formData: ResolveFormData | EmailFormData,
    skipConfirmation: boolean,
    onSuccess: () => void,
    onError?: (error: string) => void,
    showConfirmDialog?: () => void,
    showToast?: (toast: any) => void
  ): Promise<void> {
    if (skipConfirmation) {
      // Process directly without confirmation
      let result: FormProcessResult
      
      if (formType === 'resolve') {
        result = await this.processResolveForm(formData as ResolveFormData, showToast)
      } else {
        result = await this.processEmailForm(formData as EmailFormData, showToast)
      }
      
      if (result.success) {
        onSuccess()
      } else if (onError && result.error) {
        onError(result.error)
      }
    } else {
      // Show confirmation dialog
      if (showConfirmDialog) {
        showConfirmDialog()
      }
    }
  }
}
