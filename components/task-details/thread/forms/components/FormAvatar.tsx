'use client'

import { User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from '@/lib/utils'
import { useSessionStore } from '@/stores/useSessionStore'

interface FormAvatarProps {
  title: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16'
}

const iconSizes = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-10 w-10'
}

export function FormAvatar({ title, size = 'sm' }: FormAvatarProps) {
  const { user } = useSessionStore()
  const fullName = user ? `${user.first_name} ${user.last_name}` : ""

  return (
    <div className="flex items-center space-x-4 mb-4">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user?.avatar} alt={fullName} />
        <AvatarFallback className={fullName ? 'bg-green-500 text-white font-bold' : undefined}>
          {fullName ? getInitials(fullName) : <User className={iconSizes[size]} />}
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-sm font-bold">{fullName || "Unknown User"}</h2>
        <h3 className="text-sm text-muted-foreground">{title}</h3>
      </div>
    </div>
  )
}
