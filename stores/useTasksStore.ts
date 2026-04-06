import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { flushSync } from 'react-dom'
import { getTasks } from '@/services/taskService'
import { logger } from '@/lib/logger'
import Cookies from 'js-cookie'
import { defaultColumns, TasksState } from '@/types/store/taskStore'

const COLUMNS_COOKIE_KEY = 'ticket-columns'
const COOKIE_EXPIRY_DAYS = 365

// Custom storage adapter for cookies
const cookieStorage = {
  getItem: (name: string): string | null => {
    const value = Cookies.get(name)
    return value ? value : null
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, { 
      expires: COOKIE_EXPIRY_DAYS,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })
  },
  removeItem: (name: string): void => {
    Cookies.remove(name)
  },
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: true,
      error: null,
      columns: defaultColumns,
      isLoadingMore: false,
      initialLoadComplete: false,
      isSearching: false,
      isFiltering: false,
      // Filter state
      search: '',
      filters: {
        tier: 'all',
        status: [] as string[],
        type: [] as string[],
        priority: [] as string[],
        client: '',
        assignee: '',
        impact: [] as string[],
      },
      // Sorting state
      sort: {
        field: 'created_at',
        direction: 'desc' as const,
      },
      // My Tasks custom sorting flag
      myTasksSorting: false,
      // Group by field
      groupBy: 'none' as const,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      toggleColumn: (column) =>
        set((state) => ({
          columns: {
            ...state.columns,
            [column]: !state.columns[column],
          },
        })),
      resetColumns: () => set({ columns: defaultColumns }),
      fetchTasks: async (refresh = false) => {
        // If refreshing, reset pagination to first page
        if (refresh) {
          set({ 
            isLoading: true, 
            error: null, 
            pagination: { ...get().pagination, page: 1 },
            isSearching: true
          })
        } else {
          set({ isLoading: true, error: null })
        }
        
        try {
          const { page, limit } = get().pagination
          const { search, filters } = get()
          
          // Prepare filter params for backend
          const filterParams: Record<string, string | string[]> = {}
          
          // Only include non-empty filters
          Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // For array filters, only include if not empty
              if (value.length > 0) {
                filterParams[key] = value
              }
            } else if (value && value !== 'all' && value !== '') {
              filterParams[key] = value
            }
          })
          
          // Add search query if present
          const searchQuery = search ? search : undefined
          
          // Add sorting parameters
          const { sort } = get()
          
          const response = await getTasks({ 
            currentUserId: 4,
            page,
            limit,
            search: searchQuery,
            filters: Object.keys(filterParams).length > 0 ? filterParams : undefined,
            sortBy: sort.field || undefined,
            sortDirection: sort.direction
          })
          
          logger.debug('useTaskStore: fetchData - ', response)
          
          // Update tasks and pagination info
          set({ 
            tasks: refresh ? (response.data || []) : [...get().tasks, ...(response.data || [])], 
            isLoading: false,
            isSearching: false,
            pagination: response.pagination || get().pagination,
            initialLoadComplete: true
          })
          
        } catch (error) {
          console.error('Error fetching tasks:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tasks', 
            isLoading: false,
            isSearching: false
          })
        }
      },
      loadMoreTasks: async () => {
        const { pagination, isLoadingMore, isLoading } = get()
        
        // Prevent multiple simultaneous requests
        if (isLoadingMore 
          || isLoading 
          || !pagination.hasNextPage 
          || pagination.page === pagination.totalPages) {
          return
        }
        
        set({ isLoadingMore: true })
        
        try {
          const nextPage = pagination.page + 1
          const { search, filters } = get()
          
          // Prepare filter params for backend
          const filterParams: Record<string, string | string[]> = {}
          
          // Only include non-empty filters
          Object.entries(filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              // For array filters, only include if not empty
              if (value.length > 0) {
                filterParams[key] = value
              }
            } else if (value && value !== 'all' && value !== '') {
              filterParams[key] = value
            }
          })
          
          // Add search query if present
          const searchQuery = search ? search : undefined
          
          // Add sorting parameters
          const { sort } = get()
          
          const response = await getTasks({
            currentUserId: 4,
            page: nextPage,
            limit: pagination.limit,
            search: searchQuery,
            filters: Object.keys(filterParams).length > 0 ? filterParams : undefined,
            sortBy: sort.field || undefined,
            sortDirection: sort.direction
          })

          console.log('useTasksStore: loadMoreTasks - ', response)
          
          // Add new tasks to existing tasks
          set((state) => ({
            tasks: [...state.tasks, ...response.data],
            isLoadingMore: false,
            pagination: {
              ...state.pagination,
                page: nextPage,
                hasNextPage: response.pagination?.hasNextPage || false,
                hasPrevPage: true
              }
          }))
        } catch (error) {
          console.error('Error loading more tasks:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load more tasks',
            isLoadingMore: false 
          })
        }
      },
      setTasks: (tasks) => set({ tasks }),
      setIsLoading: (isLoading) => set({ isLoading }),
      getTasksByClientId: (clientId: number) => {
        const tasks = get().tasks
        return tasks.filter(task => task.client.id === clientId)
      },
      // Filter actions
      setSearch: (search: string) => {
        // Set search term and trigger a refresh of data from backend
        set(state => ({ 
          search,
          // Reset to page 1 when search changes
          pagination: { ...state.pagination, page: 1 }
        }))
        // Fetch tasks with new search parameter
        get().fetchTasks(true)
      },
      setFilter: (filterType, value) => {
        console.log("setting filter")
        set({ isFiltering: true })
        set((state) => {
          // Handle array-based filters for multiple selections
          if (['status', 'type', 'priority', 'impact'].includes(filterType)) {
            const currentValues = state.filters[filterType as keyof typeof state.filters] as string[]
            let newValues: string[]
            
            if (value === 'all') {
              // Clear all selections when 'all' is clicked
              newValues = []
            } else if (Array.isArray(value)) {
              // Direct array assignment
              newValues = value
            } else {
              // Toggle individual value
              if (currentValues.includes(value)) {
                newValues = currentValues.filter(v => v !== value)
              } else {
                newValues = [...currentValues, value]
              }
            }
            
            return {
              filters: {
                ...state.filters,
                [filterType]: newValues
              },
              // Reset to page 1 when filters change
              pagination: { ...state.pagination, page: 1 }
            }
          } else {
            // Handle single-value filters (client, assignee, tier)
            return {
              filters: {
                ...state.filters,
                [filterType]: value
              },
              // Reset to page 1 when filters change
              pagination: { ...state.pagination, page: 1 }
            }
          }
        })
        // Refetch tasks with new filter
        get().fetchTasks(true).finally(() => {
          // Small delay to show the filtering state
          setTimeout(() => set({ isFiltering: false }), 300)
        })
      },
      resetFilters: () => {
        set({ isFiltering: true })
        set({
          filters: {
            tier: 'all',
            status: [],
            type: [],
            priority: [],
            client: '',
            assignee: '',
            impact: [],
          },
        })
        // Refetch tasks with cleared filters
        get().fetchTasks(true).finally(() => {
          setTimeout(() => set({ isFiltering: false }), 300)
        })
      },
      // Sorting functions
      setSortField: (field, direction) => {
        // Use provided direction or default to desc for new fields
        const sortDirection = direction || 'desc';
        
        set({
          sort: {
            field,
            direction: sortDirection
          },
          pagination: { ...get().pagination, page: 1 }
        })
        
        // Refresh tasks with new sorting
        get().fetchTasks(true)
      },
      resetSort: () => {
        set({
          sort: {
            field: null,
            direction: 'desc'
          },
          pagination: { ...get().pagination, page: 1 }
        })
        
        // Refresh tasks with default sorting
        get().fetchTasks(true)
      },
      toggleSortDirection: () => {
        set(state => ({
          sort: {
            ...state.sort,
            direction: state.sort.direction === 'asc' ? 'desc' : 'asc'
          },
          pagination: { ...state.pagination, page: 1 }
        }))
        
        // Refresh tasks with new sorting direction
        get().fetchTasks(true)
      },
      setMyTasksSorting: (enabled: boolean) => {
        set({ myTasksSorting: enabled })
      },
      setGroupBy: (groupBy) => {
        // Use flushSync to force React to render loading state immediately
        // before the heavy groupBy update starts
        flushSync(() => {
          set({ isFiltering: true })
        })
        // Small delay to ensure DOM paint occurs
        setTimeout(() => {
          set({ groupBy })
          // Reset filtering state after render completes
          setTimeout(() => set({ isFiltering: false }), 100)
        }, 0)
      },
    }),
    {
      name: 'tasks-store',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        columns: state.columns,
        filters: state.filters,
        search: state.search
      }),
    }
  )
)