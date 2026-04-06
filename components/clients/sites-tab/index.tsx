import { Search, Plus, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { useSiteStore } from '@/stores/useSiteStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { SiteTable } from "./details/SiteTable"
import { Site } from "@/types/clients"
import { SiteEditDialog } from "./details/dialogs/SiteEditDialog"
import { IndeterminateProgress } from "@/components/custom/IndeterminateProgress"
import { TableSkeleton } from "./details/loaders/TableSkeleton"

export function SitesTab() {
  const { sites, isLoading, isSearching, error, fetchSites, pagination } = useSiteStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { compactMode } = useSettingsStore()

  useEffect(() => {
    // Fetch initial sites data with pagination
    if(initialLoad) {
      fetchSites(1, 10).finally(() => {
        setInitialLoad(false) // Mark initial loading as complete
      })
    }
  }, [fetchSites, initialLoad])

  // Handle page change with loading state
  const handlePageChange = async (page: number) => {
    try {
      // Only fetch if page actually changes
      if (page !== pagination.page) {
        await fetchSites(page, 10, searchTerm)
      }
    } catch (error) {
      console.error('Failed to change page', error)
    }
  }
  
  // Handle search with 2s debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    // Set new timeout for debounced search (2 seconds)
    searchTimeout.current = setTimeout(async () => {
      try {
        await fetchSites(1, 10, value)
      } catch (error) {
        console.error('Failed to search sites', error)
      }
    }, 2000) // 2 second debounce
  }
  
  // Handle search submission when form is submitted (Enter key)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    try {
      await fetchSites(1, 10, searchTerm)
    } catch (error) {
      console.error('Failed to search sites', error)
    }
  }
  
  // Handle clearing search
  const handleClearSearch = async () => {
    // Clear timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    // Reset search term
    setSearchTerm('')
    
    try {
      await fetchSites(1, 10, '')
    } catch (error) {
      console.error('Failed to clear search', error)
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

  const handleRowClick = (site: Site) => {
    setSelectedSite(site)
    setIsEditDialogOpen(true)
  }
  
  if(error) {
    return <div className="p-5">{error}</div>
  }

  return (
    <>
      {initialLoad ? (
        <div className="">
          <TableSkeleton />
        </div>
      ) : (
        <>
          <div className="flex justify-between p-5">
            <form onSubmit={handleSearchSubmit} className="relative w-72">
              <Input
                type="text"
                placeholder="Search sites..."
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
            <div className="flex items-center space-x-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
              <Button 
                onClick={() => { setIsLoading(true); router.push('/clients/sites/new') }}
                className={`bg-blue-500 hover:bg-blue-600 flex items-center ${compactMode ? 'px-2' : 'gap-2'}`}
              >
                <Plus className={`h-4 w-4 ${!compactMode ? 'mr-2' : ''}`} />
                {!compactMode && <span>Add Site</span>}
              </Button>
            </div>
          </div>
          
          {/* Show progress bar outside the table structure when searching */}
          {(isSearching || isLoading) ? <IndeterminateProgress /> : <div className="h-1"></div>}

          <SiteTable 
            sites={sites}
            onRowClick={handleRowClick}
          />

          {selectedSite && (
            <SiteEditDialog 
              site={selectedSite}
              isOpen={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onSuccess={() => {
                fetchSites()
                setSelectedSite(null)
              }}
            />
          )}
        </>
      )}
    </>
  )
}
