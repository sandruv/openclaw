'use client'

import { TableCell } from "@/components/ui/table"
import { format } from "date-fns"

interface DatesColumnProps {
  createdAt: string
}

export function DatesColumn({ createdAt }: DatesColumnProps) {
  return (
    <TableCell>
      <div className="flex flex-col">
        <div className="text-xs text-muted-foreground">
          {format(new Date(createdAt), "MMM dd")}
        </div>
      </div>
    </TableCell>
  )
}
