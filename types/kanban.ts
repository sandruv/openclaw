import { Task } from '@/types/tasks'
import { BatchActiveTimerInfo } from '@/services/timerService'

export type KanbanViewType = 'status' | 'assignee' | 'client';
/**
 * Kanban column data interface
 */
export interface KanbanColumnData {
  id: number
  title: string
  tasks: Task[]
}

/**
 * Kanban board props interface
 */
export interface KanbanBoardProps {
  columns: KanbanColumnData[]
  viewType: KanbanViewType
  isRefreshing?: boolean
  activeTimers?: Record<number, BatchActiveTimerInfo>
}

/**
 * Kanban column props interface
 */
export interface KanbanColumnProps {
  id: number
  title: string
  headerColor: string
  count: number
  children: React.ReactNode
  viewType: KanbanViewType
}

/**
 * Kanban card props interface
 */
export interface KanbanCardProps {
  task: Task
  index: number
  columnId: number
  activeSeconds?: number
}

/**
 * Drag item interface for react-dnd
 */
export interface DragItem {
  id: string
  index: number
  type: string
  columnId: number
}