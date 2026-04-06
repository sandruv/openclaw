'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  confirmText?: string
  content?: string
  details?: {
    status?: string
    timeSpent?: {
      hours: string
      minutes: string
    }
  }
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText = "Confirm",
  content,
  details
}: ConfirmDialogProps) {
  const hasTimeSpent = details?.timeSpent && 
    (details.timeSpent.hours !== "0" || details.timeSpent.minutes !== "0")

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="">            
            {(details?.status || hasTimeSpent) && (
              <div className="flex flex-wrap align-bottom justify-between">
                <p className="text-sm font-medium text-muted-foreground">Content Preview:</p>
                <div>
                  {details?.status && (
                    <div className="mr-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-500/10 text-blue-500">
                      Status: {details.status}
                    </div>
                  )}
                  {hasTimeSpent && (
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                      Time: {details?.timeSpent?.hours !== "0" && `${details?.timeSpent?.hours}h `}
                      {details?.timeSpent?.minutes !== "0" && `${details?.timeSpent?.minutes}m`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {content && (
              <div className="mt-1 max-h-[80vh] overflow-y-auto styled-scrollbar">
                <div 
                  className="bg-muted p-4 rounded-md text-sm max-h-[300px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
