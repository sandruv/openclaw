'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Task } from "@/types/tasks"
import { ExternalLink, Pencil, Eye, Copy, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from '@/components/ui/toast-provider'
interface TaskContextMenuProps {
  children: React.ReactNode
  task: Task
  onViewTask: (task: Task) => void
}

export function TaskContextMenu({ children, task, onViewTask }: TaskContextMenuProps) {
  const router = useRouter()
  const taskUrl = `/tasks/${task.id}`
  const { showToast } = useToast()
  
  // Function to copy task ID to clipboard
  const copyTaskId = () => {
    navigator.clipboard.writeText(`#${task.id}`)
    showToast({
      title: "Copied",
      description: `Task #${task.id} ID copied to clipboard`,
      type: 'info'
    })
  }
  
  // Function to copy task URL to clipboard
  const copyTaskUrl = () => {
    // Get the full URL including domain
    const url = `${window.location.origin}/tasks/${task.id}`
    navigator.clipboard.writeText(url)
    showToast({
      title: "Copied",
      description: `Task URL copied to clipboard`,
      type: 'info'
    })
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">

        <ContextMenuItem 
          className="cursor-pointer"
          onClick={() => window.open(taskUrl, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in New Tab
        </ContextMenuItem>

        <ContextMenuItem 
          className="cursor-pointer" 
          onClick={() => onViewTask(task)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Task
        </ContextMenuItem>

        <ContextMenuSeparator />
        
        <ContextMenuItem className="cursor-pointer" onClick={copyTaskId}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Task ID
        </ContextMenuItem>
        
        <ContextMenuItem className="cursor-pointer" onClick={copyTaskUrl}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Task URL
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
