import { Task } from '@/types/tasks'
import { KanbanColumnData } from '@/types/kanban'
import { TaskStatusRecord } from '@/lib/taskStatusIdProvider'
import { STATUS_ORDER } from '@/constants/kanban'

/**
 * Prevents duplicate tasks from being added to columns
 */
function preventDuplicates(tasks: Task[], callback: (task: Task) => void) {
  const processedTaskIds = new Set<number>()
  
  tasks.forEach((task: Task) => {
    if (processedTaskIds.has(task.id)) {
      console.warn(`Duplicate task detected: ${task.id}`)
      return
    }
    processedTaskIds.add(task.id)
    callback(task)
  })
}

/**
 * Group tasks by status
 * Creates columns for all available statuses and sorts them by STATUS_ORDER
 */
export function groupByStatus(
  tasks: Task[],
  allStatuses: TaskStatusRecord[]
): Map<number, KanbanColumnData> {
  const grouped = new Map<number, KanbanColumnData>()
  
  // Create a column for each status, regardless of whether there are tasks
  allStatuses.forEach(status => {
    grouped.set(status.id, {
      id: status.id,
      title: status.name,
      tasks: []
    })
  })
  
  // Add tasks to their respective columns
  preventDuplicates(tasks, (task) => {
    const status_id = task.status.id
    
    // The column should already exist, but check just in case
    if (!grouped.has(status_id)) {
      grouped.set(status_id, {
        id: status_id,
        title: task.status.name,
        tasks: []
      })
    }
    
    grouped.get(status_id)?.tasks.push({ ...task })
  })
  
  // Sort columns by predefined order from constants
  return new Map(
    [...grouped.entries()].sort((a, b) => {
      return (STATUS_ORDER[a[0]] || 999) - (STATUS_ORDER[b[0]] || 999)
    })
  )
}

/**
 * Group tasks by assignee
 * Creates columns for all assignees found in tasks
 * Sorts tasks within columns by assignee_order
 */
export function groupByAssignee(tasks: Task[]): Map<number, KanbanColumnData> {
  const grouped = new Map<number, KanbanColumnData>()
  const assigneeMap = new Map<number, string>()
  
  // Create columns for all assignees (avoid duplicates)
  tasks.forEach((task: Task) => {
    const assigneeId = task.agent?.id || 0
    if (assigneeId !== 0 && !assigneeMap.has(assigneeId)) {
      const agent = task.agent
      const hasValidName = agent && (agent.first_name || agent.last_name)
      const assigneeName = hasValidName
        ? `${(agent.first_name || '').trim()} ${(agent.last_name || '').trim()}`.trim()
        : 'Unknown Agent'
      assigneeMap.set(assigneeId, assigneeName)
    }
  })
  
  // Always include an "Unassigned" column for tasks without an agent
  grouped.set(0, {
    id: 0,
    title: 'Unassigned',
    tasks: []
  })
  
  // Initialize columns with empty task arrays
  assigneeMap.forEach((name, id) => {
    grouped.set(id, {
      id,
      title: name,
      tasks: []
    })
  })
  
  // Add tasks to their respective columns
  preventDuplicates(tasks, (task) => {
    const assigneeId = task.agent?.id || 0
    const column = grouped.get(assigneeId)
    if (column) {
      column.tasks.push({ ...task })
    } else {
      console.warn(`Column not found for assigneeId: ${assigneeId}`)
    }
  })
  
  // Sort tasks within each column by assignee_order
  grouped.forEach(column => {
    column.tasks.sort((a, b) => {
      // Use assignee_order if available, otherwise fallback to ID
      const orderA = a.assignee_order !== undefined ? a.assignee_order : Number.MAX_SAFE_INTEGER
      const orderB = b.assignee_order !== undefined ? b.assignee_order : Number.MAX_SAFE_INTEGER
      
      // If orders are the same, sort by ID for stability
      if (orderA === orderB) {
        return a.id - b.id
      }
      
      return orderA - orderB
    })
  })
  
  // Sort columns: Unassigned (id: 0) first, then others alphabetically by name
  return new Map(
    [...grouped.entries()].sort((a, b) => {
      // Unassigned column (id: 0) always comes first
      if (a[0] === 0) return -1
      if (b[0] === 0) return 1
      
      // Sort other columns alphabetically by title
      return a[1].title.localeCompare(b[1].title)
    })
  )
}

/**
 * Group tasks by client
 * Creates columns for all clients found in tasks
 */
export function groupByClient(tasks: Task[]): Map<number, KanbanColumnData> {
  const grouped = new Map<number, KanbanColumnData>()
  
  // Add tasks to their respective client columns
  preventDuplicates(tasks, (task) => {
    const clientId = task.client?.id || 0
    
    if (!grouped.has(clientId)) {
      grouped.set(clientId, {
        id: clientId,
        title: task.client ? task.client.name : 'No Client',
        tasks: []
      })
    }
    
    grouped.get(clientId)?.tasks.push({ ...task })
  })
  
  return grouped
}

/**
 * Main grouping function that delegates to the appropriate grouping strategy
 */
export function groupTasks(
  tasks: Task[],
  viewType: 'status' | 'assignee' | 'client',
  allStatuses: TaskStatusRecord[] = []
): Map<number, KanbanColumnData> {
  switch (viewType) {
    case 'status':
      return groupByStatus(tasks, allStatuses)
    case 'assignee':
      return groupByAssignee(tasks)
    case 'client':
      return groupByClient(tasks)
    default:
      return new Map()
  }
}
