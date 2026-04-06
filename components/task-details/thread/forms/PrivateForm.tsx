'use client'

import React, { useState, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Clock, TriangleAlert } from 'lucide-react'
import dynamic from 'next/dynamic'
import { FormAvatar } from './components/FormAvatar'
import { StatusSelect } from './components/StatusSelect'
import { useSessionStore } from '@/stores/useSessionStore'
import { PrivateFormSkeleton } from '../loaders/PrivateFormSkeleton'
import { TiptapEditorSkeleton } from '../loaders/TiptapEditorSkeleton'
import { TiptapEditorError } from '../loaders/TiptapEditorError'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { LoadingDialog } from './components/LoadingDialog'
import { useToast } from "@/components/ui/toast-provider"
import { logger } from "@/lib/logger"
import { getErrorMessage } from '@/lib/utils'
import { AISdkService } from '@/services/aiSdkService'
import { AttachmentInput } from './components/AttachmentInput'
import { TicketActivityType } from '@/lib/ticketTypeIdProvider'
import { Alert } from '@/components/ui/alert'
import { TaskStatusType } from '@/lib/taskStatusIdProvider'

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

interface PrivateNoteFormProps {
  onClose: () => void;
}

export function PrivateNoteForm({ onClose }: PrivateNoteFormProps) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<string>()
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentError, setAttachmentError] = useState<string>('')
  const { user } = useSessionStore()
  const { task, timer, createActivity } = useTaskDetailsStore()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Convert timer (in seconds) to hours and minutes
  const [hours, setHours] = useState(() => Math.floor(timer / 3600).toString())
  const [minutes, setMinutes] = useState(() => Math.floor((timer % 3600) / 60).toString())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Use the specific enum value for private notes
      const activity_type_id = TicketActivityType.PrivateNote // 2 - Private Note
      console.log('PrivateForm - activity_type_id:', activity_type_id)
      
      if (!status) {
        throw new Error('Status is required')
      }
      
      const validation = await AISdkService.validateContent(content)
      if (!validation.valid) {
        throw validation.message
      }
      
      // Create data object to pass to createActivity
      const activityData = {
        content,
        activity_type_id,
        status_id: Number(status),
        agent_id: user?.id,
        date_start: new Date(),
        date_end: new Date(),
        time_elapse: (Number(hours || 0) * 60 + Number(minutes || 0)),
        ticket_id: task?.id,
        from: user?.email || '',
        attachments: attachments.length > 0 ? attachments : undefined
      }
      
      const { success, error } = await createActivity(activityData)
      if (!success) {
        throw error
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      showToast({
        title: "Success",
        description: "Private note has been added successfully.",
        type: "success"
      })
      
      onClose()
    } catch (error) {
      const message = getErrorMessage(error)

      showToast({
        title: "Failed to add private note",
        description: message,
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Suspense fallback={<PrivateFormSkeleton />}>
      <div className="relative p-2 bg-background rounded-lg" data-testid="private-note-form">
        <div className="flex justify-between items-center">
          <FormAvatar title="Private Note" />
          <div className="flex space-x-2">
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <TiptapEditor
            content={content}
            onChange={setContent}
            className="min-h-[100px] [&_.ProseMirror]:min-h-[80px]"
            data-testid="private-note-editor"
          />
          
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
            <StatusSelect 
              value={status} 
              onChange={setStatus}
              className="w-full"
              data-testid="status-select"
            />
            <div className="flex col-span-2 justify-end">
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={onClose} data-testid="private-note-cancel">
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" type="submit" disabled={!content || isLoading || !!attachmentError} data-testid="private-note-submit">
                  Submit
                </Button>
              </div>
            </div>
          </div>
          
        </form>
      </div>

      <LoadingDialog 
        isOpen={isLoading}
        content="Submitting private note..."
      />
    </Suspense>
  )
}