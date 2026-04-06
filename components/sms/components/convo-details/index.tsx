'use client'

import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TaskComponent } from '@/components/aisdk/ui-tools/TaskComponent'
import { useTasksStore } from '@/stores/useTasksStore'
import type { Task } from '@/types/tasks'
import { ConvoDetailsSkeleton } from './convo-details-skeleton'
import { useState, useEffect } from 'react'

interface Contact {
  id: string
  name: string
  phone: string
  email: string
  channel: string
  location: string
  ipAddress: string
  browser: string
  os: string
  chatId: string
  created: Date
  lastUpdated: Date
  taskId?: number
}

// Sample contact data
const sampleContact: Contact = {
  id: "c123",
  name: "John Smith",
  phone: "+1 (555) 123-4567",
  email: "john@example.com",
  channel: "Web Chat",
  location: "New York, USA",
  ipAddress: "192.168.1.100",
  browser: "Chrome 121.0",
  os: "Windows 11",
  chatId: "CHAT-2024-001",
  created: new Date("2024-02-20T09:30:00"),
  lastUpdated: new Date("2024-02-25T18:35:00"),
  taskId: 1
}

export function ConvoDetails() {
  const { tasks } = useTasksStore()
  const [isLoading, setIsLoading] = useState(true)
  const associatedTask = sampleContact.taskId ? tasks.find(t => t.id === sampleContact.taskId) : tasks[0]

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <ConvoDetailsSkeleton />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">Details</h2>
      </div>

      {/* Contact Details */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 border-b">
          <div className="space-y-3 pb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{sampleContact.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{sampleContact.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{sampleContact.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Channel</p>
                <Badge variant="secondary" className="mt-1">
                  {sampleContact.channel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{sampleContact.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IP Address</p>
                <p className="text-sm font-medium">{sampleContact.ipAddress}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Browser</p>
                <p className="text-sm font-medium">{sampleContact.browser}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">OS</p>
                <p className="text-sm font-medium">{sampleContact.os}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Chat ID</p>
                <Badge variant="outline" className="mt-1">
                  {sampleContact.chatId}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {format(sampleContact.created, 'MMM d, yyyy')}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {format(sampleContact.lastUpdated, 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          {/* Associated Tasks */}
          {associatedTask && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Associated Tasks</h3>
              <TaskComponent task={associatedTask} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
