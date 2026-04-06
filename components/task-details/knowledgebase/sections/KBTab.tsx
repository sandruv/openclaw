"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"

interface KBSuggestion {
  id: number
  title: string
  short_description: string
  url: string
  last_updated: string
  updated_by: string
}

export function KBTab() {
  const [suggestions, setSuggestions] = useState<KBSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { task } = useTaskDetailsStore()

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!task) return

      setIsLoading(true)
      // Simulate API call

      // In a real scenario, we would fetch KB suggestions based on the ticket
      const mockSuggestions: KBSuggestion[] = [
        {
          id: 1,
          title: "Common IT support issues",
          short_description: "A comprehensive guide to resolving frequent IT problems.",
          url: "https://perfectwiki.com/common-it-issues",
          last_updated: "2023-11-15",
          updated_by: "John Doe"
        },
        {
          id: 2,
          title: "Software installation guide",
          short_description: "Step-by-step instructions for installing various software packages.",
          url: "https://perfectwiki.com/software-installation",
          last_updated: "2023-11-10",
          updated_by: "Jane Smith"
        },
        {
          id: 3,
          title: "Company policies and procedures",
          short_description: "Overview of important company guidelines and processes.",
          url: "https://perfectwiki.com/policies",
          last_updated: "2023-11-05",
          updated_by: "Mike Johnson"
        },
        {
          id: 4,
          title: "Network troubleshooting",
          short_description: "Techniques for diagnosing and fixing network connectivity issues.",
          url: "https://perfectwiki.com/network-troubleshooting",
          last_updated: "2023-11-01",
          updated_by: "Sarah Brown"
        },
        {
          id: 5,
          title: "Data backup and recovery",
          short_description: "Best practices for ensuring data safety and restoration procedures.",
          url: "https://perfectwiki.com/data-backup",
          last_updated: "2023-10-28",
          updated_by: "Alex Lee"
        }
      ]

      setSuggestions(mockSuggestions)
      setIsLoading(false)
    }

    fetchSuggestions()
  }, [task])

  if (!task) return null

  return (
    <ScrollArea className="h-[calc(100vh-110px)] pb-2 pr-3">
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      )}
    </ScrollArea>
  )
}

function SuggestionCard({ suggestion }: { suggestion: KBSuggestion }) {
  return (
    <Link href={suggestion.url} target="_blank" rel="noopener noreferrer">
      <Card className="hover:bg-gray-100 transition-colors duration-200 mb-2">
        <CardContent className="p-4">
          <h3 className="text-md font-semibold mb-2">{suggestion.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{suggestion.short_description}</p>
          <div className="text-xs text-gray-500">
            <span>Last updated: {suggestion.last_updated}</span>
            <span className="mx-2">•</span>
            <span>By: {suggestion.updated_by}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-2 mt-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}