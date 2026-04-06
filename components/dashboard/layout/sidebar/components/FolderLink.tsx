'use client'

import { useState } from "react"
import { Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useThemeColor } from "@/hooks/useThemeColor"

export interface FolderLinkProps {
  label: string
  isCollapsed: boolean
  children?: React.ReactNode
  defaultOpen?: boolean
}

export const FolderLink = ({ label, isCollapsed, children, defaultOpen = false }: FolderLinkProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const themeColor = useThemeColor()

  const folderContent = (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full flex items-center gap-2 rounded-lg rounded-tr-none rounded-br-none px-3 py-1.5 text-sm transition-all hover:bg-accent justify-center px-2"
      style={{ color: themeColor.text }}
    >
      {isOpen ? (
        <FolderOpen className="h-4 w-4 flex-shrink-0" />
      ) : (
        <Folder className="h-4 w-4 flex-shrink-0" />
      )}
        <>
          <span className="truncate uppercase text-xs">{label}</span>
          {isOpen ? (
            <ChevronDown className="h-3 w-3 ml-auto" />
          ) : (
            <ChevronRight className="h-3 w-3 ml-auto" />
          )}
        </>
    </button>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {folderContent}
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div>
      {folderContent}
      {isOpen && children && (
        <div className="ml-6 mt-1 flex flex-col gap-0.5">
          {children}
        </div>
      )}
    </div>
  )
}
