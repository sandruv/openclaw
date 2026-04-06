'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 px-4 max-w-2xl mx-auto">
      <Alert variant="destructive" className="mb-6 border-red-500">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg">Error loading tasks</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error || 'An unexpected error occurred while loading tasks.'}</p>
          <p className="text-sm">Please try again or contact support if the problem persists.</p>
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-4">
        <Button onClick={onRetry} className="px-8">
          Retry
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  )
}
