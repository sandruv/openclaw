'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Clock } from 'lucide-react'
import { formatDuration } from '@/lib/dateTimeFormat'
import { Spinner } from '@/components/ui/spinner'
import { TiptapEditorSkeleton } from '@/components/task-details/thread/loaders/TiptapEditorSkeleton'
import { TiptapEditorError } from '@/components/task-details/thread/loaders/TiptapEditorError'

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

interface TimerStopDialogProps {
  open: boolean
  ticketId: number
  ticketSummary: string
  elapsedTime: number // in seconds
  onStop: (note: string) => Promise<void>
  onCancel: () => void
}

export function TimerStopDialog({
  open,
  ticketId,
  ticketSummary,
  elapsedTime,
  onStop,
  onCancel,
}: TimerStopDialogProps) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!note.trim()) {
      setError('Please enter a note about what you were working on')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onStop(note.trim())
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop timer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setNote('')
    setError(null)
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[600px] border-amber-500" 
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Stop Timer
          </DialogTitle>
          <DialogDescription>
            Stopping timer for Task #{ticketId}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Time tracked
              </span>
              <span className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">
                {formatDuration(elapsedTime)}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 truncate">
              {ticketSummary}
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="stop-note" className="text-sm font-medium">
              Please add a note about what you were working on:
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <TiptapEditor
              content={note}
              onChange={(value) => {
                setNote(value)
                if (error) setError(null)
              }}
              className="min-h-[100px] max-h-[200px] [&_.ProseMirror]:min-h-[80px]"
              data-testid="timer-stop-note-editor"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            This note will be saved as a private note on this task 
            and the time entry will be recorded.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            data-testid="timer-stop-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !note.trim()}
            className="bg-red-500 hover:bg-red-600"
            data-testid="timer-stop-submit"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Stopping...
              </>
            ) : (
              'Submit Note & Stop'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
