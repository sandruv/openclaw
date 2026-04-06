import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TaskTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters section skeleton that mimics TaskFilters component */}
      <div className="flex justify-between px-4 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center flex-wrap gap-2">
          {/* Search input */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-[250px]" />
          </div>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-[120px] rounded-md" />
            <Skeleton className="h-9 w-[120px] rounded-md" />
            <Skeleton className="h-9 w-[120px] rounded-md" />
            <Skeleton className="h-9 w-[120px] rounded-md" />
            <Skeleton className="h-9 w-[120px] rounded-md" />
          </div>
        </div>
        
        {/* Column selector button */}
        <div className="flex items-center">
          <Skeleton className="h-9 w-[100px] rounded-md" />
        </div>
      </div>
      
      {/* Table skeleton */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800">
            {/* Match column headers from TaskTableHeader */}
            <TableHead className="pl-6 pr-1 py-3">
              <Skeleton className="h-5 w-[40px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-[80px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-5 w-[200px]" />
            </TableHead>
            <TableHead className="text-center">
              <Skeleton className="h-5 w-[60px] mx-auto" />
            </TableHead>
            <TableHead className="text-center">
              <Skeleton className="h-5 w-[80px] mx-auto" />
            </TableHead>
            <TableHead className="text-center">
              <Skeleton className="h-5 w-[70px] mx-auto" />
            </TableHead>
            <TableHead className="text-center">
              <Skeleton className="h-5 w-[80px] mx-auto" />
            </TableHead>
            <TableHead className="text-center">
              <Skeleton className="h-5 w-[90px] mx-auto" />
            </TableHead>
            <TableHead className="text-center">
              <Skeleton className="h-5 w-[70px] mx-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Generate 10 skeleton rows to match itemsPerPage */}
          {[...Array(10)].map((_, index) => (
            <TableRow key={index} className="hover:bg-muted/50 cursor-pointer">
              {/* ID column */}
              <TableCell className="pl-6 pr-1 py-3 w-[80px]">
                <Skeleton className="h-5 w-[50px]" />
              </TableCell>
              
              {/* Status column */}
              <TableCell className="w-[120px]">
                <Skeleton className="h-6 w-[100px] rounded-full" />
              </TableCell>
              
              {/* Summary column */}
              <TableCell>
                <Skeleton className="h-5 w-[90%] max-w-[400px]" />
              </TableCell>
              
              {/* Type column */}
              <TableCell className="text-center w-[100px]">
                <Skeleton className="h-6 w-6 rounded-md mx-auto" />
              </TableCell>
              
              {/* Priority column */}
              <TableCell className="text-center w-[120px]">
                <Skeleton className="h-5 w-[80px] rounded-full mx-auto" />
              </TableCell>
              
              {/* Impact column */}
              <TableCell className="text-center w-[100px]">
                <Skeleton className="h-5 w-[70px] rounded-full mx-auto" />
              </TableCell>
              
              {/* Client column */}
              <TableCell className="text-center w-[150px]">
                <div className="flex items-center justify-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-5 w-[70px]" />
                </div>
              </TableCell>
              
              {/* Assignee column */}
              <TableCell className="text-center w-[120px]">
                <Skeleton className="h-8 w-8 rounded-full mx-auto" />
              </TableCell>
              
              {/* Viewers column */}
              <TableCell className="text-center w-[100px]">
                <div className="flex justify-center">
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Pagination skeleton */}
      <div className="flex justify-between items-center px-4 py-2">
        <Skeleton className="h-5 w-[120px]" /> {/* Page info */}
        <div className="flex space-x-1">
          <Skeleton className="h-8 w-8 rounded-md" /> {/* First page */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Previous */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Page 1 */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Page 2 */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Page 3 */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Next */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Last page */}
        </div>
      </div>
    </div>
  )
}
