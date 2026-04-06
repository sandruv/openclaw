import { Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeDate, getConversationTitle, getConversationPreview } from './utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConversationItemProps {
  conversation: {
    id: string;
    messages: Array<{ role: string; content: string }>;
    updatedAt: string;
    isPinned?: boolean;
  };
  isActive: boolean;
  onSelect: (conversationId: string) => void;
  onTogglePin: (conversationId: string) => void;
}

export function ConversationItem({ 
  conversation, 
  isActive, 
  onSelect, 
  onTogglePin 
}: ConversationItemProps) {
  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin(conversation.id);
  };

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "w-full text-left px-4 py-3 transition-colors border-l-2 border-transparent cursor-pointer",
        "hover:bg-accent/30 border-b-gray-200 border-b group",
        isActive && "bg-accent/50 border-l-gray-200"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {getConversationTitle(conversation)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {getConversationPreview(conversation)}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatRelativeDate(conversation.updatedAt)}
          </span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handlePinClick}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 p-1 hover:bg-accent/50 rounded transition-opacity",
                    conversation.isPinned && "opacity-100"
                  )}
                  aria-label={conversation.isPinned ? "Unpin conversation" : "Pin conversation"}
                >
                  <Pin 
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      conversation.isPinned ? "text-primary fill-primary" : "text-muted-foreground"
                    )} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{conversation.isPinned ? "Unpin conversation" : "Pin conversation"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
