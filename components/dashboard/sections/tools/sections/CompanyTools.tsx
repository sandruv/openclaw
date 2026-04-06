'use client'

import React from 'react'
import Image from 'next/image'
import { useToolsStore } from '@/stores/useToolsStore'
import { ChevronDown, ChevronRight, InfoIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ToolItem } from '../subcomponents/ToolItem'
import { AddToolButton } from '../subcomponents/AddToolButton'
import { ToolItemLoader } from '@/components/dashboard/loaders/ToolItemLoader'
import parse from 'html-react-parser'

interface CompanyToolProps {
  icon: React.ReactNode | string
  label: string
  link?: string | null
  color: string
  isImage?: boolean
  isSvg?: boolean
}

interface CompanyToolsProps {
  isLoading: boolean
  editMode: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const CompanyToolItem = ({ icon, label, link, color, isImage = false, isSvg = false }: CompanyToolProps) => {
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
        style={{ backgroundColor: color || '#dbeafe', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
      >
        {isImage && typeof icon === 'string' ? (
          <Image src={icon} alt={label} width={30} height={30} className="object-contain" />
        ) : isSvg && typeof icon === 'string' ? (
          <div className="w-6 h-6 flex items-center justify-center text-white">
            {parse(icon)}
          </div>
        ) : (
          <div className="w-6 h-6 flex items-center justify-center text-white">
            {icon}
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-center">{label}</span>
    </div>
  )
}

export const CompanyTools = ({ isLoading, editMode, isCollapsed, onToggleCollapse }: CompanyToolsProps) => {
  const { companyTools, fetchCompanyTools } = useToolsStore()
  
  const handleToolUpdated = (clientId: number) => {
    if (clientId) {
      fetchCompanyTools(clientId)
    }
  }

  return (
    <div>
      {/* Company Tools Section */}
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
            Company Tools
          </h3>
        </div>
        
        {!isCollapsed && (
          isLoading ? (
            // Show skeletons while loading
            <ToolItemLoader count={3} />
          ) : companyTools.length > 0 ? (
            // Show company tools from the database
            <div className="flex flex-wrap gap-2">
              {companyTools.map((tool) => (
                <ToolItem
                  key={`company-${tool.id}`}
                  tool={tool}
                  isSvg={true}
                  editMode={editMode}
                  onToolUpdated={() => handleToolUpdated(tool.client_id || 0)}
                />
              ))}
              {editMode && (
                <AddToolButton toolType="company" />
              )}
            </div>
          ) : (
            // Show empty state
            <div>
              {editMode ? (
                <AddToolButton toolType="company" />
              ) : (
                <Alert className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 border-dashed">
                  <div className="flex items-center">
                    <InfoIcon className="h-4 w-4 text-gray-400 dark:text-gray-400 mr-2" />
                    <AlertDescription className="text-sm text-gray-400 dark:text-gray-400">
                      No company tools available. Click the Edit tools button to add your first company tool.
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
