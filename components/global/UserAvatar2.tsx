'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSessionStore } from '@/stores/useSessionStore'
import { getInitials, getAvatarColor } from '@/lib/utils'

interface UserAvatar2Props {
  className?: string
  avatarUrl?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number
  userId?: string | number
  userName?: string
  fontSize?: number
}

export function UserAvatar2({ 
  className = '', 
  avatarUrl = '', 
  fallback = 'U',
  size = 'md',
  userId,
  userName,
  fontSize,
}: UserAvatar2Props) {
  const { user } = useSessionStore()
  
  // Use provided userName/userId or get from store
  const displayName = userName || (user ? `${user.first_name} ${user.last_name}`.trim() : 'User')
  const userInitials = getInitials(displayName || fallback)
  const id = userId || (user?.id || 0)
  const avatarColor = getAvatarColor(id)

  // Calculate size classes based on size prop
  let sizeClass = ''
  let textSizeClass = ''
  
  // Convert size to numeric value for calculations
  let numericSize = 0
  let calculatedFontSize = 0
  
  if (typeof size === 'number') {
    // If size is a number, use it directly as pixel value
    numericSize = size
    sizeClass = `h-[${size}px] w-[${size}px]`
  } else {
    // Predefined sizes mapping to pixel values
    switch (size) {
      case 'xs':
        sizeClass = 'h-6 w-6'
        numericSize = 24
        break
      case 'sm':
        sizeClass = 'h-8 w-8'
        numericSize = 32
        break
      case 'md':
        sizeClass = 'h-10 w-10'
        numericSize = 36
        break
      case 'lg':
        sizeClass = 'h-12 w-12'
        numericSize = 47
        break
      case 'xl':
        sizeClass = 'h-16 w-16'
        numericSize = 64
        break
      case '2xl':
        sizeClass = 'h-24 w-24'
        numericSize = 96
        break
      default:
        sizeClass = 'h-10 w-10'
        numericSize = 40
    }
  }
  
  // Dynamic font size calculation: approximately size/2.3 for optimal proportions
  // This gives us font-size of ~35px when avatar size is 80px
  // Use provided fontSize if available, otherwise calculate based on size
  calculatedFontSize = fontSize !== undefined ? fontSize : Math.round(numericSize / 2.3)

  return (
    <Avatar className={`${sizeClass} ${className}`}>
      <AvatarImage src={avatarUrl} alt={displayName} />
      <AvatarFallback 
        className={`${avatarColor} text-white`}
        style={{ fontSize: `${calculatedFontSize}px` }}
      >
        {userInitials}
      </AvatarFallback>
    </Avatar>
  )
}
