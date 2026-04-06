"use client"

import TaskSearch from './useChat/ToolComponent'
import { UITools } from './ui-tools'

export function AISDKComponent() {
  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="border rounded-lg">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold mb-0">AI SDK Tool calling</h2>
          </div>
          {/* <ChatComponent /> */}
          <TaskSearch />
        </div>

        <div className="border rounded-lg">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold mb-0">UI Tools</h2>
          </div>
          <UITools />
        </div>
      </div>
    </div>
  )
}