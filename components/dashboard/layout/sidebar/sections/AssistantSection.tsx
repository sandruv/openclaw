import { BotMessageSquare } from "lucide-react"
import { SidebarLink } from "../components"

interface AssistantSectionProps {
  pathname: string
  isCollapsed: boolean
}

export const AssistantSection = ({ pathname, isCollapsed }: AssistantSectionProps) => {
  return (
    <div className="px-4 py-2 pr-0">
      <SidebarLink
        href="/dashboard/assistant"
        icon={<BotMessageSquare className="h-5 w-5" />}
        label="Assistant"
        isActive={pathname === "/dashboard/assistant"}
        isCollapsed={isCollapsed}
      />
    </div>
  )
}
