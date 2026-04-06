"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DataTableSkeleton() {
  return (
    <div className="container max-w-full mt-2">
      <div className="flex flex-col gap-4 mb-2 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Search input skeleton */}
          <div className="relative w-72">
            <Skeleton className="h-9 w-full" />
          </div>

          {/* Rows per page + pagination skeletons */}
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-8 w-[72px]" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading bar area */}
      <div className="h-1">
        <Skeleton className="h-full w-full" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5"><Skeleton className="h-4 w-[100px]" /></TableHead>
            <TableHead><Skeleton className="h-4 w-[200px]" /></TableHead>
            <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
            <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
            <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="pl-5"><Skeleton className="h-6 w-[140px]" /></TableCell>
              <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
              <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
