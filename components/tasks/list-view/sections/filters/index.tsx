import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, SlidersHorizontal, User, Check, RefreshCw } from 'lucide-react'
import { ComboboxOption } from "@/components/ui/combobox"
import { STATUS_COLORS, TICKET_TYPE_COLORS, PRIORITY_COLORS, IMPACT_COLORS } from "@/constants/colors"
import { ColorIconFilters } from "./ColorIconFilters"
import { ClientFilter } from "./ClientFilter"
import { AssigneeFilter } from "./AssigneeFilter"
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useTasksStore } from '@/stores/useTasksStore'
import { useDropdownStore } from '@/stores/useDropdownStore'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from "@/lib/utils"
import { TaskStatusTypeProvider, TaskStatusRecord } from '@/lib/taskStatusIdProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskFiltersProps {
  // We can optionally keep props for clients and assignees as they might be computed outside
  clients?: ComboboxOption[]
  assignees?: ComboboxOption[]
  isSearching?: boolean
  isFiltering?: boolean
}

const GROUP_BY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'status', label: 'Status' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'client', label: 'Client' },
  { value: 'priority', label: 'Priority' },
  { value: 'impact', label: 'Impact' },
  { value: 'type', label: 'Type' },
] as const

export function TaskFilters({ 
  clients: externalClients,
  assignees: externalAssignees,
  isSearching = false,
  isFiltering = false
}: TaskFiltersProps = {}) {
  const { compactMode } = useSettingsStore();
  const { user } = useAuth();
  
  // Use the tasks store instead of props
  const { 
    search, 
    filters, 
    setSearch, 
    setFilter, 
    resetFilters,
    tasks,
    setMyTasksSorting,
    groupBy,
    setGroupBy,
    fetchTasks
  } = useTasksStore();
  
  // Use dropdown store for filter options
  const { 
    statuses, 
    ticketTypes, 
    priorities, 
    impacts,
    fetchStatuses,
    fetchTicketTypes,
    fetchPriorities,
    fetchImpacts
  } = useDropdownStore();

  const [searchTimeout, setSearchTimeout] = useState<any>(null)
  const [localSearch, setLocalSearch] = useState(search)

  const handleSearchChange = (search: string) => {
    setLocalSearch(search)
    
    clearTimeout(searchTimeout)

    setSearchTimeout(setTimeout(() => {
      setSearch(search)
    }, 1500))
  }
  

  // Load dropdown data on component mount
  useEffect(() => {
    fetchStatuses();
    fetchTicketTypes();
    fetchPriorities();
    fetchImpacts();
  }, [fetchStatuses, fetchTicketTypes, fetchPriorities, fetchImpacts]);
  
  // Store statuses in state since getAllStatuses is async
  const [allStatuses, setAllStatuses] = useState<TaskStatusRecord[]>([])
  
  // Load statuses using useEffect for async operation
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statusesResult = await TaskStatusTypeProvider.getAllStatuses()
        setAllStatuses(statusesResult)
      } catch (error) {
        console.error("Error loading statuses:", error)
        setAllStatuses([]) // Set empty array as fallback
      }
    }
    
    loadStatuses()
  }, [])
  
  // Convert dropdown store data to ColorIconOptions with colors
  const statusOptions = useMemo(() => {
    // Helper function to safely get status color
    const getStatusColor = (statusName: string): string => {
      // Transform status name to match keys in STATUS_COLORS
      const normalizedKey = statusName.toLowerCase();
      
      // Use a type-safe approach to check if the key exists in STATUS_COLORS
      const colorKey = Object.keys(STATUS_COLORS).find(key => key === normalizedKey);
      return colorKey ? STATUS_COLORS[colorKey as keyof typeof STATUS_COLORS] : 'bg-gray-500';
    };
    
    return allStatuses.map(status => ({
      value: status.id.toString(), // Use ID as value
      label: status.name,
      color: getStatusColor(status.name),
      type: 'status' as const
    }));
  }, [allStatuses]);

  const typeOptions = useMemo(() => {
    return ticketTypes.map(type => {
      const key = type.label.toLowerCase();
      
      // Use a type-safe approach to check if the key exists in TICKET_TYPE_COLORS
      const colorKey = Object.keys(TICKET_TYPE_COLORS).find(k => k === key);
      const color = colorKey ? TICKET_TYPE_COLORS[colorKey as keyof typeof TICKET_TYPE_COLORS] : 'bg-gray-500';
      
      return {
        value: type.value, // Already an ID string
        label: type.label,
        color,
        type: 'ticket_type' as const
      };
    });
  }, [ticketTypes]);

  const priorityOptions = useMemo(() => {
    return priorities.map(priority => {
      const key = priority.label.toLowerCase();
      
      // Use a type-safe approach to check if the key exists in PRIORITY_COLORS
      const colorKey = Object.keys(PRIORITY_COLORS).find(k => k === key);
      const color = colorKey ? PRIORITY_COLORS[colorKey as keyof typeof PRIORITY_COLORS] : 'bg-gray-500';
      
      return {
        value: priority.value, // Already an ID string
        label: priority.label,
        color,
        type: 'priority' as const
      };
    });
  }, [priorities]);

  const impactOptions = useMemo(() => {
    return impacts.map(impact => {
      const key = impact.label.toLowerCase();
      
      // Use a type-safe approach to check if the key exists in IMPACT_COLORS
      const colorKey = Object.keys(IMPACT_COLORS).find(k => k === key);
      const color = colorKey ? IMPACT_COLORS[colorKey as keyof typeof IMPACT_COLORS] : 'bg-gray-500';
      
      return {
        value: impact.value, // Already an ID string
        label: impact.label,
        color,
        type: 'impact' as const
      };
    });
  }, [impacts])

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    const hasFilterValues = Object.entries(filters).some(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== '' && value !== 'all'
    })
    return hasFilterValues || groupBy !== 'none'
  }, [filters, groupBy])

  // Check if "My Tasks" filter is active (assignee is current user)
  const isMyTasksActive = useMemo(() => {
    return user && filters.assignee === user.id.toString()
  }, [filters.assignee, user])

  // Handler for "My Tasks" button
  const handleMyTasksClick = () => {
    if (!user) return
    
    if (isMyTasksActive) {
      // If already filtering by current user, clear the filter and custom sorting
      setFilter('assignee', '')
      setMyTasksSorting(false)
    } else {
      // Set filter to current user and enable custom My Tasks sorting
      setFilter('assignee', user.id.toString())
      setMyTasksSorting(true)
    }
  }

  return (
    <div className="flex flex-col space-y-4 mb-4 w-full" style={{ marginTop: 0 }}>
      <div className="flex flex-wrap items-start gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchTasks(true)}
          disabled={isSearching || isFiltering}
          className="flex-shrink-0"
          aria-label="Refresh tasks"
        >
          <RefreshCw className={cn("h-4 w-4", (isSearching || isFiltering) && "animate-spin")} />
        </Button>
        
        <div className="relative w-64">
          <Input
            data-testid="task-search-input"
            placeholder="Search"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn("w-full", isSearching && "pr-8")} 
            disabled={isSearching}
          />
          {isSearching && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        <div> 
          <ClientFilter
            value={filters.client}
            onValueChange={(value) => setFilter('client', value)}
            className="w-[220px]"
          />
        </div>
        
        <div>
          <AssigneeFilter
            value={filters.assignee}
            onValueChange={(value) => setFilter('assignee', value)}
            className="w-[220px]"
          />
        </div>

        {user && (
          <Button 
            data-testid="my-tasks-button"
            variant={isMyTasksActive ? "default" : "outline"}
            onClick={handleMyTasksClick}
            className={cn(
              "flex items-center gap-1",
              isMyTasksActive && "bg-primary text-primary-foreground"
            )}
            aria-label={isMyTasksActive ? "Clear my tasks filter" : "Show my tasks"}
          >
            <User className="h-4 w-4" />
            {!compactMode && (
              <span>My Tasks</span>
            )}
          </Button>
        )}
        
        <Button
          data-testid="all-tasks-button"
          variant="outline"
          onClick={() => {
            setFilter('assignee', '');
            setMyTasksSorting(false);
          }}
          className={cn(
            "flex items-center gap-1",
            !filters.assignee && !isMyTasksActive && "bg-secondary"
          )}
        >
          <span>All Tasks</span>
        </Button>

        <Button
          data-testid="completed-tasks-button"
          variant="outline"
          onClick={() => {
            // Toggle completed filter
            const currentStatus = filters.status || [];
            const completedStatus = ['6']; // Assuming 6 is the ID for 'Closed' status
            const newStatus = currentStatus.includes('6') 
              ? currentStatus.filter(s => s !== '6')
              : [...currentStatus, ...completedStatus];
            setFilter('status', newStatus);
          }}
          className={cn(
            "flex items-center gap-1",
            filters.status?.includes('6') && "bg-secondary"
          )}
        >
          <span>Completed</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              aria-label="Filter options"
              disabled={isFiltering}
              data-testid="filter-dropdown-trigger"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {!compactMode && <span>Filters</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]" data-testid="filter-dropdown-content">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <div className="p-2 space-y-3">
              <ColorIconFilters
                label="Status"
                options={statusOptions}
                selectedValues={filters.status}
                onValueChange={(value) => setFilter('status', value)}
                type="status"
              />
              
              <ColorIconFilters
                label="Type"
                options={typeOptions}
                selectedValues={filters.type}
                onValueChange={(value) => setFilter('type', value)}
                type="ticket_type"
              />
              
              <ColorIconFilters
                label="Priority"
                options={priorityOptions}
                selectedValues={filters.priority}
                onValueChange={(value) => setFilter('priority', value)}
                type="priority"
              />
              
              <ColorIconFilters
                label="Impact"
                options={impactOptions}
                selectedValues={filters.impact}
                onValueChange={(value) => setFilter('impact', value)}
                type="impact"
              />
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Group by</DropdownMenuLabel>
            {GROUP_BY_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => !isFiltering && setGroupBy(option.value)}
                disabled={isFiltering}
                className={cn(
                  "flex items-center justify-between",
                  isFiltering ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  groupBy === option.value && "bg-green-500/10"
                )}
                data-testid={`group-by-${option.value}`}
              >
                <span>{option.label}</span>
                {groupBy === option.value && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {(hasActiveFilters || localSearch) && (
          <Button 
            variant="outline" 
            onClick={() => {
              resetFilters();
              setGroupBy('none');
              setLocalSearch('');
              clearTimeout(searchTimeout);
            }}
            className="flex items-center gap-1 text-destructive hover:text-destructive border-red-500"
            aria-label="Reset all filters"
            data-testid="reset-filters-button"
          >
            <X className="h-4 w-4" />
            {!compactMode && <span>Reset</span>}
          </Button>
        )}
      </div>
    </div>
  )
}
