'use client'

import React from 'react'
import { useToolsStore } from '@/stores/useToolsStore'
import { ChevronDown, ChevronRight, InfoIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToolItem } from '../subcomponents/ToolItem'
import { AddToolButton } from '../subcomponents/AddToolButton'
import { ToolItemLoader } from '@/components/dashboard/loaders/ToolItemLoader'
import parse from 'html-react-parser'

interface PersonalToolProps {
  icon: string | null
  label: string
  link?: string | null
  color: string | null
}

interface PersonalToolsProps {
  isLoading: boolean
  editMode: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const PersonalToolItem = ({ icon, label, link, color }: PersonalToolProps) => {
  const handleClick = () => {
    if (link) {
      window.open(link, '_blank')
    }
  }

  return (
    <div 
      className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all border border-gray-100 dark:border-gray-800 hover:border-green-500 hover:shadow-md hover:scale-105 w-[120px] h-[120px]"
      onClick={handleClick}
    >
      <div 
        className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center`}
        style={{ backgroundColor: color || '#f3e8ff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
      >
        {icon ? (
          <div className="w-6 h-6 flex items-center justify-center text-white">
            {parse(icon)}
          </div>
        ) : (
          <div className="w-6 h-6 flex items-center justify-center text-white">
            🔧
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-center">{label}</span>
    </div>
  )
}

export const PersonalTools = ({ isLoading, editMode, isCollapsed, onToggleCollapse }: PersonalToolsProps) => {
  const { personalTools, fetchPersonalTools } = useToolsStore()
  
  const handleToolUpdated = (userId: number) => {
    if (userId) {
      fetchPersonalTools(userId)
    }
  }

  return (
    <div>
      {/* Section Header with Collapse Toggle */}
      <div 
        className="flex items-center mb-3 cursor-pointer group"
        onClick={onToggleCollapse}
      >
        <div className="mr-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          My Tools
        </h3>
      </div>
      
      {!isCollapsed && (
        isLoading ? (
          // Show skeletons while loading
          <ToolItemLoader count={2} />
        ) : personalTools.length > 0 ? (
          // Show personal tools from the database
          <div className="flex flex-wrap gap-2">
            {personalTools.map((tool) => (
              <ToolItem
                key={`personal-${tool.id}`}
                tool={tool}
                isSvg={true}
                editMode={editMode}
                onToolUpdated={() => handleToolUpdated(tool.user_id || 0)}
              />
            ))}
            {editMode && (
              <AddToolButton toolType="personal" />
            )}
          </div>
        ) : (
          // Show empty state
          <div className="flex flex-wrap gap-2">
            {editMode ? (
              <AddToolButton toolType="personal" />
            ) : ( 
              <Alert className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 border-dashed">
                <div className="flex items-center">
                  <InfoIcon className="h-4 w-4 text-gray-400 dark:text-gray-400 mr-2" />
                  <AlertDescription className="text-sm text-gray-400 dark:text-gray-400">
                    No personal tools available. Click the Edit tools button to add your first personal tool.
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        )
      )}
    </div>
  )
}