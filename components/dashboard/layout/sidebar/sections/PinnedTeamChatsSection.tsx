import { ChatLink } from "../components"

interface Chat {
  id: number
  label: string
}

interface PinnedTeamChatsSectionProps {
  chats: Chat[]
  isCollapsed: boolean
}

export const PinnedTeamChatsSection = ({ chats, isCollapsed }: PinnedTeamChatsSectionProps) => {
  return (
    <div className="flex-1 px-3 py-2 pl-6">
      {!isCollapsed && (
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Pinned Team Chats
          </span>
        </div>
      )}
      <div className="h-px bg-gray-200 dark:bg-gray-800 ml-3"></div>
      <nav className="flex flex-col gap-0.5">
        {chats.map((chat) => (
          <ChatLink
            key={chat.id}
            label={chat.label}
            isCollapsed={isCollapsed}
            onClick={() => console.log('Team chat clicked:', chat.label)}
          />
        ))}
      </nav>
    </div>
  )
}
