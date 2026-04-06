'use client'

import { TableHead } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

interface SelectAllColumnProps {
  isAllSelected: boolean
  isIndeterminate: boolean
  onSelectAll: (selected: boolean) => void
}

export function SelectAllColumn({ isAllSelected, isIndeterminate, onSelectAll }: SelectAllColumnProps) {
  const handleCheckboxChange = (checked: boolean) => {
    onSelectAll(checked)
  }

  return (
    <TableHead className="w-12 px-3">
      <Checkbox
        checked={isAllSelected}
        ref={(el) => {
          if (el) {
            const inputEl = el.querySelector('input[type="checkbox"]') as HTMLInputElement
            if (inputEl) {
              inputEl.indeterminate = isIndeterminate
            }
          }
        }}
        onCheckedChange={handleCheckboxChange}
        aria-label="Select all tasks"
      />
    </TableHead>
  )
}
