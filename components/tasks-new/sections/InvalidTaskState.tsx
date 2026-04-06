'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InvalidTaskState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-3">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="text-lg font-semibold">Task not found</h3>
        <p className="text-sm text-muted-foreground">
          The task you&apos;re looking for doesn&apos;t exist or may have been deleted.
        </p>
        <Button asChild variant="outline">
          <Link href="/tasks-new">Back to task list</Link>
        </Button>
      </div>
    </div>
  )
}
