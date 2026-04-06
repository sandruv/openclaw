'use client'

import { TableCell } from "@/components/ui/table"

interface SummaryColumnProps {
  summary: string
}

export function SummaryColumn({ summary }: SummaryColumnProps) {
  return (
    <TableCell className="max-w-[500px] w-[500px]">
      <div className="truncate">
        {summary}
      </div>
    </TableCell>
  )
}
