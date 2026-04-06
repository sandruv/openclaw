'use client'

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { DashboardHeader } from "./header"
import { DashboardFooter } from "./footer"
import { Sidebar } from "./sidebar"
import { ChatPanelAttached } from "@/components/chat/subcomponents/ChatPanelAttached"
import { useDashboardSettingsStore } from "@/stores/useDashboardSettingsStore"
import { RoleSimulationBanner } from "@/components/admin/view-as-role"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { settings, updateSetting } = useDashboardSettingsStore()
  const isChatExpanded = settings.chatExpanded
  
  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleCloseChatPanel = () => {
    updateSetting('chatExpanded', false)
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar-container')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [sidebarOpen])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Role Simulation Banner */}
      <RoleSimulationBanner />
      
      {/* Main area with sidebar and content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile when closed */}
        <div 
          id="sidebar-container"
          className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar />
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex flex-1 overflow-hidden">
            {/* Page content */}
            <div className={cn(
              "flex-1 overflow-auto styled-scrollbar bg-gray-100 dark:bg-gray-800 transition-all duration-300",
              isChatExpanded && "mr-0"
            )}>
              {children}
            </div>
            
            {/* Expanded Chat Panel - Right side */}
            {isChatExpanded && (
              <div className="w-[400px] shrink-0 h-full border-l bg-background">
                <ChatPanelAttached 
                  onClose={handleCloseChatPanel}
                  onDetach={handleCloseChatPanel}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer - spans full width including sidebar */}
      <DashboardFooter />
    </div>
  )
}
