'use client'

import { useState, useMemo, useEffect } from 'react'
import { Archive, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/useToast'
import { useTaskSelectionStore } from '@/stores/useTaskSelectionStore'
import { useTasksStore } from '@/stores/useTasksStore'

interface ArchiveActionProps {
  // No props needed - using stores directly
}

export function ArchiveAction({}: ArchiveActionProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const { showToast } = useToast()
  
  // Get data from stores directly
  const { selectedTaskIds: selectedTaskIdsStore, selectedCount, getSelectedTaskIds, archiveTasks } = useTaskSelectionStore()
  const { tasks } = useTasksStore()
  
  // Memoize selected task IDs to prevent infinite loops
  const selectedTaskIds = useMemo(() => {
    const array = getSelectedTaskIds()
    return array
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaskIdsStore])

  const handleArchive = async () => {
    if (!isArchiving) {
      setIsArchiving(true)
      try {
        const result = await archiveTasks()
        setDropdownOpen(false)
        
        // Show toast notification
        showToast({
          title: result.success ? "Tasks Archived" : "Archive Failed",
          description: result.message,
          type: result.success ? "success" : "error",
        })
      } catch (error) {
        showToast({
          title: "Archive Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          type: "error",
        })
      } finally {
        setIsArchiving(false)
      }
    }
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs flex items-center gap-2 hover:bg-white hover:text-black"
        >
          <Archive className="h-3 w-3" />
          Archive
          <ChevronUp className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-80 bg-gray-800 border border-gray-600 text-white">
        <DropdownMenuLabel className="text-left">
          Archiving the following task{selectedCount !== 1 ? 's' : ''}:
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-gray-600' />
        <div className="p-4">
          <div className="max-h-[120px] overflow-y-auto styled-scrollbar mb-4 p-2 bg-gray-700 rounded text-xs">
            {selectedTaskIds.map((taskId: number) => {
              const task = tasks.find(t => t.id === taskId);
              return (
                <div key={taskId} className="mb-1 last:mb-0">
                  #{taskId} {task?.summary && `- ${task.summary.substring(0, 30)}${task.summary.length > 30 ? '...' : ''}`}
                </div>
              );
            })}
          </div>
          {/* <div className="text-xs text-yellow-300 mb-4">
            This action will archive {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''}.
            Archived tasks can be viewed in the archive section.
          </div> */}
          <div className="flex justify-end">
            <Button
              onClick={handleArchive}
              size="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isArchiving}
            >
              {isArchiving ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Archiving...
                </>
              ) : (
                'Confirm Archive'
              )}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
