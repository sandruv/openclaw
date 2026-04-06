import { FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface QuickLinkProps {
  href: string
  label: string
  isCollapsed: boolean
}

export const QuickLink = ({ href, label, isCollapsed }: QuickLinkProps) => {
  const linkContent = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-all hover:bg-accent text-muted-foreground",
        isCollapsed && "justify-center px-2"
      )}
    >
      <FolderOpen className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </a>
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
