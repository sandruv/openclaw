import { Search, Plus, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { useUserStore } from '@/stores/useUserStore'
import { useDropdownStore } from '@/stores/useDropdownStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { logger } from '@/lib/logger'
import { UsersTable } from "./details/UsersTable"
import { TableSkeleton } from "./subcomponents/TableSkeleton"
import { FilterButton, FilterContent, ClearFiltersButton } from "./subcomponents/UserFilters"
import { IndeterminateProgress } from "@/components/custom/IndeterminateProgress"
import { UserErrorState } from "./details/loaders/UserErrorState"

export function UsersTab() {
  const { users, isLoading, pagination, error, fetchUsers } = useUserStore()
  const { 
    clients, 
    roles, 
    fetchClients, 
    fetchRoles, 
    searchClients,
    isSearchingClients 
  } = useDropdownStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [isSearching, setIsSearching] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { compactMode } = useSettingsStore()
  
  useEffect(() => {
    // Fetch initial users data with pagination
    fetchUsers(1, 10).finally(() => {
      setInitialLoad(false) // Mark initial loading as complete
    })
    
    // Fetch dropdown data
    fetchClients()
    fetchRoles()
  }, [fetchUsers, fetchClients, fetchRoles])
  
  const handlePageChange = async (page: number) => {
    try {
      if (page !== pagination.page) {
        setIsSearching(true) // Show loader
        await fetchUsers(
          page, 
          10, 
          searchTerm, 
          selectedClientId ? Number(selectedClientId) : undefined, 
          selectedRoleId ? Number(selectedRoleId) : undefined
        )
        setIsSearching(false) // Hide loader
      }
    } catch (error) {
      console.error('Failed to change page', error)
      setIsSearching(false) // Hide loader on error
    }
  }
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    // Set searching state immediately
    if (value !== searchTerm) {
      setIsSearching(true)
    }
    
    // Set new timeout for debounced search (2 seconds)
    searchTimeout.current = setTimeout(async () => {
      try {
        await fetchUsers(
          1, 
          10, 
          value, 
          selectedClientId ? Number(selectedClientId) : undefined, 
          selectedRoleId ? Number(selectedRoleId) : undefined
        )
      } catch (error) {
        console.error('Failed to search users', error)
      } finally {
        setIsSearching(false) // Hide loader when done
      }
    }, 2000) // 2 second debounce
  }
  
  // Handle search submission when form is submitted (Enter key)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if(searchTerm === '') {
      return
    }
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    try {
      setIsSearching(true) // Show loader
      await fetchUsers(
        1, 
        10, 
        searchTerm, 
        selectedClientId ? Number(selectedClientId) : undefined, 
        selectedRoleId ? Number(selectedRoleId) : undefined
      )
      setIsSearching(false) // Hide loader
    } catch (error) {
      console.error('Failed to search users', error)
      setIsSearching(false) // Hide loader on error
    }
  }
  
  const handleClientChange = async (value: string) => {
    setSelectedClientId(value)
    setIsSearching(true)
    try {
      await fetchUsers(
        1,
        10,
        searchTerm,
        value ? Number(value) : undefined,
        selectedRoleId ? Number(selectedRoleId) : undefined
      )
    } catch (error) {
      console.error('Failed to filter by client', error)
    } finally {
      setIsSearching(false)
    }
  }
  
  const handleRoleChange = async (value: string) => {
    setSelectedRoleId(value)
    setIsSearching(true)
    try {
      await fetchUsers(
        1,
        10,
        searchTerm,
        selectedClientId ? Number(selectedClientId) : undefined,
        value ? Number(value) : undefined
      )
    } catch (error) {
      console.error('Failed to filter by role', error)
    } finally {
      setIsSearching(false)
    }
  }
  
  const clearFilters = async () => {
    setSelectedClientId('')
    setSelectedRoleId('')
    setSearchTerm('')
    setIsSearching(true)
    
    try {
      await fetchUsers(1, 10)
    } catch (error) {
      console.error('Failed to clear filters', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRetry = async () => {
    setInitialLoad(true)
    try {
      await fetchUsers(1, 10)
    } finally {
      setInitialLoad(false)
    }
  }
  
  // Handle clearing search only
  const handleClearSearch = async () => {
    // Clear timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    // Reset search term
    setSearchTerm('')
    
    try {
      setIsSearching(true)
      await fetchUsers(
        1, 
        10, 
        '', 
        selectedClientId ? Number(selectedClientId) : undefined, 
        selectedRoleId ? Number(selectedRoleId) : undefined
      )
      setIsSearching(false)
    } catch (error) {
      console.error('Failed to clear search', error)
      setIsSearching(false)
    }
  }
  
  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [])

  // Show error state if there's an error after initial load
  if (error && !initialLoad) {
    return (
      <UserErrorState 
        title="Error Loading Users"
        message={error || "We encountered an error while loading the users. Please try again."}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <>
      {initialLoad ? (
        <div className="">
          <TableSkeleton />
        </div>
      ) : (
        <>
          <div className="flex flex-col p-5 gap-4">
            {/* Top row with search, filter button, and pagination */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex md:flex-row items-center gap-4">
                {/* Search input */}
                <form onSubmit={handleSearchSubmit} className="relative w-72">
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 pr-10"
                    onBlur={handleSearchSubmit}
                  />
                  <button type="submit" className="absolute left-2 top-2">
                    <Search className="h-5 w-5 text-gray-400" />
                  </button>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2 top-[6px] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  )}
                </form>
                
                {/* Filter toggle button */}
                <div className="xl:hidden">
                  <FilterButton 
                    hasFilters={Boolean(selectedClientId || selectedRoleId)}
                    filterCount={(selectedClientId ? 1 : 0) + (selectedRoleId ? 1 : 0)}
                    isActive={showFilters}
                    onClick={() => setShowFilters(!showFilters)}
                  />
                </div>

                {/* Large screen filter content - always visible */}
                <div className="hidden xl:block">
                  <FilterContent
                    clients={clients}
                    roles={roles}
                    selectedClientId={selectedClientId}
                    selectedRoleId={selectedRoleId}
                    onClientChange={handleClientChange}
                    onRoleChange={handleRoleChange}
                    onSearchClients={searchClients}
                    isSearchingClients={isSearchingClients}
                  />
                </div>

                {/* Clear filters button - show on all screen sizes when filters active */}
                {(selectedClientId || selectedRoleId) && (
                    <ClearFiltersButton onClick={clearFilters} />
                )}
              </div>
              
              {/* Pagination and Add User button */}
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
                <Button 
                  onClick={() => { setIsLoading(true); router.push('/clients/users/new') }}
                  className={`bg-blue-500 hover:bg-blue-600 text-white flex items-center ${compactMode ? 'px-2' : 'gap-2'}`}
                >
                  <Plus className={`h-4 w-4 ${!compactMode ? 'mr-2' : ''}`} />
                  {!compactMode && <span>Add User</span>}
                </Button>
              </div>
            </div>
            {/* Small screen filter content - shown only when toggled */}
            {showFilters && (
              <div className="xl:hidden">
                <FilterContent
                  clients={clients}
                  roles={roles}
                  selectedClientId={selectedClientId}
                  selectedRoleId={selectedRoleId}
                  onClientChange={handleClientChange}
                  onRoleChange={handleRoleChange}
                  onSearchClients={searchClients}
                  isSearchingClients={isSearchingClients}
                  collapsible={true}
                />
              </div>
            )}
          </div>
          
          {/* Show progress bar outside the table structure when searching */}
          {isSearching ? <IndeterminateProgress /> : <div className="h-1"></div>}

          <UsersTable 
            users={users}
            isLoading={initialLoad && isLoading}
          />
        </>
      )}
    </>
  )
}
