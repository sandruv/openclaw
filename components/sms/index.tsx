'use client'

import { useState } from "react"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from "react-resizable-panels"
import { ConvoList } from "./components/convo-list"

interface SMSLayoutProps {
  children?: React.ReactNode
}

export function SMSLayout({ children }: SMSLayoutProps) {
  const [selectedId, setSelectedId] = useState<string>()

  return (
    <div className="relative">
      <PanelGroup direction="horizontal" className="min-h-[calc(100vh-theme(spacing.16))]">
        <Panel defaultSize={15} minSize={13} maxSize={25}>
          <ConvoList />
        </Panel>
        <PanelResizeHandle className="w-1 bg-border" />
        <Panel defaultSize={50} minSize={30}>
          {children && (
            <div>
              {children}
            </div>
          )}
        </Panel>
      </PanelGroup>
      
    </div>
  )
}