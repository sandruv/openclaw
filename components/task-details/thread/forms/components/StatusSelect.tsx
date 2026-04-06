'use client'

import { useEffect, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'

interface StatusSelectProps {
  value?: string
  onChange: (value: string) => void
  className?: string
}

export function StatusSelect({ value, onChange, className }: StatusSelectProps) {
  const { statuses, fetchStatuses, task } = useTaskDetailsStore()
  const initialValueSet = useRef(false)

  useEffect(() => {
    fetchStatuses()
  }, [fetchStatuses])

  useEffect(() => {
    // Set initial value to current ticket status if no value is provided
    // Only set once when component mounts and when both ticket and statuses are available
    if (!initialValueSet.current && !value && task?.status?.id && statuses.length > 0) {
      const statusExists = statuses.some(s => s.id === task.status.id)
      if (statusExists) {
        initialValueSet.current = true
        onChange(task.status.id.toString())
      }
    }
  }, [task, value, onChange, statuses])

  return (
    <div className="flex flex-col space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.id} value={status.id.toString()}>
              {status.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
