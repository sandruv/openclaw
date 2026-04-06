'use client'

import { useEffect, useState } from "react"
import { useClientStore } from "@/stores/useClientStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useParams, usePathname, notFound } from "next/navigation"
import { Building2, Loader2 } from "lucide-react"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ClientLayoutSkeleton } from "@/components/clients/clients-tab/details/loaders/skeleton-loader"
import { ClientErrorState } from "@/components/clients/clients-tab/details/loaders/ClientErrorState"
import { Client } from "@/types/clients"

interface LayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: LayoutProps) {
  const pathname = usePathname()
  const params = useParams()
  
  if (!params?.clientId) {
    notFound()
  }

  const clientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId
  const { client, getClientById, isFetchingClient, error } = useClientStore()

  const isUpdateRoute = pathname?.endsWith('/details/update')

  useEffect(() => {
    const loadClient = async () => {
      await setTimeout(() => ({}), 500)
      await getClientById(Number(clientId))
    }

    loadClient()
  }, [clientId, getClientById])

  // Show error state if there's an error or no client found
  if (error) {
    return (
      <ClientErrorState 
        title="Client Not Found"
        message={error || "The client you're looking for doesn't exist or has been deleted."}
      />
    )
  }

  // Show loading skeleton
  if (isFetchingClient || !client) {
    return <ClientLayoutSkeleton />
  }

  const tabs = [
    { name: 'Details', href: `/clients/${clientId}/details`, section: 'details' },
    { name: 'Users', href: `/clients/${clientId}/users`, section: 'users' },
    { name: 'Sites', href: `/clients/${clientId}/sites`, section: 'sites' },
    { name: 'Tasks', href: `/clients/${clientId}/tasks`, section: 'tasks' },
  ]

  return (
    <div>
      <div className="container max-w-full p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="flex justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 space-x-4">
              <Avatar className="h-12 w-12 border dark:border-gray-700">
                <AvatarFallback className="bg-primary/10 dark:bg-primary/20">
                  <Building2 className="h-6 w-6 dark:text-gray-300" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold truncate dark:text-gray-100">
                  {client.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {client.description || 'No description'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            {tabs.map((tab) => {
              const isActive = pathname?.includes(tab.section)
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={cn(
                    'flex items-center h-8 rounded-md px-4 text-sm font-medium transition-colors hover:text-primary dark:hover:text-primary/90',
                    {
                      'text-primary bg-gray-100 dark:bg-gray-800 dark:text-primary/90': isActive,
                      'text-gray-300 dark:text-gray-500': !isActive,
                    }
                  )}
                >
                  {tab.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container max-w-full">
        {children}
      </div>
    </div>
  )
}
