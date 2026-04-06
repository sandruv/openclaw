'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PanelBottomOpen } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from "react-resizable-panels";
import { cn } from '@/lib/utils'
import { TimeLogs } from './timelogs'
import { TimeFlow } from './timeflow'
import { TimetrackForm } from './timetrackform'
import { useTimerStore } from '@/stores/useTimerStore'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
export function TimerDrawer() {
  const [open, setOpen] = useState(false)
  const { timeEntries } = useTimerStore()
  const { task, isNavigating } = useTaskDetailsStore()
  const { compactMode } = useSettingsStore()
  // Only show entries for the current task
  const filteredEntries = timeEntries.filter(entry => entry.ticket_id === task?.id)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className={`flex items-center ${compactMode ? 'px-2' : 'px-3 gap-2'}`} disabled={isNavigating}>
          <PanelBottomOpen className="h-4 w-4" />
          {!compactMode && <span>Logs</span>}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[60vh] min-h-[400px] flex flex-col">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Time Tracking History</DrawerTitle>
        </DrawerHeader>
        <PanelGroup
          direction="horizontal"
          className="flex-grow p-4 pt-0 rounded-lg overflow-hidden"
        >
          <Panel defaultSize={33} minSize={25}>
            <div className="h-full overflow-auto styled-scrollbar space-y-2 pr-2 flex flex-col">
              <div className="flex justify-between items-center sticky top-0 bg-background py-2 z-10">
                <h3 className="text-sm font-medium">Time Entries</h3>
              </div>
              {/* time track form */}
              <TimetrackForm />
              <div className={cn("flex-grow overflow-y-auto styled-scrollbar", compactMode ? "pr-1" : "")}>
                <TimeLogs />
              </div>
            </div>
          </Panel>
          <PanelResizeHandle className="relative w-1 bg-border hover:bg-primary/50 transition-colors" />
          <Panel defaultSize={67} minSize={30}>
            <div className="h-full overflow-auto styled-scrollbar space-y-2 pl-4 flex flex-col">
              <div className="flex justify-between items-center sticky top-0 bg-background py-2 z-10">
                <h3 className="text-sm font-medium">Time Flow (Hourly View)</h3>
              </div>
              <div className="flex-grow overflow-y-auto">
                <TimeFlow />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </DrawerContent>
    </Drawer>
  )
}
