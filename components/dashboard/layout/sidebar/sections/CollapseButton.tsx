'use client'

import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useThemeColor } from "@/hooks/useThemeColor"

interface CollapseButtonProps {
  isCollapsed: boolean
  onToggle: () => void
}

export const CollapseButton = ({ isCollapsed, onToggle }: CollapseButtonProps) => {
  const themeColor = useThemeColor()
  
  return (
    <div className={cn(
      "flex items-center px-3 py-2",
      isCollapsed ? "justify-center" : "justify-start"
    )}>
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 transition-all group",
          isCollapsed ? "flex-col" : "flex-row"
        )}
      >
        <div 
          className="flex items-center justify-center rounded-full transition-all h-8 w-8"
          style={{
            backgroundColor: themeColor.bgLight,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColor.bgDark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeColor.bgLight}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" style={{ color: themeColor.text }} />
          ) : (
            <ChevronsLeft className="h-4 w-4" style={{ color: themeColor.text }} />
          )}
        </div>
        {!isCollapsed && (
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: themeColor.text }}>
            Collapse
          </span>
        )}
      </button>
    </div>
  )
}
