'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Task } from "@/types/tasks"
import { SkeletonText } from "@/components/ui/skeleton-inline"
import { X, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { Loader2 } from "lucide-react"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { TaskCard } from "./TaskCard"

interface ChildTicketsSectionProps {
  task: Task
  isNavigating: boolean
  editMode?: boolean
  onEditModeChange?: (editMode: boolean) => void
}

export function ChildTicketsSection({ task, isNavigating, editMode = false, onEditModeChange }: ChildTicketsSectionProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openPopover, setOpenPopover] = useState<string | null>(null)
  const { showToast } = useToast()
  const { unmergeChildTicket } = useTaskDetailsStore()
  const router = useRouter()
  
  // Handle case when there are no child tickets (support both old and new structure)
  const childTickets = task.child_tickets || []
  const legacyChildTicketIds = task.child_ticket_ids ? 
    task.child_ticket_ids.split(',').map((id: string) => id.trim()).filter((id: string) => id) : []

  // Use new structure if available, otherwise fall back to legacy
  const childTicketIds = childTickets.length > 0 
    ? childTickets.map(ct => ct.child_ticket_id.toString())
    : legacyChildTicketIds

  // If there are no valid IDs after parsing, don't render anything
  if (childTicketIds.length === 0) {
    return null
  }

  const handleRemoveClick = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSubmitting) return

    setSelectedTicketId(id)
    setIsSubmitting(true)

    try {
      const result = await unmergeChildTicket(id)

      if (result.success) {
        showToast({
          title: "Success",
          description: `Task #${id} has been successfully unmerged`,
          type: "success",
        })

        // Close edit mode after successful unmerge
        if (onEditModeChange) {
          onEditModeChange(false)
        }
      } else {
        showToast({
          title: "Error",
          description: result.error || "Failed to unmerge task",
          type: "error",
        })
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: "An unexpected error occurred while unmerging the task",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
      setSelectedTicketId(null)
    }
  }

  return (
    <>
      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Merged Task{childTicketIds.length > 1 ? 's' : ''}</div>
        <SkeletonText isLoading={isNavigating} className="w-full h-4">
          <div className="text-sm flex flex-wrap gap-1.5">
            {childTicketIds.map((id: string, index: number) => {
              // Find the child ticket details from the new structure
              const childTicketDetails = childTickets.find(ct => ct.child_ticket_id.toString() === id)?.ticket_details
              
              return (
                <div key={id} className="flex items-center">
                  {childTicketDetails ? (
                    <Popover open={openPopover === id} onOpenChange={(open) => setOpenPopover(open ? id : null)}>
                      <PopoverTrigger asChild>
                        <button 
                          className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                          onMouseEnter={() => setOpenPopover(id)}
                          onMouseLeave={() => setOpenPopover(null)}
                          onClick={(e) => {
                            e.preventDefault()
                            window.open(`/tasks/${id}`, '_blank')
                            setOpenPopover(null)
                          }}
                        >
                          #{id}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-50 p-0" 
                        align="start"
                        onMouseEnter={() => setOpenPopover(id)}
                        onMouseLeave={() => setOpenPopover(null)}
                      >
                        <TaskCard 
                          task={childTicketDetails} 
                          compact={false}
                          onClick={() => {
                            window.open(`/tasks/${id}`, '_blank')
                            setOpenPopover(null)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Link 
                      href={`/tasks/${id}`} 
                      target="_blank"
                      className="text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      #{id}
                    </Link>
                  )}
                  
                  {editMode && (
                    <button
                      onClick={(e) => handleRemoveClick(id, e)}
                      className="ml-1 p-0.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label={`Remove merged task #${id}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && selectedTicketId === id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                    </button>
                  )}
                  {index < childTicketIds.length - 1 && ', '}
                </div>
              )
            })}
          </div>
        </SkeletonText>
      </div>
    </>
  )
}
