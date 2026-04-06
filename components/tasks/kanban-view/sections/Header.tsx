'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { SearchInput } from './SearchInput'
import { KanbanFilters } from './filters'
import { ComboboxOption } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react'

interface HeaderProps {
  search: string
  setSearch: (value: string) => void
  filters: {
    tier: string
    status: string[]
    type: string[]
    priority: string[]
    client: string
    assignee: string
    impact: string[]
  }
  clients: ComboboxOption[]
  assignees: ComboboxOption[]
  onFilterChange: (filterType: string, value: string) => void
  onResetFilters: () => void
  onRefresh?: () => void
}

export function Header({ 
  search, 
  setSearch, 
  filters,
  clients,
  assignees,
  onFilterChange,
  onResetFilters,
  onRefresh
}: HeaderProps) {
  const { kanbanViewType, setKanbanViewType } = useSettingsStore()
  const [showFilters, setShowFilters] = useState(false)
  const { compactMode } = useSettingsStore()
  
  // Check if any filter is active or search has a value
  const hasActiveFiltersOrSearch = useMemo(() => {

    const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all')
    const hasSearch = search.trim().length > 0
    return hasActiveFilters || hasSearch
  }, [filters, search])
  
  // Function to reset both filters and search
  const handleResetAll = () => {
    // Reset filters
    onResetFilters()
    // Reset search
    setSearch('')
  }

  return (
    <div className="flex flex-col space-y-2 px-4 pt-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <SearchInput 
            search={search} 
            setSearch={setSearch} 
            viewType={kanbanViewType}
          />
          
          <Tabs 
            defaultValue={kanbanViewType} 
            value={kanbanViewType}
            onValueChange={(value) => setKanbanViewType(value as 'status' | 'assignee' | 'client')}
          >
            <TabsList className="bg-transparent">
              <TabsTrigger value="status" className="text-sm data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">By Status</TabsTrigger>
              <TabsTrigger value="assignee" className="text-sm data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">By Assignee</TabsTrigger>
              <TabsTrigger value="client" className="text-sm data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">By Client</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-1"
              title="Refresh tasks"
            >
              <RotateCcw className="h-4 w-4" />
              {!compactMode && (
                <span className="ml-1">Refresh</span>
              )}
            </Button>
          )}
          
          {/* TODO: TEMP: Hide Kanban filter for now */}
          { false && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {!compactMode && (
                  <span className="ml-1">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                )}
              </Button>

              {hasActiveFiltersOrSearch && (
                <Button 
                  variant="outline" 
                  onClick={handleResetAll}
                  className="flex items-center gap-1 text-destructive hover:text-destructive border-red-500"
                  aria-label="Reset all filters and search"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                  {!compactMode && (
                    <span className="ml-1">Reset All</span>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>  
      
      {/* TODO: TEMP: Hide Kanban filter for now */}
      {false && (
        <KanbanFilters
          search={search}
          filters={filters}
          clients={clients}
          assignees={assignees}
          onSearchChange={setSearch}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
      )}
    </div>
  )
}
