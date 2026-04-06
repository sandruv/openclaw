'use client'

import React from 'react'
import { TableCell } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useTaskSelectionStore } from '@/stores/useTaskSelectionStore'

interface SelectColumnProps {
  taskId: number
  isSelected: boolean
  onSelect: (taskId: number, selected: boolean, isShiftClick?: boolean) => void
  onClick?: (e: React.MouseEvent) => void
  useDebounced?: boolean // Option to use debounced selection for rapid changes
}

export function SelectColumn({ taskId, isSelected, onSelect, onClick, useDebounced = false }: SelectColumnProps) {
  // Get debounced selection method for performance optimization
  const selectTaskDebounced = useTaskSelectionStore((state) => state.selectTaskDebounced)
  // Create a wrapper handler for the checkbox to ensure we prevent navigation
  const handleWrapperClick = (e: React.MouseEvent) => {
    // Always prevent default and stop propagation to avoid navigation
    e.preventDefault();
    e.stopPropagation();
  }
  
  const handleCellClick = (e: React.MouseEvent) => {
    // Prevent default browser action and event bubbling to parent row
    e.preventDefault();
    e.stopPropagation(); 
    
    // Toggle selection with shift key tracking
    const newCheckedState = !isSelected;
    const isShiftClick = e.shiftKey;
    
    // Use debounced selection if enabled, otherwise use regular selection
    if (useDebounced) {
      selectTaskDebounced(taskId, newCheckedState, isShiftClick);
    } else {
      onSelect(taskId, newCheckedState, isShiftClick);
    }
    
    if (onClick) {
      onClick(e);
    }
  }

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    // Get shift key state from the most recent keyboard event
    // This is a best-effort approach as the actual event isn't passed to the handler
    const isShiftClick = window.event && 'shiftKey' in window.event ? 
      (window.event as any).shiftKey : false;
    
    // Only handle definite boolean states
    if (typeof checked === 'boolean') {
      // Use debounced selection if enabled, otherwise use regular selection
      if (useDebounced) {
        selectTaskDebounced(taskId, checked, isShiftClick);
      } else {
        onSelect(taskId, checked, isShiftClick);
      }
    }
  }

  return (
    <TableCell className="w-12 px-3 pt-3" onClick={handleCellClick}>
      <div onClick={handleWrapperClick}>  {/* Extra wrapper to capture checkbox area clicks */}
        <Checkbox
          className={cn("border-gray-300 dark:border-gray-600")}
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          aria-label={`Select task ${taskId}`}
          onClick={(e) => {
            // Ensure checkbox clicks don't bubble up and trigger row navigation
            e.stopPropagation();
            e.preventDefault();
            handleCellClick(e);
          }}
        />
      </div>
    </TableCell>
  )
}
