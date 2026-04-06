/**
 * Status order for Kanban board display
 * The lower the number, the earlier the status appears in the board
 */
export const STATUS_ORDER: Record<string, number> = {
  'new': 1,
  'assigned': 2,
  'in progress': 3,
  'on hold': 4,
  'pending end-user': 5,
  'user responded': 6,
  'reopened': 7,
  'closed': 8,
  'archived': 9,
}
/**
 * Default column colors for different view types
 */
export const DEFAULT_COLUMN_COLORS = {
  status: 'bg-gray-700 dark:bg-gray-200',
  assignee: 'bg-blue-700 dark:bg-blue-200',
  client: 'bg-purple-700 dark:bg-purple-200',
}