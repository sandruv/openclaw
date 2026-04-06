'use client'

import React from 'react'
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
import { useToast } from "@/components/ui/toast-provider"
import { TicketActivityType } from '@/lib/ticketTypeIdProvider'
import { getErrorMessage } from '@/lib/utils'
import { AISdkService } from '@/services/aiSdkService'
import { FormProcessor, EmailFormData } from '../processForm'

interface TimeSpent {
  hours: string
  minutes: string
}

interface EmailFormConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  isLoading?: boolean
  content: string
  timeSpent?: TimeSpent
  selectedStatus?: string
  emailDetails: {
    to: Array<string>
    cc?: Array<string>
    attachments?: File[]
  }
}

export function EmailFormConfirmDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  isLoading,
  content,
  timeSpent,
  selectedStatus,
  emailDetails,
}: EmailFormConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useSessionStore()
  const { createActivity, statuses } = useTaskDetailsStore()
  const { showToast } = useToast()
  const hasTimeSpent = timeSpent && (Number(timeSpent.hours) > 0 || Number(timeSpent.minutes) > 0)
  const status = statuses.find(s => s.id.toString() === selectedStatus)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const formData: EmailFormData = {
        content,
        selectedStatus: selectedStatus || '',
        timeSpent,
        emailDetails: {
          to: emailDetails.to,
          cc: emailDetails.cc,
          attachments: emailDetails.attachments
        }
      }

      const result = await FormProcessor.processEmailForm(formData, showToast)
      
      if (result.success) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      logger.error('Error in email confirmation dialog:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Send Email</AlertDialogTitle>
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
          <div className="space-y-4">
            {/* Email Details */}
            <div className="space-y-2 bg-gray-100 dark:bg-gray-800 py-2 px-4 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">To:</span>
                <span className="text-sm">{emailDetails.to.join(', ')}</span>
              </div>
              {emailDetails.cc && emailDetails.cc.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Cc:</span>
                  <span className="text-sm">{emailDetails.cc}</span>
                </div>
              )}
            </div>

            {/* Email Content Preview */}
            <div className="space-y-2">
              <div className="flex flex-wrap align-bottom justify-between">
                <p className="text-sm font-medium text-muted-foreground">Content Preview:</p>
                <div className="space-x-2">
                  {hasTimeSpent && (
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                      Time: {timeSpent.hours}h {timeSpent.minutes}m
                    </div>
                  )}
                  {status && (
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-500/10 text-blue-500">
                      Status: {status.name}
                    </div>
                  )}
                </div>
              </div>
              <div 
                className="text-sm p-4 bg-gray-50 dark:bg-gray-900 rounded-md max-h-[50vh] overflow-y-auto styled-scrollbar"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              {/* Attachments Section */}
              {emailDetails.attachments && emailDetails.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                    <span>Attachments ({emailDetails.attachments.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {emailDetails.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center space-x-1 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">({(file.size / 1024).toFixed(1)}KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Email
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
