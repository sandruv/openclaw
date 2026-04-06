'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { exportTasksToExcel, exportTimeEntriesToExcel, exportActivitiesToExcel, downloadExcel } from '@/services/exportService'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ExportType = "tasks" | "timeEntries" | "activities"

const exportMap = {
  tasks: {
    fn: exportTasksToExcel,
    filename: "tasks"
  },
  timeEntries: {
    fn: exportTimeEntriesToExcel,
    filename: "time-entries"
  },
  activities: {
    fn: exportActivitiesToExcel,
    filename: "activities"
  }
}

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)
  const { showToast } = useToast()
  const { compactMode } = useSettingsStore()

  const handleExport = async (type: ExportType) => {
    try {
      setIsExporting(true)
      
      const { fn, filename } = exportMap[type]

      // Call the export service
      const exportResponse = await fn()
      
      if (exportResponse.status === 'error') {
        throw new Error(exportResponse.message || 'Export failed')
      }
      
      // Download the XLSX file using the service
      downloadExcel(exportResponse.data as Blob, filename)
      
      showToast({
        title: 'Export successful',
        description: 'Tasks exported to XSLX file',
        type: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Export error:', error)
      showToast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        type: 'error',
        duration: 5000,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const button = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className={`flex items-center ${compactMode ? 'px-2' : 'mr-2 gap-2'}`}
        >
          {isExporting ? (
            <>
              <Loader2 className={`h-4 w-4 animate-spin ${!compactMode ? 'mr-2' : ''}`} />
              {!compactMode && <span>Exporting...</span>}
            </>
          ) : (
            <>
              <Download className={`h-4 w-4 ${!compactMode ? 'mr-2' : ''}`} />
              {!compactMode && <span>Export</span>}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("tasks")}>
          Tasks
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport("timeEntries")}>
          Time Entries
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport("activities")}>
          Activities
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (compactMode) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{isExporting ? 'Exporting...' : 'Export'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}
