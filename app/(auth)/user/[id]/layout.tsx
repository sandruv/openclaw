'use client'

import { useUserStore } from "@/stores/useUserStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useParams, usePathname, notFound } from "next/navigation"
import { User } from "lucide-react"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { UserLayoutSkeleton } from "@/components/clients/users-tab/details/loaders/UserLayoutSkeleton"
import { UserNotFoundError } from "@/components/clients/users-tab/details/loaders/UserNotFoundError"

interface LayoutProps {
  children: React.ReactNode
}

export default function UserLayout({ children }: LayoutProps) {
  const pathname = usePathname()
  const params = useParams()
  
  if (!params?.id) {
    notFound()
  }

  const userId = Array.isArray(params.id) ? params.id[0] : params.id
  const { user, getUser, isFetchingUser, error } = useUserStore()

  useEffect(() => {
    const loadUser = async () => {
      await setTimeout(() => ({}), 500)
      await getUser(Number(userId))
    }

    loadUser()
  }, [userId, getUser])

  // Show loading skeleton
  if (isFetchingUser || !user) {
    return <UserLayoutSkeleton />
  }

  // Show error state if there's an error or no user found
  if (error || (!isFetchingUser && !user)) {
    return (
      <UserNotFoundError 
        title="User Not Found"
        message={error || "The user you're looking for doesn't exist or has been deleted."}
      />
    )
  }

  const tabs = [
    { name: 'Details', href: `/user/${userId}/details`, section: 'details' },
    { name: 'Tasks', href: `/user/${userId}/tasks`, section: 'tasks' },
  ]

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="container max-w-full py-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 dark:bg-primary/20">
                  <User className="h-8 w-8 text-primary dark:text-primary/90" />
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-2xl font-bold dark:text-gray-100">{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}</h1>
                <p className="text-muted-foreground dark:text-gray-400">{user.client.name}</p>
              </div>
            </div>
            
            <nav className="flex gap-2">
              {tabs.map((tab) => (
                <Link
                  href={tab.href}
                  key={tab.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md',
                    pathname?.includes(`/${tab.section}`)
                      ? 'bg-gray-100 text-gray-900 shadow dark:bg-gray-800 dark:text-gray-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/60'
                  )}
                >
                  {tab.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
