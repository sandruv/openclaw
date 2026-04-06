'use client'

import { TableCell } from "@/components/ui/table"

interface TaskIdColumnProps {
  id: number
}

export function TaskIdColumn({ id }: TaskIdColumnProps) {
  // Format task ID with leading zeros
  const formatTaskId = (id: number): string => {
    return id.toString().padStart(3, '0')
  }
  
  return (
    <TableCell className="px-1 py-1">
      {formatTaskId(id)}
    </TableCell>
  )
}
