'use client'

import React from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ToolItem } from '../subcomponents/ToolItem'

interface DefaultToolsProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export const DefaultTools = ({ isCollapsed, onToggleCollapse }: DefaultToolsProps) => {
  // Microsoft Office tools data
  const { microsoftTools } = require('@/lib/tools-data')

  return (
    <div className="mb-6">
      {/* Section Header with Collapse Toggle */}
      <div 
        className="flex items-center mb-3 cursor-pointer group"
        onClick={onToggleCollapse}
      >
        <div className="mr-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Microsoft Office
        </h3>
      </div>
      
      {/* Tools Grid */}
      {!isCollapsed && (
        <div className="flex flex-wrap gap-2">
          {microsoftTools.map((tool: any) => (
            <div 
              key={`default-${tool.label}`}
              className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all border border-gray-100 dark:border-gray-800 hover:border-blue-500 hover:shadow-md hover:scale-105 w-[120px] h-[120px]"
              onClick={() => window.open(tool.link, '_blank')}
            >
              <div 
                className="w-12 h-12 rounded-full mb-2 flex items-center justify-center"
                style={{ backgroundColor: tool.color, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                <Image 
                  src={tool.icon} 
                  alt={`${tool.label}`} 
                  width={30} 
                  height={30} 
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-center">{tool.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
