'use client'

import { UserDetailsTab } from '@/components/clients/users-tab/details/UserDetailsTab'
import { useUserStore } from '@/stores/useUserStore'

export default function UserDetailsPageClient() {
  const { user } = useUserStore()

  if (!user) {
    return "No user found"
  }

  return <UserDetailsTab user={user} />
}
