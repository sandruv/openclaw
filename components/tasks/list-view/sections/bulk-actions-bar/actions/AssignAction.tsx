'use client'

import { useState, useEffect, useMemo } from 'react'
import { UserCheck, ChevronUp, Loader2 } from 'lucide-react'
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
import { SubMenuSelect } from '@/components/ui/submenu-select'
import { useDropdownStore } from '@/stores/useDropdownStore'
import { useTaskSelectionStore } from '@/stores/useTaskSelectionStore'
import { useTasksStore } from '@/stores/useTasksStore'

interface AssignActionProps {
  // No props needed - using stores directly
}

export function AssignAction({}: AssignActionProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const { showToast } = useToast()
  const { agents, fetchAgents, isLoading: isLoadingAgents } = useDropdownStore()
  
  // Get data from stores directly
  const { selectedTaskIds: selectedTaskIdsStore, selectedCount, getSelectedTaskIds, assignTasks } = useTaskSelectionStore()
  const { tasks } = useTasksStore()
  
  // Memoize selected task IDs to prevent infinite loops
   // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedTaskIds = useMemo(() => getSelectedTaskIds(), [selectedTaskIdsStore])

  // Fetch agents on mount (only if not already loaded)
  useEffect(() => {
    if (agents.length === 0) {
      fetchAgents() // Agents are always client_id=1, cached in store
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  const handleAssign = async () => {
    if (!isAssigning && selectedAssignee) {
      setIsAssigning(true)
      try {
        const result = await assignTasks(undefined, parseInt(selectedAssignee, 10))
        setDropdownOpen(false)
        
        // Show toast notification
        showToast({
          title: result.success ? "Tasks Assigned" : "Assignment Failed",
          description: result.message,
          type: result.success ? "success" : "error",
        })
      } catch (error) {
        showToast({
          title: "Assignment Error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          type: "error",
        })
      } finally {
        setIsAssigning(false)
        setSelectedAssignee('') // Reset selection after assignment
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
          <UserCheck className="h-3 w-3" />
          Assign
          <ChevronUp className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-80 bg-gray-800 border border-gray-600">
        <DropdownMenuLabel className="text-left text-white">
          Assign the following task{selectedCount !== 1 ? 's' : ''}:
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-gray-600' />
        <div className="p-4">
        <div className="mb-4">
            <SubMenuSelect
              options={agents}
              value={selectedAssignee}
              onValueChange={setSelectedAssignee}
              placeholder="Select an assignee"
              triggerLabel={isLoadingAgents ? "Loading..." : "Assignee"}
              emptyMessage="No agents found"
              includeUnselect={false}
              disabled={isLoadingAgents}
            />
          </div>

          <div className="max-h-[120px] overflow-y-auto styled-scrollbar mb-4 p-2 bg-gray-700 rounded text-xs text-white">
            {selectedTaskIds.map((taskId: number) => {
              const task = tasks.find(t => t.id === taskId);
              return (
                <div key={taskId} className="mb-1 last:mb-0">
                  #{taskId} {task?.summary && `- ${task.summary.substring(0, 30)}${task.summary.length > 30 ? '...' : ''}`}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleAssign}
              size="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isAssigning || !selectedAssignee}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Confirm Assignment'
              )}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
