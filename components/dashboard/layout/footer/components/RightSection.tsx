import { ChatButton } from './ChatButton'
import { HelpCircleButton } from './HelpCircleButton'
import { TimeDisplay } from './TimeDisplay'

interface RightSectionProps {
  currentTime: Date
  onChatToggle: () => void
  isChatActive?: boolean
}

export const RightSection = ({ currentTime, onChatToggle, isChatActive }: RightSectionProps) => {
  return (
    <div className="flex items-center gap-2">
      <ChatButton onClick={onChatToggle} isActive={isChatActive} />
      <HelpCircleButton />
      <TimeDisplay currentTime={currentTime} />
    </div>
  )
}
