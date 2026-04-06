'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  const tabs = [
    { name: 'General', href: '/settings/general' },
    { name: 'Forms', href: '/settings/forms' },
    { name: 'Global', href: '/settings/global' },
    // { name: 'Notifications', href: '/settings/notifications' },
    // { name: 'Security', href: '/settings/security' },
    { name: 'AI Usage', href: '/settings/ai-usage' },
  ]

  return (
    <div className="container max-w-full">
      <div className="bg-gray-100 dark:bg-gray-800">
        <nav className="p-3 flex gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'w-28 h-8 flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                pathname === tab.href
                  ? 'bg-background text-foreground shadow-md dark:bg-gray-900 dark:text-gray-100'
                  : 'text-muted-foreground hover:text-primary dark:text-gray-300 dark:hover:text-white'
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}
