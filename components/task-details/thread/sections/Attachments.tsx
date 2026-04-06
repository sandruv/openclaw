'use client'

import { FileData } from "@/types/upload"
import { FileIcon, ImageIcon, FileTextIcon, DownloadIcon, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { localStorageService } from "@/services/localStorageService"
import { useState } from "react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/toast-provider"
import { getErrorMessage } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { useSettingsStore } from "@/stores/useSettingsStore"

interface AttachmentsProps {
  files?: FileData[]
  compact?: boolean
}

export function Attachments({ files, compact }: AttachmentsProps) {
  const { compactMode } = useSettingsStore()
  
  // Use the prop if provided, otherwise use the value from the store
  const isCompact = compact !== undefined ? compact : compactMode
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const { showToast } = useToast()

  if (!files || files.length === 0) {
    return null
  }

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || ''
    const iconSize = isCompact ? "h-4 w-4" : "h-5 w-5"
    
    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
      return <ImageIcon className={`${iconSize} text-green-500`} />
    }
    
    // Document types
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return <FileTextIcon className={`${iconSize} text-blue-500`} /> 
    }
    
    // Default file icon for other types
    return <FileIcon className={`${iconSize} text-gray-500`} />
  }

  const handleDownload = async (file: FileData) => {
    try {
      setLoading({ ...loading, [file.id]: true })
      const blob = await localStorageService.downloadFile(file)
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary anchor element
      const a = document.createElement('a')
      a.href = url
      a.download = file.file_name
      document.body.appendChild(a)
      
      // Trigger the download
      a.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      logger.error('Error downloading file:', error)
      const error_msg = getErrorMessage(error)
      
      showToast({
        title: 'Download Failed',
        description: error_msg,
        type: 'error'
      })
    } finally {
      setLoading({ ...loading, [file.id]: false })
    }
  }

  const getShortFileName = (filename: string) => {
    return filename.length > 20 ? filename.substring(0, 20) + '...' : filename
  }

  return (
    <div className={`mt-3 p-2 rounded-md ${isCompact ? 'mt-2 p-1' : ''}`}>
      <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-right font-medium text-gray-700 mb-2`}>
        {isCompact ? `Files (${files.length})` : `Attachments (${files.length})`}
      </p>
      <div className={`flex flex-wrap flex-row-reverse ${isCompact ? 'gap-1' : 'gap-2'}`}>
        {files.map((file) => (
          <TooltipProvider key={file.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center ${isCompact ? 'gap-1 h-6 px-1.5 py-0.5 text-[10px]' : 'gap-2 h-8 px-2 py-1 text-xs'}`}
                  onClick={() => handleDownload(file)}
                  disabled={loading[file.id]}
                >
                  {getFileIcon(file.file_name)}
                  {isCompact ? (
                    <span className="max-w-[50px] truncate">{getShortFileName(file.file_name)}</span>
                  ) : (
                    <span className="max-w-[100px] truncate">{file.file_name}</span>
                  )}
                  {loading[file.id] ? (
                    <Loader2 className={`${isCompact ? 'h-2 w-2' : 'h-3 w-3'} text-gray-500 animate-spin`} />
                  ) : (
                    <DownloadIcon className={`${isCompact ? 'h-2 w-2' : 'h-3 w-3'} text-gray-500`} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{file.file_name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}
