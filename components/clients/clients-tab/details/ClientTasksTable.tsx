"use client"

import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useClientStore } from '@/stores/useClientStore'
import { Task } from '@/types/tasks'
import { format } from 'date-fns'
import { DataTableSkeleton } from './loaders/DataTableSkeleton'
import { getStatusColor, getPriorityColor } from '@/lib/taskUtils'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { IndeterminateProgress } from '@/components/custom/IndeterminateProgress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import { useLoader } from '@/contexts/LoaderContext'
//date in lib
import { formatDateWord } from '@/lib/dateTimeFormat'

interface ClientTasksTableProps {
  clientId: string
}

export function ClientTasksTable({ clientId }: ClientTasksTableProps) {
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { clientTasks, fetchClientTasks, tasksPagination, isLoadingTasks } = useClientStore()
  const [initialLoad, setInitialLoad] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [pageSize, setPageSize] = useState(15)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    fetchClientTasks(Number(clientId), 1, pageSize, '').finally(() => {
      setInitialLoad(false)
    })
  }, [fetchClientTasks, clientId, pageSize])

  const handlePageChange = async (page: number) => {
    try {
      if (page !== tasksPagination.page) {
        setIsSearching(true)
        await fetchClientTasks(Number(clientId), page, pageSize, searchTerm)
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
        await fetchClientTasks(Number(clientId), 1, pageSize, value)
      } catch (error) {
        console.error('Failed to search tasks', error)
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
      await fetchClientTasks(Number(clientId), 1, pageSize, searchTerm)
      setIsSearching(false)
    } catch (error) {
      console.error('Failed to search tasks', error)
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
      await fetchClientTasks(Number(clientId), 1, pageSize, '')
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

  if (initialLoad && isLoadingTasks) {
    return <DataTableSkeleton />
  }

  return (
    <div className="container max-w-full mt-2">
      <div className="flex flex-col gap-4 mb-2 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-72">
            <Input
              type="text"
              placeholder="Search tasks..."
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
              currentPage={tasksPagination.page}
              totalPages={tasksPagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {isSearching ? <IndeterminateProgress /> : <div className="h-1"></div>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">ID</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientTasks.length === 0 && !isSearching && !initialLoad ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <span>No tasks found{searchTerm ? ' matching your search' : ' for this client'}.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            clientTasks.map((task: Task) => {
            const status = task.status?.name || 'new'
            const statusColor = getStatusColor(status.toLowerCase() as any)
            const priority = task.priority?.name || 'low'
            const priorityColor = getPriorityColor(priority.toLowerCase() as any)

            return (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => { setIsLoading(true); router.push(`/tasks/${task.id}`) }}
              >
                <TableCell className="pl-5">#{task.id}</TableCell>
                <TableCell>
                  <div className='max-w-80'>
                    <div className="font-medium truncate">{task.summary}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`text-white ${statusColor} hover:${statusColor}/90`}>
                    {status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`text-white ${priorityColor} hover:${priorityColor}/90`}>
                    {priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{task.user?.first_name || '-'} {task.user?.last_name || ''}</div>
                  </div>
                </TableCell>
                <TableCell>{ formatDateWord(task.created_at)}</TableCell>
              </TableRow>
            )
          }))}
        </TableBody>
      </Table>
    </div>
  )
}
