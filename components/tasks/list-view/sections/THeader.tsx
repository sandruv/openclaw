import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTasksStore } from "@/stores/useTasksStore"
import { SortableTableHead } from "./SortableTableHead"
import { SelectAllColumn } from "./columns"

interface TaskTableHeaderProps {
  showSelection?: boolean
  isAllSelected?: boolean
  isIndeterminate?: boolean
  onSelectAll?: (selected: boolean) => void
}

export function TaskTableHeader({ 
  showSelection = false, 
  isAllSelected = false, 
  isIndeterminate = false, 
  onSelectAll 
}: TaskTableHeaderProps) {
  const { columns } = useTasksStore()

  return (
    <TableHeader>
      <TableRow className="bg-gray-100 dark:bg-gray-800">
        {showSelection && onSelectAll && (
          <SelectAllColumn 
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={onSelectAll}
          />
        )}
        <SortableTableHead field="id" className="px-1 py-3 text-gray-700 dark:text-gray-200">ID</SortableTableHead>
        {columns.running_time && <TableHead className="text-gray-700 dark:text-gray-200 text-center">Time</TableHead>}
        <SortableTableHead field="status_id" className="text-gray-700 dark:text-gray-200">Status</SortableTableHead>
        {columns.summary && <TableHead className="text-gray-700 dark:text-gray-200">Summary</TableHead>}
        {columns.type && <TableHead className="text-gray-700 dark:text-gray-200">Type</TableHead>}
        {columns.priority && <SortableTableHead field="priority_id" className="text-gray-700 dark:text-gray-200">Priority</SortableTableHead>}
        {columns.impact && <SortableTableHead field="impact_id" className="text-gray-700 dark:text-gray-200">Impact</SortableTableHead>}
        {columns.client && <TableHead className="text-gray-700 dark:text-gray-200">Client</TableHead>}
        {columns.assignee && <TableHead className="text-gray-700 dark:text-gray-200">Assignee</TableHead>}
        {columns.created_by && <TableHead className="text-gray-700 dark:text-gray-200">Triager</TableHead>}
        {columns.created_date && <SortableTableHead field="created_at" className="text-gray-700 dark:text-gray-200">Created</SortableTableHead>}
        {columns.updated_date && <SortableTableHead field="updated_at" className="text-gray-700 dark:text-gray-200">Updated</SortableTableHead>}
        {/* {columns.viewers && <TableHead className="text-gray-700 dark:text-gray-200 text-center">Viewers</TableHead>} */}
      </TableRow>
    </TableHeader>
  )
}
