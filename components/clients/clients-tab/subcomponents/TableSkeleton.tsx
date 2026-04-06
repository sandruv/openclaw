import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TableSkeleton() {
  return (
    <>
      {/* Header section matching ClientsTab layout */}
      <div className="flex justify-between p-5">
        {/* Search form skeleton */}
        <div className="relative w-72">
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Right side with pagination and button */}
        <div className="flex items-center space-x-4">
          {/* Pagination skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          
          {/* Add Client button skeleton */}
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      {/* Table structure matching the actual table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {[...Array(8)].map((_, i) => (
            <TableRow key={i}>
              <TableCell className="pl-5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  {/* Occasionally show VIP indicator skeleton */}
                  {i % 3 === 0 && <Skeleton className="h-4 w-8" />}
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
