import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Ticket, SquarePen, User2, Crown, ClockArrowUp, Pencil, Check, X, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { STATUS_COLORS } from "@/constants/colors"
import { cn } from "@/lib/utils"
import React, { useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast-provider"
import { SkeletonText, SkeletonBadge } from "@/components/ui/skeleton-inline"
import { useSettingsStore } from "@/stores/useSettingsStore"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const formatTaskId = (id: number): string => {
  return id.toString().padStart(3, '0')
}

export function Header() {
  const { task, updateTask, isNavigating } = useTaskDetailsStore()
  const [isEditing, setIsEditing] = useState(false)
  const [summaryValue, setSummaryValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()
  const { compactMode } = useSettingsStore()

  // Initialize summary value when task changes
  useEffect(() => {
    if (task) {
      setSummaryValue(task.summary)
    }
  }, [task])

  if (!task) return null
  
  const handleUpdateSummary = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await updateTask({ summary: summaryValue })
      setIsEditing(false)
      showToast({
        title: "Summary updated",
        description: "Task summary has been successfully updated.",
        type: "success",
        duration: 3000
      })
    } catch (error) {
      console.error('Failed to update task summary:', error)
      showToast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update task summary",
        type: "error",
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusColorClass = cn(
    STATUS_COLORS[task.status.name.toLowerCase() as keyof typeof STATUS_COLORS],
    task.status.name.toLowerCase() === 'closed' && 'bg-gray-500 text-white border-gray-600',
    task.status.name.toLowerCase() === 'archived' && 'bg-gray-200 text-black border-gray-600',
    task.status.name.toLowerCase() !== 'closed' && task.status.name.toLowerCase() !== 'archived' && 'text-white',
  )

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-start md:space-x-4 md:space-y-0 mt-4">
      <Avatar className={cn("h-10 w-10 bg-green-500 text-white flex items-center justify-center", statusColorClass)}>
        <Ticket className="h-6 w-6" />
      </Avatar>
      <div className="flex-grow space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-end gap-3">
            <SkeletonBadge isLoading={isNavigating} className="text-lg px-4">
              <Badge data-testid={`task-id-${task.id}`} className="text-lg self-start px-4" variant="secondary">
                {compactMode ? '' : 'ID: '}{formatTaskId(task.id)}
              </Badge>
            </SkeletonBadge>
            <SkeletonBadge isLoading={isNavigating}>
              {compactMode ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        data-testid={`status-badge-${task.status.name.toLowerCase().replaceAll(' ', '-')}`}
                        className={cn('h-6 w-12 h-4 rounded-xl flex items-center justify-center text-xs font-bold border', statusColorClass)}>
                        {/* Empty content for compact mode, but colored status */}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className={statusColorClass}>
                      <p>{task.status.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Badge className={cn('h-6 w-auto rounded-xl flex items-center justify-center text-xs font-bold border', statusColorClass)}>
                  {task.status.name}
                </Badge>
              )}
            </SkeletonBadge>
          </div> 
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              className="text-sm py-0 h-7"
              value={summaryValue}
              onChange={(e) => setSummaryValue(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleUpdateSummary}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSummaryValue(task.summary)
                  setIsEditing(false)
                }}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SkeletonText isLoading={isNavigating} className="w-48 h-4">
              <p data-testid="task-title" className="text-sm text-muted-foreground">{task.summary}</p>
            </SkeletonText>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => {
                setSummaryValue(task.summary)
                setIsEditing(true)
              }}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
      <div className={cn("flex flex-col space-y-2 min-w-[190px]", compactMode && 'min-w-[120px]')}>
        <div className="flex items-center gap-2">
          <User2 className="w-3 h-3 text-muted-foreground" />
          <SkeletonText isLoading={isNavigating} className="w-24 h-3">
            <span data-testid="task-assignee" className="text-muted-foreground text-xs">
              {task.agent ? `${(task.agent.first_name || '').trim()} ${(task.agent.last_name || '').trim()}`.trim() || 'Unknown' : 'None'}
            </span>
          </SkeletonText>
          {task.user?.is_user_vip && <Crown className="w-3 h-3 text-muted-foreground" />}          
        </div>
        <div className="flex items-center gap-2">
          <ClockArrowUp className="w-3 h-3 text-muted-foreground" />
          <SkeletonText isLoading={isNavigating} className="w-32 h-3">
            {compactMode ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground text-xs cursor-help">
                      {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Created: {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-muted-foreground text-xs">
                Created: {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
              </span>
            )}
          </SkeletonText>
        </div>
        <div className="flex items-center gap-2">
          <SquarePen className="w-3 h-3 text-muted-foreground" />
          <SkeletonText isLoading={isNavigating} className="w-36 h-3">
            {compactMode ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground text-xs cursor-help">
                      {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last activity: {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-muted-foreground text-xs">
                Last activity: {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
              </span>
            )}
          </SkeletonText>
        </div>
      </div>
    </div>
  )
}