'use client'

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, ChevronLeft, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeaderActions } from "./HeaderActions"
import { UserDropdown } from "./UserDropdown"

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Generate breadcrumb items based on the current path
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    
    // Don't show breadcrumbs on the main dashboard page
    if (paths.length <= 1) return []
    
    return paths.map((path, index) => {
      // Build the URL for this breadcrumb
      const url = `/${paths.slice(0, index + 1).join('/')}`
      // Format the breadcrumb text (capitalize, replace hyphens with spaces)
      const label = path.replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        
      return { label, url }
    })
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  return (
    <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
      {/* Left section: Mobile menu toggle, back button, and breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Mobile menu toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        {/* Back button - only show if not on main dashboard */}
        {pathname !== '/dashboard' && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="mr-1"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
        )}
        
        {/* Logo for mobile */}
        <div className="flex items-center space-x-2 md:hidden">
          <Image src="/yw-logo_only.svg" alt="YW Logo" width={32} height={32} />
          <span className="text-md font-semibold">ywportal</span>
        </div>
        
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="hidden md:flex items-center text-sm">
            <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
            </Link>
            
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.url}>
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                <Link 
                  href={breadcrumb.url}
                  className={`${index === breadcrumbs.length - 1 
                    ? 'font-medium text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {breadcrumb.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* Right section: Actions and User dropdown */}
      <div className="flex items-center gap-2">
        <HeaderActions />
        <UserDropdown />
      </div>
    </header>
  )
}
