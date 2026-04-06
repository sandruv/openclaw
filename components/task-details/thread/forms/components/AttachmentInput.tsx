'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Paperclip } from 'lucide-react'
import { FileDropbox } from '@/components/custom/FileDropbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast-provider"

interface AttachmentInputProps {
  onAttachmentsChange: (files: File[]) => void
  onValidationError?: (error: string) => void
  maxSize?: number // in MB (cumulative)
  maxFiles?: number
  accept?: string
  className?: string
}

export function AttachmentInput({
  onAttachmentsChange,
  onValidationError,
  maxSize = 15, // default 15MB cumulative
  maxFiles = 5,
  accept,
  className
}: AttachmentInputProps) {
  const [attachments, setAttachments] = useState<File[]>([])
  const [open, setOpen] = useState(false)
  const { showToast } = useToast()

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return mb < 1 ? `${(mb * 1024).toFixed(1)}KB` : `${mb.toFixed(1)}MB`
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const newFiles = Array.from(e.target.files)
    const currentTotalSize = attachments.reduce((total, file) => total + file.size, 0)
    const newFilesTotalSize = newFiles.reduce((total, file) => total + file.size, 0)
    const totalSizeAfterAdd = currentTotalSize + newFilesTotalSize
    const maxSizeBytes = maxSize * 1024 * 1024

    // Check file count limit
    if (attachments.length + newFiles.length > maxFiles) {
      const errorMessage = `Cannot add more than ${maxFiles} files. Currently have ${attachments.length} file(s).`
      showToast({
        title: "File Limit Exceeded",
        description: errorMessage,
        type: "error"
      })
      onValidationError?.(errorMessage)
      return
    }

    // Check cumulative file size limit
    if (totalSizeAfterAdd > maxSizeBytes) {
      const currentSizeMB = formatFileSize(currentTotalSize)
      const newSizeMB = formatFileSize(newFilesTotalSize)
      const errorMessage = `Total file size would exceed ${maxSize}MB limit. Current: ${currentSizeMB}, Adding: ${newSizeMB}`
      showToast({
        title: "File Size Limit Exceeded",
        description: errorMessage,
        type: "error"
      })
      onValidationError?.(errorMessage)
      return
    }

    // Check individual file sizes (optional additional check)
    const oversizedFiles = newFiles.filter(file => file.size > maxSizeBytes)
    if (oversizedFiles.length > 0) {
      const errorMessage = `Individual files cannot exceed ${maxSize}MB: ${oversizedFiles.map(f => f.name).join(', ')}`
      showToast({
        title: "Individual File Too Large",
        description: errorMessage,
        type: "error"
      })
      onValidationError?.(errorMessage)
      return
    }

    const updatedAttachments = [...attachments, ...newFiles]
    setAttachments(updatedAttachments)
    onAttachmentsChange(updatedAttachments)
    setOpen(false) // Close popover after successful file addition
  }

  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index)
    setAttachments(updatedAttachments)
    onAttachmentsChange(updatedAttachments)
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={attachments.length > 0 ? "relative text-blue-500" : "relative"}
          >
            <Paperclip className="h-4 w-4" />
            {attachments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {attachments.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2" align="end">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <p>Max: {maxFiles} files, {maxSize}MB total</p>
              {attachments.length > 0 && (
                <p className="flex items-center">
                  Current: {formatFileSize(attachments.reduce((total, file) => total + file.size, 0))}
                </p>
              )}
            </div>
            <FileDropbox
              selectedFiles={attachments.map(f => f.name)}
              onFileChange={handleFileChange}
              onFileRemove={removeAttachment}
              maxSize={`${maxSize}mb`}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
