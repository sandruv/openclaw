"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { ComponentProps, MouseEvent, useCallback } from "react"

interface NavLinkProps extends ComponentProps<typeof Link> {
  /**
   * If true, the loader will be shown when clicking this link
   * @default true
   */
  showLoader?: boolean
}

/**
 * A wrapper around Next.js Link that shows the route loader immediately on click.
 * This provides instant visual feedback before the route transition begins.
 */
export function NavLink({ 
  children, 
  href, 
  onClick, 
  showLoader = true,
  ...props 
}: NavLinkProps) {
  const { setIsLoading } = useLoader()
  const pathname = usePathname()

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    // Get the target path from href
    const targetPath = typeof href === 'string' ? href : href.pathname || ''
    
    // Don't show loader if navigating to the same page
    if (targetPath === pathname) {
      onClick?.(e)
      return
    }

    // Show loader immediately on click
    if (showLoader) {
      setIsLoading(true)
    }

    // Call the original onClick handler if provided
    onClick?.(e)
  }, [href, pathname, onClick, setIsLoading, showLoader])

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
