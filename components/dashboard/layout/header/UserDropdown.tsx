'use client'

import { useRouter } from "next/navigation"
import { User, Settings, LogOut, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '@/contexts/AuthContext'
import { useSessionStore } from '@/stores/useSessionStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { useThemeColor } from '@/hooks/useThemeColor'

export function UserDropdown() {
  const router = useRouter()
  const { logout } = useAuth()
  const { user } = useSessionStore()
  const { darkMode, setDarkMode } = useSettingsStore()
  const themeColor = useThemeColor()

  const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'User'
  const userInitials = user ? getInitials(userName) : 'U'
  const avatarColor = user ? getAvatarColor(user.id) : 'bg-gray-500'
  
  // Map role_id to role name
  const getRoleName = (roleId?: string) => {
    const roleMap: Record<string, string> = {
      '1': 'User',
      '2': 'Agent',
      '3': 'Admin',
    }
    return roleMap[roleId || '1'] || 'User'
  }
  const userRole = getRoleName(user?.role_id)

  const handleProfile = () => {
    router.push('/dashboard/profile')
  }

  const handleSettings = () => {
    router.push('/dashboard/settings')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} alt={userName} />
            <AvatarFallback className={`text-white font-semibold`} style={{ backgroundColor: themeColor.text }}>
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-0">
        {/* User Info Header */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-lg font-semibold text-gray-900 dark:text-white text-center">
            {userName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center">
            {userRole}
          </p>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={handleProfile} 
            className="cursor-pointer px-3 py-2.5 rounded-md"
          >
            <User className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={handleSettings} 
            className="cursor-pointer px-3 py-2.5 rounded-md flex items-center justify-between"
          >
            <div className="flex items-center">
              <Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Settings</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                setDarkMode(!darkMode)
              }}
            >
              <div className="flex items-center gap-1">
                <Sun className="h-3.5 w-3.5" style={{ color: !darkMode ? themeColor.text : undefined }} />
                <Moon className="h-3.5 w-3.5" style={{ color: darkMode ? themeColor.text : undefined }} />
              </div>
            </Button>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem 
            onClick={logout} 
            className="cursor-pointer px-3 py-2.5 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Log Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
