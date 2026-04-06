'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { formatDuration } from '@/lib/dateTimeFormat'
import { Spinner } from '@/components/ui/spinner'
import { ActiveTimerInfo } from '@/stores/useTimerStore'
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

interface TimerTransferDialogProps {
  open: boolean
  activeTimer: ActiveTimerInfo
  currentTicketId: number
  onTransfer: (note: string) => Promise<void>
  onCancel: () => void
}

export function TimerTransferDialog({
  open,
  activeTimer,
  currentTicketId,
  onTransfer,
  onCancel,
}: TimerTransferDialogProps) {
  const router = useRouter()
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
      await onTransfer(note.trim())
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer timer. Please refresh and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setNote('')
    setError(null)
    onCancel()
    // Navigate back to the active task (where the timer is running)
    router.push(`/tasks/${activeTimer.ticketId}`)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[600px] border-red-500" 
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Active Timer Running
          </DialogTitle>
          <DialogDescription>
            You have an active timer running on another task
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Task #{activeTimer.ticketId}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
                  onClick={() => {
                    onCancel()
                    router.push(`/tasks/${activeTimer.ticketId}`)
                  }}
                  title="Go to Task"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
              <span className="text-lg font-mono font-bold text-amber-900 dark:text-amber-100">
                {formatDuration(activeTimer.elapsedSeconds)}
              </span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 truncate">
              {activeTimer.ticketSummary}
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="transfer-note" className="text-sm font-medium">
              Please add a note about what you were working on:
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <TiptapEditor
              content={note}
              onChange={(value) => {
                setNote(value)
                if (error) setError(null)
              }}
              minHeight='100px'
              maxHeight='200px'
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

            <p className="text-xs text-muted-foreground mt-1">
              This note will be saved as a private note on Task #{activeTimer.ticketId+" "} 
              and the timer will start on this task.
            </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel and Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !note.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Updating...
              </>
            ) : (
              'Submit Note & Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
