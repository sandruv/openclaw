"use client"

import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useSiteStore } from '@/stores/useSiteStore'
import { Site } from '@/types/clients'
import { MapPin, Phone, Search, X } from 'lucide-react'
import { DataTableSkeleton } from '@/components/clients/clients-tab/details/loaders/DataTableSkeleton'
import { SiteEditDialog } from '@/components/clients/sites-tab/details/dialogs/SiteEditDialog'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/ui/pagination'
import { IndeterminateProgress } from '@/components/custom/IndeterminateProgress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ClientSitesTableProps {
  clientId: string
}

export function ClientSitesTable({ clientId }: ClientSitesTableProps) {
  const { sites, fetchSites, pagination, isLoading } = useSiteStore()
  const [initialLoad, setInitialLoad] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pageSize, setPageSize] = useState(15)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  useEffect(() => {
    fetchSites(1, pageSize, '', Number(clientId)).finally(() => {
      setInitialLoad(false)
    })
  }, [fetchSites, clientId, pageSize])

  const handlePageChange = async (page: number) => {
    try {
      if (page !== pagination.page) {
        setIsSearching(true)
        await fetchSites(page, pageSize, searchTerm, Number(clientId))
        setIsSearching(false)
      }
    } catch (error) {
      console.error('Failed to change page', error)
      setIsSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (value !== searchTerm) {
      setIsSearching(true)
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        await fetchSites(1, pageSize, value, Number(clientId))
      } catch (error) {
        console.error('Failed to search sites', error)
      } finally {
        setIsSearching(false)
      }
    }, 2000)
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (searchTerm === '') {
      return
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    try {
      setIsSearching(true)
      await fetchSites(1, pageSize, searchTerm, Number(clientId))
      setIsSearching(false)
    } catch (error) {
      console.error('Failed to search sites', error)
      setIsSearching(false)
    }
  }

  const handleClearSearch = async () => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    setSearchTerm('')

    try {
      setIsSearching(true)
      await fetchSites(1, pageSize, '', Number(clientId))
      setIsSearching(false)
    } catch (error) {
      console.error('Failed to clear search', error)
      setIsSearching(false)
    }
  }

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [])

  if (initialLoad && isLoading) {
    return <DataTableSkeleton />
  }

  return (
    <div className="container max-w-full mt-2">
      <div className="flex flex-col gap-4 mb-2 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
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

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Rows per page</span>
              <select
                className="h-8 rounded border border-input bg-background px-2 text-xs"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {isSearching ? <IndeterminateProgress /> : <div className="h-1"></div>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Site</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.length === 0 && !isSearching && !initialLoad ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <span>No sites found{searchTerm ? ' matching your search' : ' for this client'}.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sites.map((site: Site) => {
            const status = (site.status as string)?.toLowerCase() || 'active'
            return (
              <TableRow
                key={site.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  setSelectedSite(site)
                  setIsEditDialogOpen(true)
                }}
              >
                <TableCell className="pl-5">
                  <div>
                    <div className="font-medium">{site.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {site.address || '-'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {site.phone_number || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      status === 'active'
                        ? 'bg-emerald-500 text-white'
                        : status === 'inactive'
                        ? 'bg-sky-500 text-white'
                        : 'bg-rose-500 text-white'
                    }
                  >
                    {status}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          }))}
        </TableBody>
      </Table>

      {selectedSite && (
        <SiteEditDialog 
          site={selectedSite} 
          isOpen={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          onSuccess={() => {
            fetchSites(pagination.page, pageSize, searchTerm, Number(clientId))
            setSelectedSite(null)
          }}
        />
      )}
    </div>
  )
}
