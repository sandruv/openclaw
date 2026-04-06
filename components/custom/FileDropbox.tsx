'use client'

import { Input } from "@/components/ui/input"
import { PaperclipIcon, FileIcon, ImageIcon, FileTextIcon, XIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FileDropboxProps {
  selectedFiles: (File | string)[]
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFileRemove: (index: number) => void
  maxSize?: string
  disabled?: boolean
  className?: string
}

export function FileDropbox({ selectedFiles, onFileChange, onFileRemove, maxSize = "8mb", disabled = false, className }: FileDropboxProps) {
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || ''
    
    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
      return <ImageIcon className="h-8 w-8 text-green-500 mb-1" />
    }
    
    // Document types
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return <FileTextIcon className="h-8 w-8 text-blue-500 mb-1" />
    }
    
    // Default file icon for other types
    return <FileIcon className="h-8 w-8 text-gray-500 mb-1" />
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const newEvent = {
      target: {
        files: e.dataTransfer.files
      }
    } as React.ChangeEvent<HTMLInputElement>
    onFileChange(newEvent)
  }

  return (
    <div 
      className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer mt-0 ${disabled ? 'opacity-50 pointer-events-none text-muted-foreground' : ''} ${className || ''}`}
      onClick={() => !disabled && document.getElementById('file-upload')?.click()}
      onDrop={disabled ? undefined : handleDrop}
      onDragOver={(e) => {
        if (!disabled) {
          e.preventDefault()
          e.currentTarget.classList.add('border-blue-500')
        }
      }}
      onDragLeave={(e) => {
        if (!disabled) {
          e.preventDefault()
          e.currentTarget.classList.remove('border-blue-500')
        }
      }}
    >
      <Input
        type="file"
        onChange={onFileChange}
        className="hidden"
        id="file-upload"
        multiple
        disabled={disabled}
      />
      {selectedFiles.length > 0 ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex flex-col items-center relative group">
              <button
                type="button"
                className="absolute -right-2 -top-2 bg-white rounded-full p-0.5 shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onFileRemove(index)
                }}
                disabled={disabled}
              >
                <XIcon className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </button>
              {getFileIcon(typeof file === 'string' ? file : file.name)}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-sm text-gray-600 max-w-[50px] truncate">{typeof file === 'string' ? file : file.name}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{typeof file === 'string' ? file : file.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      ) : (
        <>
          <PaperclipIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Drop files here or click to upload</p>
        </>
      )}
      <p className="text-xs text-gray-400 mt-2">Max file size {maxSize}</p>
    </div>
  )
}
