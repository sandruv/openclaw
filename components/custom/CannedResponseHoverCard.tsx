import React from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cannedResponses, CannedResponse } from '@/lib/cannedResponses'
import { trimHtmlContent } from '@/lib/utils'

interface CannedResponseHoverCardProps {
  children: React.ReactNode
  onSelect?: (response: CannedResponse) => void
  content?: string
}

const CannedResponseHoverCard = ({ children, onSelect, content = "" }: CannedResponseHoverCardProps) => {
  const trimmedContent = trimHtmlContent(content)
  const hasContent = trimmedContent !== ""

  return (
    <HoverCard open={hasContent ? false : undefined}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      {!hasContent && (
        <HoverCardContent className="w-[500px] p-0 py-1" align="start">
          <ScrollArea className="h-[300px] w-full">
            <div className="space-y-1">
              {Object.values(cannedResponses).map((res) => (
                <button
                  type="button"
                  key={res.id}
                  onClick={() => onSelect?.(res)}
                  className="w-full text-left p-3 hover:bg-muted rounded-md text-sm transition-colors"
                >
                  <div className="flex flex-wrap gap-1 mb-2">
                    {res.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {trimHtmlContent(res.response)}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}

export default CannedResponseHoverCard
