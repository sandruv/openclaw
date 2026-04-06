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
import { Loader2, Paperclip, X } from "lucide-react"
import { useSessionStore } from '@/stores/useSessionStore'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { logger } from "@/lib/logger"
import { TaskStatusType } from '@/lib/taskStatusIdProvider'
import { useToast } from "@/components/ui/toast-provider"
import { FormProcessor, ResolveFormData } from '../processForm'

interface ResolveFormConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  content: string
  category?: string
  timeSpent?: {
    hours: string
    minutes: string
  }
  emailDetails?: {
    to: Array<string>
    cc?: Array<string>
    attachments?: File[]
  }
}

export function ResolveFormConfirmDialog({
  isOpen,
  onClose,
  onSuccess,
  content,
  category,
  timeSpent,
  emailDetails
}: ResolveFormConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useSessionStore()
  const { createActivity } = useTaskDetailsStore()
  const { showToast } = useToast()
  const hasTimeSpent = timeSpent && 
    (timeSpent.hours !== "0" || timeSpent.minutes !== "0")

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const formData: ResolveFormData = {
        content,
        category,
        timeSpent,
        emailDetails: emailDetails ? {
          to: emailDetails.to,
          cc: emailDetails.cc,
          attachments: emailDetails.attachments
        } : undefined
      }

      const result = await FormProcessor.processResolveForm(formData, showToast)
      
      if (result.success) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      logger.error('Error in resolve confirmation dialog:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[700px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Resolve Task</AlertDialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 rounded-full p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </AlertDialogHeader>
        
        <div className="">
          { emailDetails && emailDetails.to && emailDetails.to.length > 0 && emailDetails.to[0] && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 bg-gray-200 py-2 px-4 rounded-md">
                <span className="text-sm font-medium">To:</span>
                <span className="text-sm">{emailDetails.to.join(', ')}</span>
              </div>
              {emailDetails.cc && emailDetails.cc.length > 0 && (
                <div className="flex items-center space-x-2 mt-1 bg-gray-200 py-2 px-4 rounded-md">
                  <span className="text-sm font-medium">cc:</span>
                  <span className="text-sm">{emailDetails.cc.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex align-end justify-between mt-4">
            <p className="text-sm font-medium text-muted-foreground mt-1">Content Preview:</p>
            <div>
              {category && (
                <div className="mr-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-500/10 text-blue-500">
                  Resolution: {category}
                </div>
              )}
              {hasTimeSpent && (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                  Time: {timeSpent.hours}h {timeSpent.minutes}m
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 rounded-md border p-4 max-h-[50vh] overflow-y-auto styled-scrollbar">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          {/* Attachments Section */}
          {emailDetails?.attachments && emailDetails.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                <span>Attachments ({emailDetails.attachments.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {emailDetails.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center space-x-1 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <span className="text-gray-500">({(file.size / 1024).toFixed(1)}KB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resolving...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
