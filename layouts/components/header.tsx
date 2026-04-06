'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Plus, Loader2, ScrollText } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useRouter } from "next/navigation"
import { useAuth } from '@/contexts/AuthContext'
import { UserAvatar } from "@/components/global/UserAvatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { usePatchUpdateStore } from "@/stores/usePatchUpdateStore"
import { cn } from "@/lib/utils"
import { NavLink } from "@/components/ui/nav-link"
import { useLoader } from "@/contexts/LoaderContext"
import { ActiveTimerPill } from "./subcomponents/ActiveTimerPill"
import { ViewAsRoleSelector } from "@/components/admin/view-as-role"

interface HeaderProps {
  pathname: string
}

export function Header({ pathname }: HeaderProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const { compactMode } = useSettingsStore()
  const { unreadUpdates, refreshUnreadCount } = usePatchUpdateStore()
  const { setIsLoading: setRouteLoading } = useLoader()

  const segments = pathname.split('/').filter(segment => segment !== '')

  // Refresh unread count periodically
  useEffect(() => {
    refreshUnreadCount()
    const interval = setInterval(() => {
      refreshUnreadCount()
    }, 300000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [refreshUnreadCount])

  const handleNewTicket = () => {
    setIsLoading(true)
    setRouteLoading(true) // Show route loader immediately
    router.push('/tasks/new')
    setTimeout(() => {
      setIsLoading(false)
    }, 5000)
  }

  const handleSettings = () => {
    setIsLoading(true)
    router.push('/settings')
    setIsLoading(false)
  }

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        {/* Mobile menu */}
        <div className="mobile-menu">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar className="p-3" collapsed={false} setCollapsed={() => {}} />
            </SheetContent>
          </Sheet>
        </div>

        <style jsx>{`
          .mobile-menu {
            display: block;
          }
          @media (min-width: 768px) {
            .mobile-menu {
              display: none;
            }
          }
        `}</style>

        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const href = `/${segments.slice(0, index + 1).join('/')}`
              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {index === segments.length - 1 ? (
                      <BreadcrumbPage>
                        <span className="capitalize">{ (segment.replace(/-/g, ' ')) }</span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <NavLink href={href}>
                          <span className="capitalize">{ (segment.replace(/-/g, ' ')) }</span>
                        </NavLink>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < segments.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center space-x-2">
        {/* Active Timer Pill */}
        <ActiveTimerPill />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleNewTicket}
                disabled={isLoading || pathname === '/tasks/new'}
                className={cn(`md:flex mr-2 bg-lime-500 hover:bg-lime-600 
                text-white hover:text-white border-none 
                p-1`, !compactMode ? 'h-8 w-auto px-3 pr-5' : 'h-8 w-10')}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Plus style={{ width: '20px', height: '20px' }} />
                )}

                {!compactMode && "New Task"}
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              className="bg-gray-900 text-white p-1 px-2 rounded"
            >
              <p className="text-sm">Create a new task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Patch Updates Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink href="/patch-updates">
                <Button
                  variant="outline"
                  className={cn(
                    "relative transition-all duration-200 mr-2",
                    !compactMode ? "h-8 w-auto px-3" : "h-8 w-10 px-0",
                    (pathname === '/patch-updates' || pathname.startsWith('/admin/patch')) && "bg-secondary"
                  )}
                >
                  <ScrollText className="h-4 w-4" />
                  {!compactMode && (
                    <span className="ml-1">Updates</span>
                  )}
                  
                  {/* Unread badge */}
                  {unreadUpdates.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className={cn(
                        "text-xs h-5 min-w-[20px] flex items-center justify-center",
                        compactMode 
                          ? "absolute -top-1 -right-1 h-4 w-4 text-[10px] p-0" 
                          : "ml-2"
                      )}
                    >
                      {unreadUpdates.length > 99 ? "99+" : unreadUpdates.length}
                    </Badge>
                  )}
                </Button>
              </NavLink>
            </TooltipTrigger>
            <TooltipContent 
              className="bg-gray-900 text-white p-1 px-2 rounded"
            >
              <p className="text-sm">
                {unreadUpdates.length > 0 
                  ? `${unreadUpdates.length} unread update${unreadUpdates.length !== 1 ? 's' : ''}`
                  : 'View patch updates'
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* View As Role Selector (Admin only) */}
        <ViewAsRoleSelector compact={compactMode} />
        
        {/* User menu */}
        <UserAvatar />
      </div>
    </header>
  )
}
