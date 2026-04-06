import type { ColumnVisibility } from '@/components/tasks/list-view/sections/ColumnSelector'
import { DataState } from '@/types/tasks'

export const defaultColumns: ColumnVisibility = {
  summary: true,
  type: true,
  priority: true,
  impact: true,
  client: true,
  assignee: true,
  created_by: true,
  created_date: true,
  updated_date: true,
  viewers: false,
  running_time: true, 
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TasksState extends DataState {
  columns: ColumnVisibility;
  pagination: PaginationState;
  isLoadingMore: boolean;
  initialLoadComplete: boolean;
  isSearching: boolean;
  isFiltering: boolean;
  search: string;
  filters: {
    tier: string;
    status: string[];
    type: string[];
    priority: string[];
    client: string;
    assignee: string;
    impact: string[];
  };
  // Sorting parameters
  sort: {
    field: string | null;
    direction: 'asc' | 'desc';
  };
  // My Tasks custom sorting flag
  myTasksSorting: boolean;
  // Group by field
  groupBy: 'none' | 'status' | 'assignee' | 'client' | 'priority' | 'impact' | 'type';
  toggleColumn: (column: keyof ColumnVisibility) => void;
  resetColumns: () => void;
  fetchTasks: (refresh?: boolean) => Promise<void>;
  loadMoreTasks: () => Promise<void>;
  setSearch: (search: string) => void;
  setFilter: (filterType: string, value: string | string[]) => void;
  resetFilters: () => void;
  // Sorting functions
  setSortField: (field: string, direction?: 'asc' | 'desc') => void;
  toggleSortDirection: () => void;
  resetSort: () => void;
  setMyTasksSorting: (enabled: boolean) => void;
  setGroupBy: (groupBy: 'none' | 'status' | 'assignee' | 'client' | 'priority' | 'impact' | 'type') => void;
}
