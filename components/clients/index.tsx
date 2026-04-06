'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { NavLink } from '@/components/ui/nav-link'
import { cn } from '@/lib/utils'
import { useClientStore } from '@/stores/useClientStore'
// import { useUserStore } from '@/stores/useUserStore'
// import { useSiteStore } from '@/stores/useSiteStore'

export default function CLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isClientDetailPage = pathname?.includes('/clients/') && pathname !== '/clients/users' && pathname !== '/clients/sites'

  // Get store actions
  const { fetchClients } = useClientStore()
  // const { fetchUsers } = useUserStore()
  // const { fetchSites } = useSiteStore()

  // Fetch all data when component mounts
  useEffect(() => {
    fetchClients()
    // fetchUsers()
    // fetchSites()
  }, [
    fetchClients, 
    // fetchUsers, 
    // fetchSites
  ])

  const tabs = [
    { name: 'Clients', href: '/clients' },
    { name: 'Users', href: '/clients/users' },
    { name: 'Sites', href: '/clients/sites' },
  ]

  return (
    <div className="container max-w-full">
      {!isClientDetailPage && (
        <div className="bg-gray-100 dark:bg-gray-800">
          <nav className="p-3 flex gap-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.href}
                href={tab.href}
                className={cn(
                  'w-20 h-8 flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                  pathname === tab.href
                    ? 'bg-background text-foreground shadow-sm dark:bg-gray-900 dark:text-gray-100'
                    : 'text-muted-foreground hover:text-primary dark:text-gray-300 dark:hover:text-white'
                )}
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
      <div className="flex flex-col h-full">
        {children}
      </div>
    </div>
  )
}
