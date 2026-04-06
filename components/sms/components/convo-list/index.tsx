'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSmsStore } from '@/stores/useSmsStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ChevronDown, MessageSquarePlus, Settings, Search, Filter } from "lucide-react"
import { ConvoUser } from "./convo-user"
import { ConvoSkeleton } from "./convo-skeleton"
import { useRouter, usePathname } from 'next/navigation'

type FilterType = 'all' | 'contact' | 'message'

export function ConvoList() {
  const router = useRouter()
  const pathname = usePathname()
  const { conversations } = useSmsStore()
  const [pageSize, setPageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [isLoading, setIsLoading] = useState(true)

  const pageSizeOptions = [25, 50, 100]
  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'contact', label: 'Contact Name' },
    { value: 'message', label: 'Message Content' },
  ]

  const currentConvoId = pathname?.split('/').pop()

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filterConversations = (convo: any) => {
    const query = searchQuery.toLowerCase()
    const contactMatch = convo.contact.toLowerCase().includes(query)
    const messageMatch = convo.messages[convo.messages.length - 1]?.content.toLowerCase().includes(query)

    switch (filterType) {
      case 'contact':
        return contactMatch
      case 'message':
        return messageMatch
      default:
        return contactMatch || messageMatch
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8">
                Open {pageSize}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {pageSizeOptions.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={pageSize === size ? "bg-accent" : ""}
                >
                  Show {size} conversations
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="w-8 h-8">
              <MessageSquarePlus className="h-3 w-3" />
            </Button>

            <Button variant="outline" size="icon" className="w-8 h-8">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="w-8 h-8 flex-shrink-0">
                <Filter className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFilterType(option.value)}
                  className={filterType === option.value ? "bg-accent" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ConvoSkeleton key={i} />
            ))
          ) : (
            conversations
              .filter(filterConversations)
              .slice(0, pageSize)
              .map((convo) => (
                <ConvoUser
                  key={convo.id}
                  contact={convo.contact}
                  lastMessage={convo.messages[convo.messages.length - 1]?.content}
                  timestamp={convo.messages[convo.messages.length - 1]?.timestamp}
                  isSelected={currentConvoId === convo.id}
                  onClick={() => router.push(`/sms/${convo.id}`)}
                />
              ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
