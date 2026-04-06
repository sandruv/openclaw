'use client'

import { LayoutGrid, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useState } from "react"

export function HeaderActions() {
  const router = useRouter()
  const themeColor = useThemeColor()
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center gap-1">
        {/* Apps/Grid Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-full text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
              style={hoveredButton === 'grid' ? { color: themeColor.text } : undefined}
              onMouseEnter={() => setHoveredButton('grid')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => router.push('/dashboard')}
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="sr-only">Dashboard Apps</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dashboard</p>
          </TooltipContent>
        </Tooltip>

        {/* Settings Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 rounded-full text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
              style={hoveredButton === 'settings' ? { color: themeColor.text } : undefined}
              onMouseEnter={() => setHoveredButton('settings')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
