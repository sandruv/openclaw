'use client'

import { Button } from "@/components/ui/button"
import { Settings, LogOut, Moon, Sun, FoldHorizontal, UnfoldHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useAuth } from '@/contexts/AuthContext'
import { useSessionStore } from '@/stores/useSessionStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { getInitials, getAvatarColor } from '@/lib/utils'

interface UserAvatarProps {
  className?: string
  avatarUrl?: string
  fallback?: string
  showDropdown?: boolean
  logoutOnly?: boolean
}

export function UserAvatar({ 
  className = '', 
  avatarUrl = '', 
  fallback = 'U',
  showDropdown = true,
  logoutOnly = false,
}: UserAvatarProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const { user } = useSessionStore()
  const { darkMode, setDarkMode, compactMode, setCompactMode } = useSettingsStore()

  const handleSettings = () => {
    router.push('/settings')
  }
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }
  
  const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'User'
  const userInitials = user ? getInitials(userName) : fallback
  const avatarColor = user ? getAvatarColor(user.id) : 'bg-gray-500'

  const AvatarComponent = (
    <Avatar className={`h-9 w-9 ${className}`}>
      <AvatarImage src={avatarUrl} alt={userName} />
      <AvatarFallback className={`${avatarColor} text-white text-sm`}>
        {userInitials}
      </AvatarFallback>
    </Avatar>
  )

  if (!showDropdown) {
    return AvatarComponent
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button data-testid="user-menu" variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          {AvatarComponent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent data-testid="user-dropdown-menu" align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!logoutOnly && (
          <>
            <DropdownMenuItem onClick={() => setDarkMode(!darkMode)} className="cursor-pointer">
              {darkMode ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCompactMode(!compactMode)} className="cursor-pointer">
              {compactMode ? (
                <UnfoldHorizontal className="mr-2 h-4 w-4" />
              ) : (
                <FoldHorizontal className="mr-2 h-4 w-4" />
              )}
              <span>{compactMode ? 'Expanded Mode' : 'Compact Mode'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem data-testid="logout-menu-item" onClick={logout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
