'use client'

import { Inbox } from 'lucide-react'

export function EmptyDetailsState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <Inbox className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-semibold">Select a task</h3>
        <p className="text-sm text-muted-foreground">
          Choose a task from the list to view details
        </p>
      </div>
    </div>
  )
}
