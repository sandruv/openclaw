'use client'

import { useEffect } from "react"
import { useUserStore } from "@/stores/useUserStore"
import { UserDetailsTab } from "./UserDetailsTab"

interface UserDetailsProps {
  userId: string
}

export function UserDetails({ userId }: UserDetailsProps) {
  const { user, getUser, isFetchingUser } = useUserStore()

  useEffect(() => {
    getUser(Number(userId))
  }, [userId, getUser])

  if (isFetchingUser) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-lg mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <UserDetailsTab user={user} />
    </div>
  )
}
