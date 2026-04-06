'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Info, X, Merge } from "lucide-react"
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { useTaskSelectionStore } from '@/stores/useTaskSelectionStore'
import { useToast } from "@/components/ui/toast-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { VipIndicator } from "@/components/custom/vip-indicator"
import { Task } from '@/types/tasks'
import { searchSimilarTasks, searchTasksBySummary, mergeTasks } from '@/services/bulkActionService'
import { getStatusColor, StatusType } from '@/lib/taskUtils'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, getAvatarColor } from "@/lib/utils"
import { TaskStatusType } from '@/lib/taskStatusIdProvider';

interface MergeTasksDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentTaskId: number
}

export function MergeTasksDialog({
  isOpen,
  onClose,
  onSuccess,
  currentTaskId
}: MergeTasksDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Task[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasInitialSearch, setHasInitialSearch] = useState(false)
  const [inputInterval, setInputInterval] = useState<NodeJS.Timeout | null>(null)
  const { showToast } = useToast()
  const { task } = useTaskDetailsStore()
  const {
    selectedTaskIds,
    selectTask,
    clearSelection,
    isTaskSelected,
    getSelectedTaskIds,
    setAvailableTaskIds
  } = useTaskSelectionStore()

  const initials = getInitials(`${(task?.agent?.first_name || '').trim()} ${(task?.agent?.last_name || '').trim()}`.trim() || 'U')
  const agentAvatarColor = getAvatarColor(task?.agent?.id ?? 0)

  // Define handleInitialSearch with useCallback to prevent re-creation on each render
  const handleInitialSearch = useCallback(async () => {
    if (!task?.summary) return
    
    setIsSearching(true)
    try {
      const response = await searchSimilarTasks({
        summary: task.summary,
        excludeId: currentTaskId,
        limit: 10
      })
      
      if (response.status === 200 && response.data) {
        setSearchResults(response.data)
        setAvailableTaskIds(response.data.map(t => t.id))
        setHasInitialSearch(true)
      }
    } catch (error) {
      console.error('Error loading similar tasks:', error)
    } finally {
      setIsSearching(false)
    }
  }, [task, currentTaskId, setSearchResults, setAvailableTaskIds, setHasInitialSearch, setIsSearching])
  
  // Load similar tasks automatically when dialog opens
  useEffect(() => {
    if (isOpen && task && !hasInitialSearch) {
      handleInitialSearch()
    }
  }, [isOpen, task, hasInitialSearch, handleInitialSearch])

  // Clear selection when dialog closes
  useEffect(() => {
    if (!isOpen) {
      clearSelection()
      setSearchResults([])
      setSearchQuery('')
      setHasInitialSearch(false)
    }
  }, [isOpen, clearSelection])

  // handleInitialSearch moved above

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    try {
      const response = await searchTasksBySummary(searchQuery, 15)
      
      if (response.status === 200 && response.data) {
        const filteredResults = response.data.filter(t => t.id !== currentTaskId)
        setSearchResults(filteredResults)
        setAvailableTaskIds(filteredResults.map(t => t.id))
      } else {
        throw new Error(response.message || 'Search failed')
      }
    } catch (error) {
      console.error('Error searching tasks:', error)
      showToast({
        title: "Error",
        description: "Failed to search for tasks. Please try again.",
        type: "error"
      })
    } finally {
      setIsSearching(false)
    }
  }

  const toggleTaskSelection = (taskId: number) => {
    const isSelected = isTaskSelected(taskId)
    selectTask(taskId, !isSelected)
  }

  const handleConfirm = async () => {
    const selectedIds = getSelectedTaskIds()
    
    if (selectedIds.length === 0) {
      showToast({
        title: "Warning",
        description: "Please select at least one task to merge.",
        type: "warning"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await mergeTasks({
        targetTaskId: currentTaskId,
        sourceTaskIds: selectedIds,
        mergeOptions: {
          keepOriginalTasks: false,
          mergeActivities: true,
          mergeAttachments: true
        }
      })
      
      if (response.status === 200) {
        // Show toast notification with more detailed message
        showToast({
          title: "Successfully Merged",
          description: `Merged ${selectedIds.length} task(s) into #${currentTaskId}.`,
          type: "success"
        })
        
        // Call onSuccess to refresh the task details
        onSuccess()
        clearSelection()
        // Close the dialog
        onClose()
      } else {
        throw new Error(response.message || 'Merge failed')
      }
    } catch (error) {
      console.error('Error merging tasks:', error)
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to merge tasks. Please try again.",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing the dialog when loading
      if (isLoading) return;
      if (!open) onClose();
    }}>
      <AlertDialogContent className="max-w-[700px]">
        <AlertDialogHeader className="pr-8">
          <AlertDialogTitle>Merge Tasks</AlertDialogTitle>
          <AlertDialogDescription aria-label="Merge tasks description" className="hidden">
            Select tasks to merge into the current task. All content, activities, and files will be transferred.
          </AlertDialogDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 rounded-full p-0"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </AlertDialogHeader>

        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-400 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300 mt-1">Selected tasks will be merged into this ticket</AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-400">
            <p className="mb-0">
              All content, attachments, and history from the selected tasks will be added to this ticket, and the original tasks will be closed. 
            </p>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Search Form */}
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Input 
                placeholder="Search tasks by summary..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  clearSelection()
                  if (inputInterval) {
                    clearInterval(inputInterval)
                  }
                  const newInterval = setTimeout(() => {
                    handleSearch()
                  }, 500)
                  setInputInterval(newInterval)
                }}
                disabled={isLoading || isSearching}
                className="w-full pr-10"
              />
              {isSearching ? (
                <Loader2 className="absolute right-2 top-2 h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Search className="absolute right-2 top-2 h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="border rounded-md max-h-96 overflow-y-auto styled-scrollbar">
            {searchResults.length > 0 ? (
              <div className="">
                {searchResults.map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-4 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors  ${
                      isTaskSelected(task.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : 'border-t-2 border-gray-100 dark:border-gray-900'
                    }`}
                    onClick={() => isLoading ? null : toggleTaskSelection(task.id)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>  
                      <Checkbox
                        checked={isTaskSelected(task.id)}
                        onCheckedChange={() => {
                          toggleTaskSelection(task.id);
                        }}
                        className="mt-1"
                        disabled={isLoading}
                        aria-label={`Select task #${task.id} - ${task.summary}`}
                      />
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="font-medium text-sm">#{task.id} - {task.summary}</div>
                      <div className="flex flex-wrap gap-2">
                        {/* Status Pill */}
                        <div className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                          getStatusColor(task.status.name.toLowerCase() as StatusType, 'bg-'),
                          task.status.id === TaskStatusType.Archived ? "text-black" : "text-white"
                        )}>
                          {task.status.name}
                        </div>
                        
                        {/* Client Pill */}
                        <div className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-xs font-medium bg-gray-800 dark:bg-gray-800 text-white dark:text-gray-300">
                          {task.client.name}
                          {task.client.is_client_vip && (
                            <VipIndicator scale={4} rounded="full" className="ml-1" />
                          )}
                        </div>
                        
                        {/* Agent Pill */}
                        {task.agent && (
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className={`${agentAvatarColor} text-white`} style={{ fontSize: '0.6rem' }}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasInitialSearch && !isSearching ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                {searchQuery ? 'No tasks found matching your search.' : 'No similar tasks found.'}
              </div>
            ) : !hasInitialSearch && !searchQuery && !isSearching ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Loading similar tasks...
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Search for tasks to merge with this one.
              </div>
            )}
          </div>
          
          {selectedTaskIds.size > 0 && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <Merge className="h-4 w-4 text-green-400 dark:text-green-400" />
              <AlertTitle className="text-green-700 dark:text-green-300 mt-[5px]">{selectedTaskIds.size} task(s) selected for merging into #{currentTaskId} - {task?.summary}</AlertTitle>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={handleConfirm}
            disabled={isLoading || selectedTaskIds.size === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Merging...
              </>
            ) : (
              'Merge Selected'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
