'use client'

import React, { useState, Suspense, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Clock, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { FormAvatar } from './components/FormAvatar'
import { EmailFormSkeleton } from '../loaders/EmailFormSkeleton'
import { TiptapEditorSkeleton } from '../loaders/TiptapEditorSkeleton'
import { TiptapEditorError } from '../loaders/TiptapEditorError'
import { EmailFormConfirmDialog } from './dialogs/EmailFormConfirmDialog'
import { StatusSelect } from './components/StatusSelect'
import { LoadingDialog } from './components/LoadingDialog'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { useSettingsStore } from "@/stores/useSettingsStore"
import { cn } from "@/lib/utils"
import { TagInput } from '@/components/custom/TagInput'
import { AttachmentInput } from './components/AttachmentInput'
import { Alert } from '@/components/ui/alert'
import { TriangleAlert } from 'lucide-react'
import { FormProcessor, EmailFormData } from './processForm'
import { useToast } from "@/components/ui/toast-provider"
import { extractEmailsFromTask, validateEmail } from './UtilsForm'

const TiptapEditor = dynamic(
  () => import('@/components/custom/TiptapEditor').then(mod => mod.TiptapEditor).catch(err => {
    console.error('Error loading TiptapEditor:', err)
    return () => <TiptapEditorError />
  }),
  { 
    ssr: false,
    loading: () => <TiptapEditorSkeleton />
  }
)

interface EmailFormProps {
  onClose: () => void;
  userName?: string;
  userAvatar?: string;
}

const EmailFormContent = ({ onClose }: EmailFormProps): React.ReactNode => {
  const [content, setContent] = useState("")
  const [showCc, setShowCc] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentError, setAttachmentError] = useState<string>('')
  const { task, timer } = useTaskDetailsStore()
  const { userFormSettings } = useSettingsStore()
  const { showToast } = useToast()
  
  const [hours, setHours] = useState(() => Math.floor(timer / 3600).toString())
  const [minutes, setMinutes] = useState(() => Math.floor((timer % 3600) / 60).toString())
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [emailTo, setEmailTo] = useState<string[]>([])
  const [emailCc, setEmailCc] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [statusError, setStatusError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const emailData = extractEmailsFromTask(task)
    
    if (emailData.toEmails.length > 0) {
      setEmailTo(emailData.toEmails)
    }
    
    if (emailData.ccEmails.length > 0) {
      setEmailCc(emailData.ccEmails)
      setShowCc(emailData.shouldShowCc)
    }
  }, [task])


  const validateStatus = () => {
    if (!selectedStatus || selectedStatus.trim() === '') {
      setStatusError('Please select a status')
      return false
    }
    setStatusError('')
    return true
  }

  const handleSendEmail = async () => {
    const isStatusValid = validateStatus()
    if (!isStatusValid) {
      return
    }

    // Set loading state if skipping confirmation
    if (userFormSettings.skipConfirmationDialogs) {
      setIsLoading(true)
    }

    const formData: EmailFormData = {
      content,
      selectedStatus,
      timeSpent: {
        hours,
        minutes
      },
      attachments,
      emailDetails: {
        to: emailTo,
        cc: emailCc,
        attachments
      }
    }

    try {
      await FormProcessor.processFormWithConfirmation(
        'email',
        formData,
        userFormSettings.skipConfirmationDialogs,
        onClose, // onSuccess - close the form
        undefined, // onError - let the processor handle toast notifications
        () => setIsConfirmDialogOpen(true), // showConfirmDialog
        showToast
      )
    } finally {
      // Reset loading state
      setIsLoading(false)
    }
  }

  return (
    <div className="relative p-2 bg-background rounded-lg">
      <div className="flex justify-between items-center">
        <FormAvatar title="Email Reply" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onClose(); }} 
        className="space-y-2">
        
        <div className="flex items-center space-x-2">
          <TagInput
            value={emailTo}
            onChange={setEmailTo}
            placeholder="enter email here"
            prefix="to:"
            className="flex-grow"
            validate={validateEmail}
            disabled={isLoading}
          />
          <div className="flex space-x-2">
            { !showCc && 
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => setShowCc(!showCc)}
                disabled={isLoading}>cc</Button>
            }
            <AttachmentInput
              onAttachmentsChange={(files) => {
                setAttachments(files)
                setAttachmentError('') // Clear error when files change successfully
              }}
              onValidationError={setAttachmentError}
              maxSize={15}
              maxFiles={5}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        {showCc && 
          <div className="flex items-center space-x-2">
            <TagInput
              value={emailCc}
              onChange={setEmailCc}
              placeholder="add cc email"
              prefix="cc:"
              className="flex-grow"
              validate={validateEmail}
              disabled={isLoading}
            />
            <Button 
              variant="ghost" 
              type="button" 
              onClick={() => setShowCc(!showCc)}
              disabled={isLoading}>
                <X className="h-4 w-4" />
            </Button>
          </div>
        }
        
        <div className="min-h-[100px]">
          <TiptapEditor
            content={content}
            onChange={setContent}
            className="min-h-[100px] [&_.ProseMirror]:min-h-[80px]"
          />
        </div>
        
        {attachmentError && (
          <Alert variant="destructive">
            <div className="flex items-center space-x-2">
              <TriangleAlert className="h-5 w-5" />
              <p className="text-sm">
                {attachmentError}
              </p>
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div>
            <StatusSelect
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value)
                if (statusError) {
                  setStatusError('') // Clear error when user selects a status
                }
              }}
            />
            {statusError && (
              <p className="text-sm text-red-500 mt-1">{statusError}</p>
            )}
          </div>
          <div className="flex col-span-2 justify-end">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                type="button"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={handleSendEmail}
                disabled={!content.trim() || emailTo.length === 0 || !!attachmentError || !!statusError || isLoading}
              >
                Send Email
              </Button>
            </div>
          </div>
        </div>

        <EmailFormConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onSuccess={onClose}
          content={content}
          emailDetails={{
            to: emailTo,
            cc: emailCc,
            attachments
          }}
          timeSpent={{
            hours,
            minutes
          }}
          selectedStatus={selectedStatus}
        />
        
        <LoadingDialog 
          isOpen={isLoading}
          content="Sending email..."
        />
      </form>
    </div>
  )
}

export function EmailForm(props: EmailFormProps) {
  return (
    <Suspense fallback={<EmailFormSkeleton />}>
      <EmailFormContent {...props} />
    </Suspense>
  )
}