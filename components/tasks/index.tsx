'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { List, LayoutGrid } from 'lucide-react'
import TaskTable from './list-view'
import KanbanView from './kanban-view'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { cn } from '@/lib/utils'

export default function TasksView() {
  const { compactMode, taskViewMode, setTaskViewMode } = useSettingsStore()

  return (
    <div data-testid="tasks-page" className="relative">
      {/* Persistent toast-like view toggle at the top center */}
      <div className="fixed top-[-10px] left-1/2 transform -translate-x-1/2 z-50">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t-0 border-0 shadow-md p-1 pt-6 px-2">
          {/* <p className="text-xs text-gray-400 ml-1 mb-1">Toggle View:</p> */}
          <Tabs 
            defaultValue={taskViewMode} 
            value={taskViewMode}
            onValueChange={(value) => setTaskViewMode(value as 'list' | 'kanban')}
          >
            <TabsList className="bg-transparent gap-2">
              <TabsTrigger 
                value="list" 
                className={cn(
                  "flex items-center gap-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700",
                  compactMode ? "px-2" : "px-3"
                )}
              >
                <List className="h-4 w-4" />
                {!compactMode && "List"}
              </TabsTrigger>
              <TabsTrigger 
                value="kanban" 
                className={cn(
                  "flex items-center gap-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700",
                  compactMode ? "px-2" : "px-3"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                {!compactMode && "Kanban"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>
      </div>

      {taskViewMode === 'list' ? (
        <TaskTable />
      ) : (
        <KanbanView />
      )}
    </div>
  )
}
