'use client'

import React, { useState, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Clock, Mail, TriangleAlert, Loader2 } from 'lucide-react'
import { FormAvatar } from './components/FormAvatar'
import { Combobox } from "@/components/ui/combobox"
import dynamic from 'next/dynamic'
import { ResolveFormSkeleton } from '../loaders/ResolveFormSkeleton'
import { TiptapEditorSkeleton } from '../loaders/TiptapEditorSkeleton'
import { TiptapEditorError } from '../loaders/TiptapEditorError'
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { ResolveFormConfirmDialog } from './dialogs/ResolveFormConfirmDialog'
import CannedResponseHoverCard from '@/components/custom/CannedResponseHoverCard'
import { TagInput } from '@/components/custom/TagInput'
import { AttachmentInput } from './components/AttachmentInput'
import { Alert } from '@/components/ui/alert'
import { FormProcessor, ResolveFormData } from './processForm'
import { useToast } from "@/components/ui/toast-provider"

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

interface ResolveTaskFormProps {
  onClose: () => void;
  userName?: string;
  userAvatar?: string;
}

const resolutionCategories = [
  { label: "Issue Resolved", value: "resolved" },
  { label: "User Error", value: "user_error" },
  { label: "Known Issue", value: "known_issue" },
  { label: "Feature Request", value: "feature_request" },
  { label: "No Action Required", value: "no_action" },
]

export function ResolveTaskForm({ onClose, userName = "John Doe", userAvatar }: ResolveTaskFormProps) {
  const { task, timer } = useTaskDetailsStore()
  const { userFormSettings } = useSettingsStore()
  const { showToast } = useToast()
  
  const [sendEmail, setSendEmail] = useState(false)
  const [content, setContent] = useState("")
  const [hours, setHours] = useState(() => timer ? Math.floor(timer / 3600).toString() : "0")
  const [minutes, setMinutes] = useState(() => timer ? Math.floor((timer % 3600) / 60).toString() : "0")
  const [selectedCategory, setSelectedCategory] = useState("resolved")
  const [showCc, setShowCc] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [emailTo, setEmailTo] = useState<string[]>([])
  const [emailCc, setEmailCc] = useState<string[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentError, setAttachmentError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!task) {
    return null
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Set loading state if skipping confirmation
    if (userFormSettings.skipConfirmationDialogs) {
      setIsSubmitting(true)
    }
    
    const formData: ResolveFormData = {
      content,
      category: selectedCategory,
      timeSpent: {
        hours,
        minutes
      },
      attachments,
      emailDetails: sendEmail ? {
        to: emailTo,
        cc: emailCc,
        attachments
      } : attachments.length > 0 ? { to: [], attachments } : undefined
    }

    try {
      await FormProcessor.processFormWithConfirmation(
        'resolve',
        formData,
        userFormSettings.skipConfirmationDialogs,
        handleSuccess,
        undefined, // onError - let the processor handle toast notifications
        () => setShowConfirm(true), // showConfirmDialog
        showToast
      )
    } finally {
      // Reset loading state
      setIsSubmitting(false)
    }
  }

  const handleSuccess = () => {
    onClose()
  }

  const selectedCategoryLabel = resolutionCategories.find(
    cat => cat.value === selectedCategory
  )?.label

  return (
    <Suspense fallback={<ResolveFormSkeleton />}>
      <div className="relative p-2 bg-background rounded-lg">
        <div className="flex justify-between items-center">
          <FormAvatar title="Resolve Task" />
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSendEmail(!sendEmail)}
              className={sendEmail ? "text-blue-600" : "text-gray-400"}
            >
              <Mail className="h-4 w-4" />
            </Button>
            {!sendEmail && (
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
            )}
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
          {sendEmail && (
            <div className="flex items-center space-x-2">
              <TagInput
                value={emailTo}
                onChange={setEmailTo}
                placeholder="enter email here"
                prefix="to:"
                className="flex-grow"
                validate={validateEmail}
                disabled={isSubmitting}
              />
              <div className="flex space-x-2">
                {!showCc && (
                  <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={() => setShowCc(!showCc)}>cc</Button>
                )}
                <AttachmentInput
                  onAttachmentsChange={(files) => {
                    setAttachments(files)
                    setAttachmentError('')
                  }}
                  onValidationError={setAttachmentError}
                  maxSize={15}
                  maxFiles={5}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
              </div>
            </div>
          )}
          {showCc && (
            <div className="flex items-center space-x-2">
              <TagInput
                value={emailCc}
                onChange={setEmailCc}
                placeholder="add cc email"
                prefix="cc:"
                className="flex-grow"
                validate={validateEmail}
                disabled={isSubmitting}
              />
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => setShowCc(!showCc)}>
                  <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <React.Suspense fallback={<TiptapEditorSkeleton />}>
            <CannedResponseHoverCard
              onSelect={(res) => setContent(res.response)}
              content={content}
            >
              <div>
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  className={`min-h-[100px] [&_.ProseMirror]:min-h-[80px] ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
                />
              </div>
            </CannedResponseHoverCard>
          </React.Suspense>

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
              <Combobox
                options={resolutionCategories}
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                placeholder="Resolution:"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex col-span-2 justify-end">
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" type="submit" disabled={!!attachmentError || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    'Resolve Task'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>

        <ResolveFormConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onSuccess={handleSuccess}
          content={content}
          category={selectedCategoryLabel}
          timeSpent={{
            hours,
            minutes
          }}
          emailDetails={sendEmail ? {
            to: emailTo,
            cc: emailCc,
            attachments
          } : attachments.length > 0 ? { to: [], attachments } : undefined}
        />
      </div>
    </Suspense>
  )
}