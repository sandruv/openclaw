'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Task } from "@/types/tasks"
import { SkeletonText } from "@/components/ui/skeleton-inline"
import { getInitials, getAvatarColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getStatusColor, StatusType } from "@/lib/taskUtils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { TaskCard } from "./TaskCard"

interface ParentTicketSectionProps {
  task: Task
  isNavigating: boolean
}

export function ParentTicketSection({ task, isNavigating }: ParentTicketSectionProps) {
  const [openPopover, setOpenPopover] = useState(false)
  const router = useRouter()
  
  // If there's no parent ticket, don't render anything
  if (!task.parent_ticket) {
    return null
  }

  const parentTicket = task.parent_ticket
  const hasValidAgent = parentTicket.agent && parentTicket.agent.id && (parentTicket.agent.first_name || parentTicket.agent.last_name)
  const assigneeName = hasValidAgent
    ? `${(parentTicket.agent.first_name || '').trim()} ${(parentTicket.agent.last_name || '').trim()}`.trim()
    : 'Unassigned'
  const initials = getInitials(assigneeName)
  const agentAvatarColor = getAvatarColor(parentTicket.agent?.id ?? 0)
  const statusColorClass = getStatusColor((parentTicket.status?.name ?? 'unknown').toLowerCase() as StatusType)

  // Convert parent ticket to TaskCard format
  const taskCardData = {
    id: parentTicket.id,
    summary: parentTicket.summary || 'No Summary',
    client: {
      id: 0, // Parent ticket doesn't have client info in current structure
      name: "Parent Task",
      is_client_vip: false
    },
    status: parentTicket.status || { id: 1, name: 'Unknown' },
    ticket_type: {
      id: 0,
      name: "Task" // Default type since parent ticket doesn't have type info in its structure
    },
    priority: {
      id: 0,
      name: "Medium" // Default priority since not in parent ticket structure
    },
    impact: {
      id: 0,
      name: "Single User" // Default impact since not in parent ticket structure
    },
    user: {
      id: parentTicket.agent?.id || 0,
      first_name: parentTicket.agent?.first_name || 'Unknown',
      last_name: parentTicket.agent?.last_name || '',
      email: ""
    },
    agent: {
      id: parentTicket.agent?.id || 0,
      first_name: parentTicket.agent?.first_name || 'Unknown',
      last_name: parentTicket.agent?.last_name || '',
      email: ""
    },
    created_at: new Date().toISOString(), // Default since not available in parent ticket structure
    updated_at: new Date().toISOString(),
    date_closed: null
  }

  return (
    <div className="space-y-1">
      <div className="text-muted-foreground text-xs">Parent Task</div>
      <SkeletonText isLoading={isNavigating} className="w-full h-4">
        <div className="flex items-center gap-2">
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <button 
                className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer text-left "
                onMouseEnter={() => setOpenPopover(true)}
                onMouseLeave={() => setOpenPopover(false)}
                onClick={(e) => {
                  e.preventDefault()
                  window.open(`/tasks/${parentTicket.id}`, '_blank')
                  setOpenPopover(false)
                }}
              >
                #{parentTicket.id} 
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-50 p-0" 
              align="start"
              onMouseEnter={() => setOpenPopover(true)}
              onMouseLeave={() => setOpenPopover(false)}
            >
              <TaskCard 
                task={taskCardData} 
                compact={false}
                onClick={() => {
                  window.open(`/tasks/${parentTicket.id}`, '_blank')
                  setOpenPopover(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </SkeletonText>
    </div>
  )
}
