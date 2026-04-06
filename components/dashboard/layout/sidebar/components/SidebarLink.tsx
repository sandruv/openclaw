import Link from "next/link"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useThemeColor } from "@/hooks/useThemeColor"

export interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
  isCollapsed: boolean
}

export const SidebarLink = ({ href, icon, label, isActive, isCollapsed }: SidebarLinkProps) => {
  const themeColor = useThemeColor()
  
  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg rounded-tr-none rounded-br-none px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive ? "" : "text-muted-foreground",
        isCollapsed && "justify-center px-2"
      )}
      style={isActive ? {
        backgroundColor: `var(--theme-bg-light, ${themeColor.bgLight})`,
        color: `var(--theme-text, ${themeColor.text})`,
      } : undefined}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}
