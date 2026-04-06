'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Pencil, Trash2, MoreVertical } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Tool, deleteTool } from '@/services/toolService'
import { useToast } from '@/components/ui/toast-provider'
import parse from 'html-react-parser'
import { EditToolDialog } from './EditToolDialog'

interface ToolItemProps {
  tool: Tool
  isImage?: boolean
  isSvg?: boolean
  editMode?: boolean
  onToolUpdated: () => void
}

export const ToolItem = ({ tool, isImage = false, isSvg = true, editMode = false, onToolUpdated }: ToolItemProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { showToast } = useToast()

  const handleClick = () => {
    if (tool.link) {
      window.open(tool.link, '_blank')
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this tool?')) {
      try {
        const response = await deleteTool(tool.id)
        
        if (response.status === 200) {
          showToast({
            title: 'Success',
            description: 'Tool deleted successfully',
            type: 'success'
          })
          onToolUpdated()
        } else {
          showToast({
            title: 'Error',
            description: response.message || 'Failed to delete tool',
            type: 'error'
          })
        }
      } catch (error) {
        showToast({
          title: 'Error',
          description: 'An unexpected error occurred',
          type: 'error'
        })
        console.error('Error deleting tool:', error)
      }
    }
  }

  return (
    <>
      <div 
        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all border border-gray-100 dark:border-gray-800 hover:border-green-500 hover:shadow-md hover:scale-105 w-[120px] h-[120px] group relative ${editMode ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={editMode ? undefined : handleClick}
      >
        {/* Icon */}
        <div 
          className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center`}
          style={{ backgroundColor: tool.color || '#dbeafe', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          {isImage && tool.icon ? (
            <Image src={tool.icon} alt={tool.name} width={30} height={30} className="object-contain" />
          ) : isSvg && tool.icon ? (
            <div className="w-6 h-6 flex items-center justify-center text-white">
              {parse(tool.icon)}
            </div>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center text-white">
              🔧
            </div>
          )}
        </div>
        
        {/* Label */}
        <span className="text-xs font-medium text-center">{tool.name}</span>

        {/* Edit mode overlay */}
        {editMode && (
          <div className="absolute inset-0 bg-gray-100/70 dark:bg-black/20 rounded-lg flex items-center justify-center z-50">
            <div className="flex gap-2">
              <button 
                className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 rounded-full text-blue-600 dark:text-blue-300 cursor-pointer shadow-md"
                onClick={handleEdit}
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 rounded-full text-red-600 dark:text-red-300 cursor-pointer shadow-md"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <EditToolDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        tool={tool}
        onToolUpdated={onToolUpdated}
      />
    </>
  )
}
