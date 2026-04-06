import { MessageSquareText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export interface ChatLinkProps {
  label: string
  isCollapsed: boolean
  onClick?: () => void
}

export const ChatLink = ({ label, isCollapsed, onClick }: ChatLinkProps) => {
  const linkContent = (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-all hover:bg-accent text-muted-foreground text-[10px]",
        isCollapsed && "justify-center px-2"
      )}
    >
      {!isCollapsed && <span className="truncate text-left">{label}</span>}
    </button>
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
