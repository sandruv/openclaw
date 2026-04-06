"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "./subcomponents/TableSkeleton"
import { useClientStore } from "@/stores/useClientStore"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
import { Pagination } from "@/components/ui/pagination"
import { formatDate } from "@/lib/dateTimeFormat"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { logger } from '@/lib/logger'
import { Badge } from "@/components/ui/badge"
import { VipIndicator } from "@/components/custom/vip-indicator"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { IndeterminateProgress } from "@/components/custom/IndeterminateProgress"
import { getClientStatusColor } from "@/lib/clientUsersUtils"
import { useSettingsStore } from "@/stores/useSettingsStore"

const getStatusBadgeColor = (status: string) => {
  // Get the background color from the utility function
  const bgColor = getClientStatusColor(status, 'bg-');
  
  // Generate a matching text color by using the same color with text- prefix
  // and adjusting the intensity (using 700 for better contrast on colored backgrounds)
  const textColor = getClientStatusColor(status, 'text-').replace(/\d+$/, '700');
  
  return { bg: bgColor, text: textColor };
}

export function ClientsTab() {
  // Use state from store and component
  const { clients, isLoading, fetchClients, pagination } = useClientStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { compactMode } = useSettingsStore()
  
  // Handle page change with loading state
  const handlePageChange = async (page: number) => {
    try {
      // Only fetch if page actually changes
      if (page !== pagination.page) {
        setIsSearching(true) // Show loader
        await fetchClients(page, 10, searchTerm)
        setIsSearching(false) // Hide loader
      }
    } catch (error) {
      console.error('Failed to change page', error)
      setIsSearching(false) // Hide loader on error
    }
  }
  
  // Handle search with 2s debounce
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
        await fetchClients(1, 10, value)
      } catch (error) {
        console.error('Failed to search clients', error)
      } finally {
        setIsSearching(false) // Hide loader when done
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
      setIsSearching(true) // Show loader
      await fetchClients(1, 10, searchTerm)
      setIsSearching(false) // Hide loader
    } catch (error) {
      console.error('Failed to search clients', error)
      setIsSearching(false) // Hide loader on error
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
      setIsSearching(true)
      await fetchClients(1, 10, '')
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

  // Return loading state if clients is not initialized

  return (
    <>
      <div className="flex justify-between p-5">
        <form onSubmit={handleSearchSubmit} className="relative w-72">
          <Input
            type="text"
            placeholder="Search clients..."
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
            variant="default" 
            className={`bg-blue-500 hover:bg-blue-600 flex items-center ${compactMode ? 'px-2' : 'gap-2'}`}
            onClick={() => { setIsLoading(true); router.push('/clients/new') }}
          >
            <Plus className={`h-4 w-4 ${!compactMode ? 'mr-2' : ''}`} />
            {!compactMode && <span>Add Client</span>}
          </Button>
        </div>
      </div>
      
      {/* Show progress bar outside the table structure when searching */}
      {isSearching ? <IndeterminateProgress /> : <div className="h-1"></div>}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {clients.map((client: any) => (
            <TableRow 
              key={client.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => { setIsLoading(true); router.push(`/clients/${client.id}/details`) }}
            >
              <TableCell className="pl-5">
                <div className="flex items-center gap-2">
                  <span>{client.name}</span>
                  {client.is_client_vip && <VipIndicator />}
                </div>
              </TableCell>
              <TableCell>{client.address || "-"}</TableCell>
              <TableCell>
                {client.status ? (
                  <Badge className={`${getStatusBadgeColor(client.status.name).bg} ${getStatusBadgeColor(client.status.name).text} font-medium text-white`}>
                    {client.status.name}
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700 font-medium">
                    {client.active ? 'Active' : 'Inactive'}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(client.created_at) || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
