'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useSessionStore } from '@/stores/useSessionStore'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { logger } from "@/lib/logger"
import { useToast } from "@/components/ui/toast-provider"

interface PrivateFormConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  content: string
  status?: {
    id: string
    name: string
  }
  timeSpent?: {
    hours: string
    minutes: string
  }
}

export function PrivateFormConfirmDialog({
  isOpen,
  onClose,
  onSuccess,
  content,
  status,
  timeSpent
}: PrivateFormConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useSessionStore()
  const { createActivity } = useTaskDetailsStore()
  const { showToast } = useToast()
  const hasTimeSpent = timeSpent && 
    (timeSpent.hours !== "0" || timeSpent.minutes !== "0")

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const activity_type_id = 2 // Private Note
      const form_data = {
        content,
        activity_type_id,
        status_id: Number(status?.id),
        agent_id: 4,
        date_start: new Date(),
        date_end: new Date(),
        time_elapse: Number(timeSpent?.hours || 0) * 60 + Number(timeSpent?.minutes || 0)
      }
      
      logger.info('Submitting private note:', form_data)
      await createActivity(form_data)
      await new Promise(resolve => setTimeout(resolve, 1000))
      showToast({
        title: "Success",
        description: "Private note has been added successfully.",
        type: "success"
      })
      onSuccess()
      onClose()
    } catch (error) {
      logger.error('Error submitting private note:', error)
      showToast({
        title: "Error",
        description: "Failed to add private note. Please try again.",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[600px] max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Submit Private Note</AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="my-2">
          <div className="flex flex-wrap align-bottom justify-between">
            <p className="text-sm font-medium text-muted-foreground">Content Preview:</p>
            <div>
              {status?.name && (
                <div className="mr-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-500/10 text-blue-500">
                  Status: {status.name}
                </div>
              )}
              {hasTimeSpent && (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                  Time: {timeSpent?.hours !== "0" && `${timeSpent?.hours}h `}
                  {timeSpent?.minutes !== "0" && `${timeSpent?.minutes}m`}
                </div>
              )}
            </div>
          </div>

          <div className="mt-1">
            <div 
              className="bg-muted p-4 rounded-md text-sm max-h-[300px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Confirm Submit'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
