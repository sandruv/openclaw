'use client'

import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from 'react-resizable-panels'
import { TaskListPanel } from './panels/task-list'
import { TaskDetailsPanel } from './panels/task-details'

interface TasksNewShellProps {
  selectedId?: string
  children?: React.ReactNode
}

export function TasksNewShell({ selectedId, children }: TasksNewShellProps) {
  return (
    <div className="relative">
      <PanelGroup direction="horizontal" className="h-[calc(100vh-70px)]">
        <Panel defaultSize={18} minSize={15} maxSize={30}>
          <TaskListPanel selectedId={selectedId} />
        </Panel>
        
        <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/50 transition-colors" />
        
        <Panel defaultSize={82} minSize={50}>
          <TaskDetailsPanel selectedId={selectedId} />
        </Panel>
      </PanelGroup>
    </div>
  )
}
