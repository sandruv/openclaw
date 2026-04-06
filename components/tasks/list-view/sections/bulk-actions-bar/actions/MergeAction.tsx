'use client'

import { useState, useMemo } from 'react'
import { Merge, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTaskSelectionStore } from '@/stores/useTaskSelectionStore'
import { useTasksStore } from '@/stores/useTasksStore'
import { useToast } from '@/hooks/useToast'

interface MergeActionProps {
  // No props needed - using stores directly
}

export function MergeAction({}: MergeActionProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const { showToast } = useToast()
  
  // Get data from stores directly
  const { 
    selectedTaskIds: selectedTaskIdsStore, 
    selectedCount, 
    getSelectedTaskIds, 
    mergeIntoTaskId, 
    setMergeIntoTaskId, 
    mergeTasks 
  } = useTaskSelectionStore()
  const { tasks } = useTasksStore()
  
  // Get selected tasks to choose merge target from (memoized to prevent infinite loops)
   // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedTaskIds = useMemo(() => getSelectedTaskIds(), [selectedTaskIdsStore])
  const selectedTasks = useMemo(() => 
    tasks.filter(task => selectedTaskIds.includes(task.id)), 
    [tasks, selectedTaskIds]
  )
  // Get the selected merge target task for display
  const selectedMergeTarget = useMemo(() => 
    selectedTasks.find(task => task.id === mergeIntoTaskId),
    [selectedTasks, mergeIntoTaskId]
  )

  const handleMerge = async () => {
    if (mergeIntoTaskId && !isMerging) {
      setIsMerging(true)
      try {
        const result = await mergeTasks()
        setDropdownOpen(false)
        
        // Show toast notification
        showToast({
          title: result.success ? 'Merge Complete' : 'Merge Failed',
          description: result.message,
          type: result.success ? 'success' : 'error'
        })
      } finally {
        setIsMerging(false)
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
          disabled={selectedCount < 2}
        >
          <Merge className="h-3 w-3" />
          Merge
          <ChevronUp className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-80 bg-gray-800 border border-gray-600 text-white">
        <DropdownMenuLabel>
          {selectedMergeTarget 
            ? `Task merge into #${selectedMergeTarget.id}`
            : "Select task to merge into"
          }
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-gray-600' />
        <div className="max-h-[200px] overflow-y-scroll styled-scrollbar">
          {selectedTasks.length === 0 ? (
            <DropdownMenuItem disabled>
              No selected tasks available
            </DropdownMenuItem>
          ) : (
            selectedTasks.map((task) => (
              <DropdownMenuItem
                key={task.id}
                onSelect={(e) => {
                  e.preventDefault()
                  setMergeIntoTaskId(task.id)
                }}
                className={cn(
                  "flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-gray-100",
                  mergeIntoTaskId === task.id && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                )}
              >
                <span className="font-medium text-sm">#{task.id.toString()}</span>
                <span className="text-sm truncate flex-1">
                  {task.summary}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className='bg-gray-600' />
        <div className="p-3">
          <div className="flex justify-between gap-3">
            <div className="text-xs text-gray-100 leading-relaxed">
              Select the parent task. <br/> 
            </div>

            <Button
              onClick={() => handleMerge()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              disabled={!mergeIntoTaskId || isMerging}
            >
              {isMerging ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Merging...
                </>
              ) : (
                'Merge'
              )}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
