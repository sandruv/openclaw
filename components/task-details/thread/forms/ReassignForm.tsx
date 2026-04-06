'use client'

import React, { useState, Suspense, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Clock, TriangleAlert, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Combobox } from "@/components/ui/combobox"
import { ReassignFormSkeleton } from '../loaders/ReassignFormSkeleton'
import { TiptapEditorSkeleton } from '../loaders/TiptapEditorSkeleton'
import { TiptapEditorError } from '../loaders/TiptapEditorError'
import { FormAvatar } from './components/FormAvatar'
import { useSessionStore } from '@/stores/useSessionStore'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { LoadingDialog } from './components/LoadingDialog'
import { useToast } from "@/components/ui/toast-provider"
import { logger } from "@/lib/logger"
import { useDropdownStore } from '@/stores/useDropdownStore'
import { TicketActivityType } from '@/lib/ticketTypeIdProvider'
import { AttachmentInput } from './components/AttachmentInput'
import { Alert } from '@/components/ui/alert'
import { validateTiptapContent } from '@/lib/formHelpers'
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

interface ReassignFormProps {
  onClose: () => void;
}

export function ReassignForm({ onClose }: ReassignFormProps) {
  const [content, setContent] = useState("")
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('0')
  const [selectedAgent, setSelectedAgent] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentError, setAttachmentError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useSessionStore()
  const { task, createActivity } = useTaskDetailsStore()
  const { showToast } = useToast()
  const { agents, fetchAgents, isLoading: isLoadingAgents } = useDropdownStore()
  const { timer } = useTaskDetailsStore()

  // Load agents on initial render (only if not already loaded)
  useEffect(() => {
    if (agents.length === 0) {
      fetchAgents().catch((error) => {
        logger.error('Error fetching agents:', error)
        showToast({
          title: "Error",
          description: "Failed to load agent list.",
          type: "error"
        })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  const disableSubmitButton = useMemo(() => {
    return !selectedAgent || !content.trim() || !!attachmentError
  }, [selectedAgent, content, attachmentError])

  useEffect(() => {
    // Set initial time values from timer (which is in seconds)
    const initialHours = Math.floor(timer / 3600)
    const initialMinutes = Math.floor((timer % 3600) / 60)
    setHours(initialHours.toString())
    setMinutes(initialMinutes.toString())
  }, [timer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('ReassignForm - handleSubmit - content:', content)
    if (validateTiptapContent(content).trim() === "") {
      showToast({
        title: "Comment Required",
        description: "Please enter a comment.",
        type: "error"
      })

      return
    }

    if (!selectedAgent) {
      showToast({
        title: "Agent Required",
        description: "Please select an agent to reassign the task.",
        type: "error"
      })

      return
    }
    
    setIsLoading(true)
    try {
      // Use the specific enum value for reassignment
      const activity_type_id = TicketActivityType.Reassign // 6 - Reassign
      
      const activityData = {
        content,
        activity_type_id,
        agent_id: user?.id?.toString() || '',
        assigned_to: selectedAgent,
        date_start: new Date().toISOString(),
        date_end: new Date().toISOString(),
        time_elapse: (Number(hours || 0) * 60 + Number(minutes || 0)).toString(),
        status_id: TaskStatusType.Assigned,
        ticket_id: task?.id?.toString() || '',
        from: user?.email || '',
        attachments: attachments.length > 0 ? attachments : undefined
      }

      const { success, error } = await createActivity(activityData)

      if (!success) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      showToast({
        title: "Success",
        description: "Task has been reassigned successfully.",
        type: "success"
      })
      onClose()
    } catch (error) {
      showToast({
        title: "Reassignment Failed",
        description: error as string || "Failed to reassign task. Please try again.",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Suspense fallback={<ReassignFormSkeleton />}>
      {isLoading && <LoadingDialog isOpen={isLoading} />}
      <div className="relative p-2 bg-background rounded-lg" data-testid="reassign-form">
        
        <div className="flex justify-between items-center">
          <FormAvatar title="Reassign Task" />
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
              className="" 
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
            data-testid="reassign-comment-editor"
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
            <div className="">
              <Combobox
                options={agents}
                value={selectedAgent}
                onValueChange={setSelectedAgent}
                placeholder="Assign To:"
                emptyMessage="No agents found"
                includeUnselect={false}
                disabled={isLoadingAgents}
                data-testid="agent-select"
              />
            </div>
            <div className="flex col-span-2 justify-end">
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose} data-testid="reassign-cancel">Discard</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" 
                disabled={disableSubmitButton} data-testid="reassign-submit">Reassign</Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Suspense>
  )
}