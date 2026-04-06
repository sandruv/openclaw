'use client'

import { useState, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNewTaskStore } from "@/stores/useNewTaskStore"
import { useToast } from '@/components/ui/toast-provider'
import { useDropdownStore } from '@/stores/useDropdownStore'
import { NewTaskForm } from '@/components/task-new/'
import { ConfirmSubmitDialog } from '@/components/task-new/dialogs/ConfirmSubmitDialog'
import { useRouter } from 'next/navigation'

export default function NewTaskPage() {
  const router = useRouter()
  const { 
    newTask, 
    setNewTask, 
    validateNewTask, 
    submitNewTask, 
    resetNewTask, 
    createManualUserAndSubmitTask, 
    validateManualUser,
    validateManualUserAsync,
    errorState,
    clearErrors
  } = useNewTaskStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { showToast } = useToast()
  const { isLoading } = useDropdownStore()

  // Note: fetchAllDropdowns() is already called in the tasks layout
  // No need to call it again here to avoid duplicate API requests

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearErrors()

    const validationErrors = validateNewTask()
    if (Object.keys(validationErrors).length > 0) {
      // Errors are already set in the store by validateNewTask
      
      // Create a more detailed error message for the toast
      const errorCount = Object.keys(validationErrors).length
      const firstFewErrors = Object.values(validationErrors).slice(0, 3)
      const hasMoreErrors = errorCount > 3
      
      let description = firstFewErrors.join(', ')
      if (hasMoreErrors) {
        description += ` and ${errorCount - 3} more error${errorCount - 3 > 1 ? 's' : ''}`
      }
      
      showToast({
        title: `Validation Error${errorCount > 1 ? 's' : ''} (${errorCount})`,
        description: description,
        type: "error",
      })
      return
    }

    let ticket = null;
    setIsSubmitting(true)
    setShowConfirmDialog(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if we need to create a manual user
      const needsManualUser = !newTask.end_user.user
      
      if (needsManualUser) {
        // Validate manual user data including async email validation
        const manualUserErrors = await validateManualUserAsync()
        if (Object.keys(manualUserErrors).length > 0) {
          // Don't proceed with submission if there are manual user validation errors
          // Errors are already set in the store, so the UI will show them
          setIsSubmitting(false)
          setShowConfirmDialog(false)
          
          // Show toast with validation errors
          const errorCount = Object.keys(manualUserErrors).length
          const firstFewErrors = Object.values(manualUserErrors).slice(0, 3)
          const hasMoreErrors = errorCount > 3
          
          let description = firstFewErrors.join(', ')
          if (hasMoreErrors) {
            description += ` and ${errorCount - 3} more error${errorCount - 3 > 1 ? 's' : ''}`
          }
          
          showToast({
            title: `Manual User Validation Error${errorCount > 1 ? 's' : ''} (${errorCount})`,
            description: description,
            type: "error",
          })
          return // Exit early without resetting the form
        }
        
        ticket = await createManualUserAndSubmitTask()
      } else {
        ticket = await submitNewTask()
      }
      
      setIsSubmitted(true)

      showToast({
        title: "Success",
        description: "Task submitted successfully.",
        type: "success",
      })

      await new Promise(resolve => setTimeout(resolve, 1000))      
    } catch (err) {
      if (err instanceof Error) {
        // Enhanced error handling for different types of errors
        let title = "Error"
        let description = err.message
        
        // Check if it's a validation error from manual user creation
        if (err.message.includes('Manual user information is incomplete')) {
          title = "User Information Required"
          description = err.message.replace('Manual user information is incomplete: ', '')
        } else if (err.message.includes('Failed to create user')) {
          title = "User Creation Failed"
        } else if (err.message.includes('Client is required')) {
          title = "Missing Client Information"
        } else if (err.message.includes('Technical aptitude')) {
          title = "Invalid Technical Aptitude"
        }
        
        showToast({
          title: title,
          description: description,
          type: "error",
        })
      } else {
        showToast({
          title: "Error",
          description: "An unknown error occurred",
          type: "error",
        })
      }
    } finally {
      setIsSubmitting(false)
      setShowConfirmDialog(false)
      
      // Only redirect and reset form if ticket was created successfully
      if (ticket?.id) {
        router.push(`/tasks/${ticket.id}`)
        clearErrors()
        resetNewTask()
      }
    }
  }

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewTask({
        additional: {
          ...newTask.additional,
          attachments: [e.target.files[0]]
        }
      })
    }
  }

  return (
    <ScrollArea className="h-[calc(100vh-61px)]">
      <NewTaskForm
        errors={errorState.errors}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        handleAttachment={handleAttachment}
      />

      <ConfirmSubmitDialog
        isOpen={showConfirmDialog}
        isSubmitting={isSubmitting}
        isSubmitted={isSubmitted}
        onOpenChange={setShowConfirmDialog}
      />
    </ScrollArea>
  )
}