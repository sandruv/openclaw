'use client'

import { Table, TableBody } from "@/components/ui/table"
import { TaskFilters } from './sections/filters'
import { TaskTableHeader } from './sections/THeader'
import { TaskTableRow } from './sections/TRow'
import { BulkActionsBar } from './sections/bulk-actions-bar'
import { TaskGroupSection } from './sections/TaskGroupSection'
import { useTasksStore } from '@/stores/useTasksStore'
import { TaskTableSkeleton } from './loaders/TaskTableSkeleton'
import { ColumnSelector } from './sections/ColumnSelector'
import { ExportButton } from './sections/ExportButton'
import { Spinner } from "@/components/ui/spinner"
import { ErrorState } from './error'
import { EmptyState } from './empty'
import { IndeterminateProgress } from "@/components/custom/IndeterminateProgress"
import { useTaskTable } from './hooks/useTaskTable'

export default function TaskTable() {
    const {
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
    } = useTaskTable()
    
    // Use different loading behavior based on context
    // 1. Show skeleton on initial load only (not for search/filter)
    // 2. Keep showing current content during real-time updates with a linear loader
    // 3. Handle normal loading state for user-initiated actions (not real-time updates)
    if (isLoading && !initialLoadComplete) {
        // First time loading, show skeleton
        return <TaskTableSkeleton />
    }
    
    // For searching, filtering, and real-time updates, we'll show a linear loader
    // but still render the existing content
    
    // Render error state
    if (error) return (
        <ErrorState error={error} onRetry={() => fetchTasks(true)} />
    )

    // Render empty state
    if (!tasks || tasks.length === 0 || !Array.isArray(tasks)) {
        // Check if there are any active filters
        const hasActiveFilters = Object.values(useTasksStore.getState().filters).some(filter => filter !== '') || 
                               useTasksStore.getState().search !== '';
        
        return (
            <>
                <div className="flex justify-between items-start px-4 pt-4">
                <TaskFilters
                    clients={clientOptions}
                    assignees={assigneeOptions}
                    isSearching={isSearching}
                    isFiltering={isFiltering}
                />

                <div className="flex items-start space-x-2">
                    <ExportButton />
                    <ColumnSelector />
                </div>
            </div>
            {(isSearching || isFiltering || isGroupByPending) && <IndeterminateProgress />}
            <Table className="mb-2">
                <TaskTableHeader 
                    showSelection={true}
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onSelectAll={selectAllTasks}
                />
            </Table>
                <EmptyState 
                    hasFilters={hasActiveFilters}
                    onClearFilters={() => useTasksStore.getState().resetFilters()}
                />
            </>
        )
    }

    // Render tasks list
    return (
        <div>
            <div className="flex justify-between items-start px-4 pt-4">
                <TaskFilters
                    clients={clientOptions}
                    assignees={assigneeOptions}
                    isSearching={isSearching}
                    isFiltering={isFiltering}
                />

                <div className="flex items-start space-x-2">
                    <ExportButton />
                    <ColumnSelector />
                </div>
            </div>
            
            <div 
                ref={tableContainerRef}
                style={{ position: 'relative', overflowY: 'auto' }}>

                {(isLoading || isLoadingMore || isSearching || isFiltering || isGroupByPending) && <IndeterminateProgress />}
                
                <Table data-testid="task-list" className="relative">
                    <TaskTableHeader 
                        showSelection={true}
                        isAllSelected={isAllSelected}
                        isIndeterminate={isIndeterminate}
                        onSelectAll={selectAllTasks}
                    />
                    <TableBody>
                        {deferredGroupBy === 'none' ? (
                            // Render flat list when no grouping
                            <>
                                {currentTasks.length > 0 && currentTasks.map((task) => (
                                    <TaskTableRow
                                        key={task.id}
                                        task={task}
                                        onTaskClick={() => handleTaskClick(task)}
                                        isSelected={isTaskSelected(task.id)}
                                        onSelect={selectTask}
                                        activeTimerSeconds={activeTimers[task.id]?.elapsedSeconds}
                                    />
                                ))}
                            </>
                        ) : (
                            // Render grouped tasks
                            <>
                                {groupedTasks && Object.entries(groupedTasks).map(([groupKey, group]) => (
                                    <TaskGroupSection
                                        key={groupKey}
                                        title={group.label}
                                        count={group.tasks.length}
                                    >
                                        {group.tasks.map((task) => (
                                            <TaskTableRow
                                                key={task.id}
                                                task={task}
                                                onTaskClick={() => handleTaskClick(task)}
                                                isSelected={isTaskSelected(task.id)}
                                                onSelect={selectTask}
                                                activeTimerSeconds={activeTimers[task.id]?.elapsedSeconds}
                                            />
                                        ))}
                                    </TaskGroupSection>
                                ))}
                            </>
                        )}
                        
                        {/* Loading indicator */}
                        {isLoadingMore && (
                            <tr>
                                <td colSpan={8} className="text-center py-4">
                                    <div className="flex items-center justify-center">
                                        <Spinner color="green" />
                                        <span className="ml-2 text-green-500">Loading more...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        
                        {/* End of list indicator */}
                        {!isLoadingMore && !pagination.hasNextPage && tasks.length > 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-4 text-gray-500">
                                    End of list • {tasks.length} tasks
                                </td>
                            </tr>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Bulk Actions Bar */}
            <BulkActionsBar />
        </div>
    )
}
