'use client'

import React, { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { AddToolDialog } from './AddToolDialog'

interface AddToolButtonProps {
  toolType: 'personal' | 'company'
}

export const AddToolButton = ({ toolType }: AddToolButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div 
        className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all border border-dashed border-gray-300 dark:border-gray-700 hover:border-green-500 hover:shadow-md w-[120px] h-[120px] group"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="p-2 rounded-full mb-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30">
          <PlusIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
        </div>
        <span className="text-xs font-medium text-center text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400">
          Add {toolType === 'personal' ? 'Personal' : 'Company'} Tool
        </span>
      </div>

      <AddToolDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        toolType={toolType} 
      />
    </>
  )
}
