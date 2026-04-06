'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTaskSelectionStore } from '@/stores/useTaskSelectionStore'
import { ArchiveAction, MergeAction, AssignAction } from './actions'

interface BulkActionsBarProps {
  // Remove most props since we can get them from stores
}

export function BulkActionsBar({}: BulkActionsBarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [shouldShow, setShouldShow] = useState(false)
  
  // Get all needed data from stores directly
  const { 
    selectedCount, 
    clearSelection, 
    setMergeIntoTaskId 
  } = useTaskSelectionStore()

  // Trigger animation when selectedCount changes
  useEffect(() => {
    if (selectedCount > 0) {
      setShouldShow(true)
    } else {
      setShouldShow(false)
      // Reset merge target when selection is cleared
      setMergeIntoTaskId(null)
    }
  }, [selectedCount, setMergeIntoTaskId])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      clearSelection()
      setIsVisible(true)
    }, 300)
  }

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-200 ease-in",
        shouldShow && isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-5 opacity-0"
      )}
    >
      <div className="bg-gray-800 text-white border shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 min-w-96">
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-white rounded-full"></div>
          <span className="text-sm font-medium">
            {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <ArchiveAction />
          <MergeAction />
          <AssignAction />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 ml-2 hover:bg-white hover:text-black"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
