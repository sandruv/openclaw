'use client'

import { useSessionStore } from '@/stores/useSessionStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials, getAvatarColor } from '@/lib/utils'

export function ProfilePage() {
  const { user } = useSessionStore()
  
  const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'User'
  const userInitials = user ? getInitials(userName) : 'U'
  const avatarColor = user ? getAvatarColor(user.id) : 'bg-gray-500'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} alt={userName} />
              <AvatarFallback className={`${avatarColor} text-white text-2xl font-semibold`}>
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{userName}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
