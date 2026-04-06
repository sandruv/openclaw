'use client'

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, FileText, CircleUser, Cog, LogOut, BotMessageSquare, Bug, Shield, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { NavLink } from "@/components/ui/nav-link"
import { usePathname } from "next/navigation"
import { useAuth } from '@/contexts/AuthContext'
import { useLoader } from '@/contexts/LoaderContext'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { usePermissions } from '@/contexts/PermissionsContext'
import { useSessionStore } from '@/stores/useSessionStore'
import { useEffect, useState } from "react"
import { TaskQueue } from "@/components/my-task-queue"

const navItems = [
  { name: "Tasks", href: "/tasks", icon: FileText, permission: "access_tasks" },
  { name: "Clients", href: "/clients", icon: CircleUser, permission: "access_clients" },
  // { name: "Chat", href: "/chat", icon: MessageCircle, permission: "access_chat" },
  { name: "Assistant", href: "/assistant", icon: BotMessageSquare, permission: "access_assistant" },
  { name: "Settings", href: "/settings/general", icon: Cog, permission: "access_settings" },
]

interface SidebarProps {
  className?: string
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ className, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const { compactMode } = useSettingsStore()
  const { setIsLoading } = useLoader()
  const { hasPermission } = usePermissions()
  const { isSuperAdmin } = useSessionStore()

  const handleLogout = () => {
    setIsLoading(true) // Show loader immediately
    logout()
  }
  const [isCollapsed, setIsCollapsed] = useState(collapsed)
  
  // Filter navigation items based on permissions (works with simulated role too)
  const filteredNavItems = navItems.filter(item => hasPermission(item.permission))
  
  // Check if user has access to admin routes
  const hasAdminAccess = hasPermission('access_admin')
  
  // Determine admin route based on user role
  const adminRoute = isSuperAdmin() ? '/admin' : '/admin/patch'

  const handleToggle = (collapsed: boolean) => {
    setCollapsed(collapsed)
    if(collapsed) {
      setTimeout(() => setIsCollapsed(collapsed), 200)
    } else {
      setIsCollapsed(collapsed)
    }
  }

  // check if isCollapsed change
  useEffect(() => {
    handleToggle(collapsed)
  }, [collapsed])

  return (
    <div className={cn("flex flex-col h-full py-4 px-1", className)}>
      <div className="flex items-center justify-between mb-4 px-3">
        <div className={cn(
          "flex items-center p-0 sm:p-4 transition-all duration-300",
          isCollapsed ? "justify-center w-full" : "justify-start",
          compactMode && "sm:p-2"
        )}>
          <Avatar className="bg-white dark:bg-gray-800 h-8 w-8">
            <AvatarImage src="/yw-logo_only.svg" alt="YW Logo" />
            <AvatarFallback><b>YW</b></AvatarFallback>
          </Avatar>
          {!collapsed && <div className="font-semibold ml-2">Portal</div>}
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            style={{ top: "15px", zIndex: 10 }}
            className={cn(
              "absolute flex-shrink-0 hidden md:flex -right-5",
              collapsed ? "w-6" : "w-8"
            )}
            onClick={() => handleToggle(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Admin button - only show for users with admin access */}
      {hasAdminAccess && (
        <div className="px-2">
          <NavLink href={adminRoute}>
            <Button
              variant={pathname.startsWith("/admin") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-300",
                collapsed ? "px-2 justify-center" : "px-4",
                compactMode && "h-9"
              )}
            >
              <Shield className={cn(
                "transition-all duration-300",
                compactMode ? "h-4 w-4" : "h-5 w-5",
                collapsed ? "mr-0" : "mr-2"
              )} />
              {!collapsed && (
                <span className={cn(
                  "transition-all duration-300",
                )}>
                  Admin
                </span>
              )}
            </Button>
          </NavLink>
        </div>
      )}

      <nav className="space-y-2 overflow-hidden px-2">
        {filteredNavItems.map((item) => (
          <NavLink key={item.href} href={item.href} className={cn(
            "transition-all duration-300 w-10",
          )}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-300",
                isCollapsed ? "px-2 justify-center" : "px-4",
                compactMode && "h-9"
              )}
            >
              <item.icon className={cn(
                "transition-all duration-300",
                compactMode ? "h-4 w-4" : "h-4 w-4",
                isCollapsed ? "mr-0" : "mr-2"
              )} />
              {!collapsed && (
                <span className={cn(
                  "transition-all duration-300",
                )}>
                  {item.name}
                </span>
              )}
            </Button>
          </NavLink>
        ))}
      </nav>
      
      <TaskQueue collapsed={isCollapsed} />

      <div className="mt-auto px-2 space-y-2">
        <NavLink href="/report-issues" className="mt-auto mb-4">
          <Button
            variant={pathname === "/report-issues" ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start transition-all duration-300",
              collapsed ? "px-2 justify-center" : "px-4",
              compactMode && "h-9"
            )}
          >
            <Bug className={cn(
              "transition-all duration-300",
              compactMode ? "h-4 w-4" : "h-5 w-5",
              collapsed ? "mr-0" : "mr-2"
            )} />
            {!collapsed && (
              <span className={cn(
                "transition-all duration-300",
              )}>
                Report Issues
              </span>
            )}
          </Button>
        </NavLink>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "transition-all duration-300 w-full justify-start",
            collapsed ? "px-2 justify-center" : "px-4",
            compactMode && "h-9"
          )}
        >
          <LogOut className={cn(
            "transition-all duration-300",
            compactMode ? "h-4 w-4" : "h-5 w-5",
            collapsed ? "mr-0" : "mr-2"
          )} />
          {!collapsed && (
            <span className={cn(
              "transition-all duration-300",
            )}>
              Logout
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
