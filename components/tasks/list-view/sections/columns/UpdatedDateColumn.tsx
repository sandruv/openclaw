'use client'

import { TableCell } from "@/components/ui/table"
import { format } from "date-fns"

interface UpdatedDateColumnProps {
  lastUpdated?: string
  dateClosed?: string
}

export function UpdatedDateColumn({ lastUpdated, dateClosed }: UpdatedDateColumnProps) {
  if (!lastUpdated) {
    return (
      <TableCell>
        <div className="text-xs text-muted-foreground">
          -
        </div>
      </TableCell>
    )
  }

  const formattedDate = format(new Date(lastUpdated), "MMM dd")
  const closedDate = dateClosed ? format(new Date(dateClosed), "MMM dd") : ""

  return (
    <TableCell>
      <div className="text-xs text-muted-foreground">
        {formattedDate}

        {dateClosed && (
          <div className="text-xs text-muted-foreground">
            Closed: {closedDate}
          </div>
        )}
      </div>
    </TableCell>
  )
}
