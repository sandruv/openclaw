'use client'

import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useToolsStore } from "@/stores/useToolsStore"
import { getClient } from "@/services/clientService"
import { Client } from "@/types/clients"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  ClientHeader,
  CollapseButton,
  EssentialsSection,
  PinnedChatsSection,
  PinnedTeamChatsSection
} from "./sections"
import { SidebarLink } from "./components"
import { Home, Sparkles } from "lucide-react"
import { useConvoStore } from "@/stores/useConvoStore"

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { companyTools, fetchCompanyTools } = useToolsStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [client, setClient] = useState<Client | null>(null)
  const { loadAllConversations } = useConvoStore()

  useEffect(() => {
    loadAllConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      if (user?.client_id) {
        try {
          const response = await getClient(user.client_id)
          if (response.data) {
            setClient(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch client data:', error)
        }
      }
    }
    fetchClientData()
  }, [user?.client_id])

  // Fetch company tools for quick links
  useEffect(() => {
    if (user?.client_id) {
      fetchCompanyTools(user.client_id)
    }
  }, [user?.client_id, fetchCompanyTools])

  // Placeholder pinned team chats
  const pinnedTeamChats = [
    { id: 1, label: "Best tools for summarizing" }
    // { id: 2, label: "Claims Letter Format" },
    // { id: 3, label: "Most searched coverage" },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "flex h-full flex-col transition-all duration-300 bg-gray-100 dark:bg-gray-800",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <ClientHeader client={client} isCollapsed={isCollapsed} />
        
        <section className={cn(
          "border-tr rounded-tr-[50px] bg-white dark:bg-gray-950 h-full",
          isCollapsed ? "rounded-tr-[20px]" : "rounded-tr-[50px]"
        )}>
            <CollapseButton 
                isCollapsed={isCollapsed} 
                onToggle={() => setIsCollapsed(!isCollapsed)} 
            />
            
            {/* Dashboard Link */}
            <div className="px-4 py-2 pr-0">
              <SidebarLink
                href="/dashboard"
                icon={<Home className="h-5 w-5" />}
                label="Dashboard"
                isActive={pathname === "/dashboard"}
                isCollapsed={isCollapsed}
              />
            </div>
            
            {/* Essentials Section */}
            <EssentialsSection tools={companyTools} isCollapsed={isCollapsed} pathname={pathname} />
            
            {/* Assistant Link */}
            <div className="px-4 py-2 pr-0">
              <SidebarLink
                href="/dashboard/assistant"
                icon={<Sparkles className="h-5 w-5" />}
                label="Assistant"
                isActive={pathname === "/dashboard/assistant"}
                isCollapsed={isCollapsed}
              />
            </div>
            
            {!isCollapsed && (
                <>
                    <PinnedChatsSection isCollapsed={isCollapsed} />
                    {pinnedTeamChats.length > 0 && (
                        <PinnedTeamChatsSection chats={pinnedTeamChats} isCollapsed={isCollapsed} />
                    )}
                </>
            )}
        </section>
      </div>
    </TooltipProvider>
  )
}
