import { Loader2, CheckCircle2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface SubmissionDialogProps {
  isOpen: boolean
  isSubmitting: boolean
  isSubmitted: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmSubmitDialog({
  isOpen,
  isSubmitting,
  isSubmitted,
  onOpenChange,
}: SubmissionDialogProps) {
  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only allow closing if not submitting
        if (!isSubmitting && !open) {
          onOpenChange(open)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader className="gap-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            {isSubmitted ? (
              <CheckCircle2 className="h-14 w-14 text-green-500 animate-pulse" />
            ) : (
              <Loader2 className="h-14 w-14 text-blue-500 animate-spin" />
            )}
          </div>
          <div className="text-center">
            <AlertDialogTitle>
              {isSubmitted ? 'Task Submitted Successfully!' : 'Submitting Your Task'}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2">
              {isSubmitted 
                ? 'Redirecting you to the task details...' 
                : 'Please wait while we process your task submission.'}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
