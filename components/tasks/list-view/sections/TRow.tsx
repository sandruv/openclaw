'use client'
import { TableRow, TableCell } from "@/components/ui/table"
import { useTasksStore } from "@/stores/useTasksStore"
import { cn } from "@/lib/utils"
import { Task } from "@/types/tasks"
import { TaskContextMenu } from "./TaskContextMenu"
import {
  SelectColumn,
  TaskIdColumn,
  StatusColumn,
  SummaryColumn,
  TypeColumn,
  PriorityColumn,
  ImpactColumn,
  ClientColumn,
  AssigneeColumn,
  TriagerColumn,
  DatesColumn,
  RunningTimeColumn,
  UpdatedDateColumn,
  // ViewersColumn
} from "./columns"

interface TaskTableRowProps {
  task: Task
  onTaskClick: (task: Task) => void
  isSelected?: boolean
  onSelect?: (taskId: number, selected: boolean) => void
  activeTimerSeconds?: number
}

export function TaskTableRow({ task, onTaskClick, isSelected = false, onSelect, activeTimerSeconds }: TaskTableRowProps) {
  const { columns } = useTasksStore()
  const taskUrl = `/tasks/${task.id}`
  
  return (
    <TaskContextMenu task={task} onViewTask={onTaskClick}>
      <TableRow 
        data-testid={`task-row-${task.id}`}
        onClick={() => onTaskClick(task)} 
        className={cn(
          "cursor-pointer hover:bg-muted/50 relative",
        )}
      >
      
      {/* Selection checkbox column */}
      {onSelect && (
        <SelectColumn 
          taskId={task.id}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      )}
      
      {/* Keep existing columns */}
      <TaskIdColumn id={task.id} />
      
      {columns.running_time && (
        <RunningTimeColumn 
          seconds={task.running_time} 
          activeSeconds={activeTimerSeconds}
        />
      )}
      
      <StatusColumn statusName={task.status.name} />
      
      {columns.summary && (
        <SummaryColumn summary={task.summary} />
      )}
      
      {columns.type && (
        <TypeColumn typeName={task.ticket_type?.name} />
      )}
      
      {columns.priority && (
        <PriorityColumn priorityName={task.priority?.name} />
      )}
      
      {columns.impact && (
        <ImpactColumn impactName={task.impact?.name} />
      )}
      
      {columns.client && (
        <ClientColumn client={task.client} />
      )}
      
      {columns.assignee && (
        <AssigneeColumn agent={task.agent} />
      )}
      
      {columns.created_by && (
        <TriagerColumn triager={task.triager} />
      )}
      
      {columns.created_date && (
        <DatesColumn 
          createdAt={task.created_at} 
        />
      )}
      
      {columns.updated_date && (
        <UpdatedDateColumn lastUpdated={task.updated_at} dateClosed={task.date_closed} />
      )}
      
      {/* {columns.viewers && ( */}
        {/* <ViewersColumn taskId={task.id} /> */}
      {/* )} */}

    </TableRow>
    </TaskContextMenu>
  )
}