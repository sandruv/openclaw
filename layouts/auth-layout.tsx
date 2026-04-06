"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import NProgress from 'nprogress'
import '@/styles/nprogress.css'
import { cn } from "@/lib/utils"
import { useLoader } from "@/contexts/LoaderContext"
import { RouteLoaderDialog } from "@/components/ui/route-loader-dialog"
import { PatchUpdateDialog } from "@/components/patch-updates/PatchUpdateDialog"
import { usePatchUpdateStore } from "@/stores/usePatchUpdateStore"
import { RoleSimulationBanner } from "@/components/admin/view-as-role"
import { Sidebar } from "./components/sidebar"
import { Header } from "./components/header"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Patch Updates Dialog Integration
  const { isOpen, closeDialog, initializeDialog } = usePatchUpdateStore()

  // Initialize patch updates dialog
  useEffect(() => {
    initializeDialog()
  }, [])

  // Initialize collapsed state after mount
  useEffect(() => {
    const stored = sessionStorage.getItem('sidebar-collapsed')
    if (stored !== null) {
      setCollapsed(stored === 'true')
    }
    setIsInitialized(true)
  }, [])

  // Save collapsed state to sessionStorage only after initialization
  useEffect(() => {
    if (isInitialized) {
      sessionStorage.setItem('sidebar-collapsed', collapsed.toString())
    }
  }, [collapsed, isInitialized])

  // Configure NProgress
  useEffect(() => {
    NProgress.configure({ 
      minimum: 0.3,
      easing: 'ease',
      speed: 800,
      showSpinner: false,
    })
  }, [])

  // Handle navigation progress
  useEffect(() => {
    NProgress.start()
    
    // Add a small delay to make the progress bar visible
    const timer = setTimeout(() => {
      NProgress.done()
    }, 100)

    return () => {
      clearTimeout(timer)
      NProgress.done()
    }
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Role Simulation Banner - Fixed at top */}
      <RoleSimulationBanner />
      
      <RouteLoaderDialog />
      
      {/* Patch Updates Dialog */}
      <PatchUpdateDialog 
        open={isOpen} 
        onOpenChange={(open) => open ? undefined : closeDialog()}
        autoShow={true}
      />
      
      {/* Intersection Observer sentinel */}
      <div
        ref={sentinelRef}
        className="fixed top-0 left-0 w-0 h-0 pointer-events-none opacity-0"
        aria-hidden="true"
      />
      {/* Sidebar for larger screens */}
      <aside className={cn(
        "hidden md:flex flex-col border-r transition-all duration-300 h-screen z-50",
        collapsed ? "sidebar--collapse-w" : "w-64"
      )}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header pathname={pathname || ''} />
        
        <div className="flex-1 overflow-auto styled-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}