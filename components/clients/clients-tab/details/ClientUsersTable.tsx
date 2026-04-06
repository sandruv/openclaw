"use client"

import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/stores/useUserStore'
import { User } from '@/types/clients'
import { DataTableSkeleton } from './loaders/DataTableSkeleton'
import { useRouter } from 'next/navigation'
import { useLoader } from '@/contexts/LoaderContext'
import { getTechAptitudeIcon, getRoleColor } from '@/lib/clientUsersUtils'
import { VipIndicator } from '@/components/custom/vip-indicator'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { IndeterminateProgress } from '@/components/custom/IndeterminateProgress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ClientUsersTableProps {
  clientId: string
}

export function ClientUsersTable({ clientId }: ClientUsersTableProps) {
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { users, fetchUsers, pagination, isLoading } = useUserStore()
  const [initialLoad, setInitialLoad] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pageSize, setPageSize] = useState(15)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    fetchUsers(1, pageSize, '', Number(clientId)).finally(() => {
      setInitialLoad(false)
    })
  }, [fetchUsers, clientId, pageSize])

  const handlePageChange = async (page: number) => {
    try {
      if (page !== pagination.page) {
        setIsSearching(true)
        await fetchUsers(page, pageSize, searchTerm, Number(clientId))
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
        await fetchUsers(1, pageSize, value, Number(clientId))
      } catch (error) {
        console.error('Failed to search users', error)
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
      await fetchUsers(1, pageSize, searchTerm, Number(clientId))
      setIsSearching(false)
    } catch (error) {
      console.error('Failed to search users', error)
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
      await fetchUsers(1, pageSize, '', Number(clientId))
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
            <TableHead className="pl-5">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Tech Aptitude</TableHead>
            <TableHead>Registered</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && !isSearching && !initialLoad ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <span>No users found{searchTerm ? ' matching your search' : ' for this client'}.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user: User) => {
            const role = user.role?.name || 'Unknown'
            const { bg, text } = getRoleColor(role)
            const sophistication = user.sophistication
            const { icon, color } = getTechAptitudeIcon(sophistication.id)

            return (
              <TableRow
                key={user.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => { setIsLoading(true); router.push(`/user/${user.id}/details`) }}
              >
                <TableCell className="pl-5">
                  <div className="flex items-center gap-2">
                    <span>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || '-'}</span>
                    {user.is_user_vip && <VipIndicator scale={5} />}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={`${bg} ${text} font-medium hover:${bg}`}>
                    {role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${color} text-white text-xs font-medium`}>
                    {icon}
                    <span>{sophistication.name || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </TableCell>
              </TableRow>
            )
          }))}
        </TableBody>
      </Table>
    </div>
  )
}
