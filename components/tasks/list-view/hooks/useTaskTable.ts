'use client'

import { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue } from 'react'
import { useRouter } from 'next/navigation'
import { useTasksStore } from '@/stores/useTasksStore'
import { useTaskSelectionStore } from '@/stores/useTaskSelectionStore'
import { ComboboxOption } from '@/components/ui/combobox'
import pusherService from '@/services/pusherService'
import { useToast } from '@/hooks/useToast'
import { Task } from '@/types/tasks'
import { useLoader } from '@/contexts/LoaderContext'
import { TaskStatusType } from '@/lib/taskStatusIdProvider'
import { getBatchActiveTimers, BatchActiveTimerInfo } from '@/services/timerService'
import { MY_TASKS_STATUS_ORDER } from '../constants'

export function useTaskTable() {
    // Initialize all hooks at the top level
    const router = useRouter()
    const { 
        tasks, 
        fetchTasks, 
        loadMoreTasks, 
        isLoading, 
        isLoadingMore, 
        initialLoadComplete, 
        isSearching, 
        isFiltering, 
        pagination, 
        error, 
        myTasksSorting, 
        groupBy 
    } = useTasksStore()
    
    // Use deferred value for groupBy to keep UI responsive during heavy renders
    const deferredGroupBy = useDeferredValue(groupBy)
    const isGroupByPending = groupBy !== deferredGroupBy
    const { showToast } = useToast()
    const { setIsLoading: setRouteLoading } = useLoader()

    // Task selection functionality
    const availableTaskIds = useMemo(() => tasks.map(task => task.id), [tasks])
    const selectedTaskIds = useTaskSelectionStore((state) => state.selectedTaskIds)
    const setAvailableTaskIds = useTaskSelectionStore((state) => state.setAvailableTaskIds)
    const selectTask = useTaskSelectionStore((state) => state.selectTask)
    const selectAllTasks = useTaskSelectionStore((state) => state.selectAllTasks)
    const clearSelection = useTaskSelectionStore((state) => state.clearSelection)
    const setMergeIntoTaskId = useTaskSelectionStore((state) => state.setMergeIntoTaskId)
    const isTaskSelected = useTaskSelectionStore((state) => state.isTaskSelected)
    
    // Use memoized selector for selection stats to prevent unnecessary recalculations
    const getSelectionStats = useTaskSelectionStore((state) => state.getSelectionStats)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selectionStats = useMemo(() => getSelectionStats(), [selectedTaskIds.size])
    const { isAllSelected, isIndeterminate } = selectionStats

    // State hooks
    const [isRealTimeUpdate, setIsRealTimeUpdate] = useState(false)
    const [activeTimers, setActiveTimers] = useState<Record<number, BatchActiveTimerInfo>>({})
    const tableContainerRef = useRef<HTMLDivElement>(null)

    // Current visible tasks - apply custom My Tasks sorting if enabled
    const currentTasks = useMemo(() => {
        if (!myTasksSorting) {
            return tasks
        }

        // Apply custom sorting for My Tasks
        return [...tasks].sort((a, b) => {
            // First, sort by status order
            const aStatusId = a.status?.id || 999
            const bStatusId = b.status?.id || 999
            const aStatusOrder = MY_TASKS_STATUS_ORDER[aStatusId] ?? 999
            const bStatusOrder = MY_TASKS_STATUS_ORDER[bStatusId] ?? 999
            
            if (aStatusOrder !== bStatusOrder) {
                return aStatusOrder - bStatusOrder
            }
            
            // Then sort by created_at (newest first)
            const aCreatedAt = new Date(a.created_at).getTime()
            const bCreatedAt = new Date(b.created_at).getTime()
            
            return bCreatedAt - aCreatedAt
        })
    }, [tasks, myTasksSorting])

    // Group tasks by the selected field (uses deferred value for responsive UI)
    const groupedTasks = useMemo(() => {
        if (deferredGroupBy === 'none') {
            return null
        }

        const groups: Record<string, { label: string; tasks: Task[] }> = {}

        currentTasks.forEach(task => {
            let groupKey: string
            let groupLabel: string

            switch (deferredGroupBy) {
                case 'status':
                    groupKey = task.status?.id?.toString() || 'unknown'
                    groupLabel = task.status?.name || 'Unknown Status'
                    break
                case 'assignee':
                    groupKey = task.agent?.id?.toString() || 'unassigned'
                    groupLabel = task.agent ? `${(task.agent.first_name || '').trim()} ${(task.agent.last_name || '').trim()}`.trim() || 'Unknown' : 'Unassigned'
                    break
                case 'client':
                    groupKey = task.client?.id?.toString() || 'unknown'
                    groupLabel = task.client?.name || 'Unknown Client'
                    break
                case 'priority':
                    groupKey = task.priority?.id?.toString() || 'unknown'
                    groupLabel = task.priority?.name || 'Unknown Priority'
                    break
                case 'impact':
                    groupKey = task.impact?.id?.toString() || 'unknown'
                    groupLabel = task.impact?.name || 'Unknown Impact'
                    break
                case 'type':
                    groupKey = task.ticket_type?.id?.toString() || 'unknown'
                    groupLabel = task.ticket_type?.name || 'Unknown Type'
                    break
                default:
                    groupKey = 'all'
                    groupLabel = 'All Tasks'
            }

            if (!groups[groupKey]) {
                groups[groupKey] = { label: groupLabel, tasks: [] }
            }
            groups[groupKey].tasks.push(task)
        })

        console.log("grouping done")
        return groups
    }, [currentTasks, deferredGroupBy])

    // Handle pusher events by refetching tasks with toast notification
    const handleTaskEvent = useCallback(() => {
        // Show toast notification for incoming updates
        showToast({
            title: 'Updates incoming',
            description: 'Task list is being refreshed with latest changes',
            type: 'info',
            duration: 3000
        })

        // Set flag that this is a real-time update before fetching
        setIsRealTimeUpdate(true)
        // Pass true to refresh parameter to replace tasks instead of appending them
        fetchTasks(true).finally(() => {
            // Reset the flag after fetch completes (whether successful or not)
            setTimeout(() => setIsRealTimeUpdate(false), 300) // Small delay to ensure UI updates properly
        })
    }, [fetchTasks, showToast])

    // Load more items when user scrolls to bottom
    const loadMoreItems = useCallback(() => {
        // Only trigger if we have a next page and aren't already loading
        if (pagination.hasNextPage && !isLoadingMore && !isLoading) {
            loadMoreTasks()
        }
    }, [pagination.hasNextPage, isLoadingMore, isLoading, loadMoreTasks])

    // Handle scroll event to detect when user reaches bottom
    const handleScroll = useCallback((event: Event) => {
        // Use the actual event target as the scrollable element
        
        const scrollElement = event.target as HTMLDivElement
        if (!scrollElement) return
        
        const { scrollTop, scrollHeight, clientHeight } = scrollElement
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight
        
        // Load more when user scrolls to within 200px of the bottom
        if (distanceFromBottom < 100) {
            loadMoreItems()
        }
    }, [loadMoreItems])

    // Fetch active timers for In Progress tasks
    const fetchActiveTimers = useCallback(async () => {
        console.log("fetch")
        // Get all In Progress task IDs
        const inProgressTaskIds = tasks
            .filter(task => task.status.id === TaskStatusType.InProgress)
            .map(task => task.id);

        if (inProgressTaskIds.length === 0) {
            setActiveTimers({});
            return;
        }

        try {
            const response = await getBatchActiveTimers(inProgressTaskIds);
            if (response.status === 200 && response.data) {
                setActiveTimers(response.data);
            }
        } catch (error) {
            console.error('Error fetching active timers:', error);
        }
    }, [tasks]);

    // Handle task click
    const handleTaskClick = useCallback((task: Task) => {
        setRouteLoading(true) // Show loader immediately
        router.push(`/tasks/${task.id}`)
    }, [router, setRouteLoading])

    // Generate client options from tasks data
    const clientOptions = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return []

        const uniqueClients = new Map()
        tasks.forEach(task => {
            if (task.client && task.client.id) {
                uniqueClients.set(task.client.id, {
                    value: task.client.id.toString(),
                    label: task.client.name
                })
            }
        })

        return Array.from(uniqueClients.values()) as ComboboxOption[]
    }, [tasks])

    // Generate assignee options from tasks data
    const assigneeOptions = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return []

        const uniqueAssignees = new Map()
        tasks.forEach(task => {
            if (task.agent && task.agent.id) {
                const fullName = `${(task.agent.first_name || '').trim()} ${(task.agent.last_name || '').trim()}`.trim()
                uniqueAssignees.set(task.agent.id, {
                    value: task.agent.id.toString(),
                    label: fullName || 'Unknown User'
                })
            }
        })

        return Array.from(uniqueAssignees.values()) as ComboboxOption[]
    }, [tasks])

    // Update available task IDs when tasks change
    useEffect(() => {
        setAvailableTaskIds(availableTaskIds)
    }, [availableTaskIds, setAvailableTaskIds])

    // Fetch tasks on component mount and track initial load
    useEffect(() => {
        if (tasks.length === 0 && !initialLoadComplete) {
            fetchTasks(true)
        }
    }, [fetchTasks, tasks, initialLoadComplete])

    // Fetch active timers when tasks change
    useEffect(() => {
        if (tasks.length > 0) {
            fetchActiveTimers();
        }
    }, [tasks, fetchActiveTimers])
    
    // Add scroll listener to detect when user scrolls to bottom
    useEffect(() => {
        // Find the actual scrollable div with styled-scrollbar class
        // It's in the table component rather than our direct ref
        const scrollableDiv = document.querySelector('.overflow-y-auto.styled-scrollbar')
        if (!scrollableDiv) return
        
        // Add scroll event listener to the actual scrollable container
        scrollableDiv.addEventListener('scroll', handleScroll)
        
        // Clean up listener on unmount
        return () => {
            scrollableDiv.removeEventListener('scroll', handleScroll)
        }
    }, [handleScroll])

    // Subscribe to Pusher events for real-time updates
    useEffect(() => {
        // Subscribe to task updates using pusherService
        const unsubscribeUpdates = pusherService.subscribeToTaskUpdates(handleTaskEvent)
        const unsubscribeCreation = pusherService.subscribeToTaskCreation(handleTaskEvent)
        const unsubscribeDeletion = pusherService.subscribeToTaskDeletion(handleTaskEvent)
    
        // Clean up subscriptions on unmount
        return () => {
            unsubscribeUpdates()
            unsubscribeCreation()
            unsubscribeDeletion()
        }
    }, [handleTaskEvent])

    return {
        // State
        tasks,
        currentTasks,
        groupedTasks,
        activeTimers,
        isLoading,
        isLoadingMore,
        isSearching,
        isFiltering,
        isGroupByPending,
        initialLoadComplete,
        pagination,
        error,
        deferredGroupBy,
        
        // Selection
        isAllSelected,
        isIndeterminate,
        isTaskSelected,
        selectTask,
        selectAllTasks,
        
        // Refs
        tableContainerRef,
        
        // Options
        clientOptions,
        assigneeOptions,
        
        // Actions
        fetchTasks,
        handleTaskClick,
    }
}
