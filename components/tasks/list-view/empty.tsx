'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Inbox, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTasksStore } from '@/stores/useTasksStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

interface EmptyStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  const router = useRouter()
  const { resetFilters } = useTasksStore()
  const { compactMode } = useSettingsStore()

  const handleCreateTask = () => {
    router.push('/tasks/create')
  }

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    } else {
      resetFilters()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 max-w-3xl mx-auto mt-5">
      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-slate-800 dark:border-slate-700">
        <Inbox className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <AlertTitle className="text-lg">
            No tasks found
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">Try adjusting your filters to find what you're looking for or get started by creating your first task.</p>
        </AlertDescription>

        <div className="flex gap-4 justify-end">
          <Button onClick={handleClearFilters} variant="outline" className="px-6">
            Clear Filters
          </Button>
          
          <Button onClick={handleCreateTask} className={`bg-lime-500 flex items-center ${compactMode ? 'px-2' : 'px-6 gap-2'}`}>
            <Plus className="h-4 w-4" />
            {!compactMode && <span>New Task</span>}
          </Button>
      </div>
      </Alert>
    </div>
  )
}
