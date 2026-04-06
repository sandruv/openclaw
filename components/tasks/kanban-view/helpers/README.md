# Kanban Grouping Helpers

This directory contains modular helper functions for the kanban board view.

## Overview

The `kanban-grouping.ts` file provides clean, separated functions for grouping tasks by different view types.

## Structure

### Main Function
- **`groupTasks()`** - Main entry point that delegates to the appropriate grouping strategy

### View Type Grouping Functions

#### 1. `groupByStatus()`
Groups tasks by their status and sorts columns according to `STATUS_ORDER`.

**Column Order:**
Columns are arranged based on the `STATUS_ORDER` constant in `/constants/kanban.ts`:
```typescript
export const STATUS_ORDER: Record<number, number> = {
  1: 0,  // New
  2: 1,  // In Progress
  3: 2,  // On Hold
  4: 3,  // Pending End-User
  5: 4,  // User Responded
  6: 5,  // Closed
  7: 6,  // Archived
  8: 7,  // Reopened
  9: 8,  // Assigned
}
```

**To Modify Status Column Order:**
1. Edit `/constants/kanban.ts`
2. Adjust the number values (lower = appears first)
3. Save - changes will reflect immediately

#### 2. `groupByAssignee()`
Groups tasks by assigned agent and sorts tasks within columns by `assignee_order`.

**Task Sorting:**
- Primary: `assignee_order` field (lower values first)
- Fallback: Task ID for stability
- Unassigned tasks: Get `assignee_order` = MAX value

**To Modify Assignee View:**
- Task order is managed by drag-and-drop in the UI
- Order is stored in the `assignee_order` field
- No configuration needed

#### 3. `groupByClient()`
Groups tasks by client name.

**To Modify Client View:**
- Currently sorted by client appearance in task list
- To add custom sorting, modify the `groupByClient()` function
- Add a sort at the end similar to status view

## Utility Functions

### `preventDuplicates()`
Internal helper that ensures each task appears only once across all columns.

## Usage Examples

### Basic Usage
```typescript
import { groupTasks } from './helpers/kanban-grouping'

const groupedTasks = groupTasks(tasks, 'status', allStatuses)
```

### Individual Functions
```typescript
import { groupByStatus, groupByAssignee, groupByClient } from './helpers/kanban-grouping'

// Status view
const statusColumns = groupByStatus(tasks, allStatuses)

// Assignee view
const assigneeColumns = groupByAssignee(tasks)

// Client view
const clientColumns = groupByClient(tasks)
```

## Extending the System

### Adding a New View Type

1. **Create the grouping function:**
```typescript
export function groupByCustomField(tasks: Task[]): Map<number, KanbanColumnData> {
  const grouped = new Map<number, KanbanColumnData>()
  
  preventDuplicates(tasks, (task) => {
    const fieldId = task.customField?.id || 0
    
    if (!grouped.has(fieldId)) {
      grouped.set(fieldId, {
        id: fieldId,
        title: task.customField?.name || 'No Value',
        tasks: []
      })
    }
    
    grouped.get(fieldId)?.tasks.push({ ...task })
  })
  
  return grouped
}
```

2. **Add to main groupTasks function:**
```typescript
export function groupTasks(
  tasks: Task[],
  viewType: 'status' | 'assignee' | 'client' | 'customField',
  allStatuses: TaskStatusRecord[] = []
): Map<number, KanbanColumnData> {
  switch (viewType) {
    case 'status':
      return groupByStatus(tasks, allStatuses)
    case 'assignee':
      return groupByAssignee(tasks)
    case 'client':
      return groupByClient(tasks)
    case 'customField':
      return groupByCustomField(tasks)
    default:
      return new Map()
  }
}
```

3. **Update the component to use the new view type**

## Benefits of This Structure

✅ **Easy to modify** - Each view type has its own function  
✅ **Clear separation** - No giant if/else blocks  
✅ **Reusable** - Functions can be used independently  
✅ **Testable** - Each function can be unit tested  
✅ **Maintainable** - Changes to one view don't affect others  
✅ **Type-safe** - Full TypeScript support

## Common Modifications

### Change Status Column Order
Edit: `/constants/kanban.ts`

### Change How Tasks Are Sorted Within Columns
Edit: The specific `groupBy*()` function's sort logic

### Add New Column Grouping
Create: New `groupBy*()` function in this file

### Change Column Appearance
Edit: `/components/tasks/kanban-view/subcomponents/KanbanBoard.tsx`
