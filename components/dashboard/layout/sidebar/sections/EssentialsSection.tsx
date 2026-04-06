'use client'

import { useEffect } from "react"
import { PencilRuler, Folder } from "lucide-react"
import { Tool } from "@/services/toolService"
import { useBookmarkStore } from "@/stores/useBookmarkStore"
import { useRouter } from "next/navigation"
import { SidebarLink } from "../components"

interface EssentialsSectionProps {
  tools: Tool[]
  isCollapsed: boolean
  pathname: string
}

export const EssentialsSection = ({ tools, isCollapsed, pathname }: EssentialsSectionProps) => {
  const router = useRouter()
  const { folders, fetchFolders } = useBookmarkStore()

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  return (
    <div className="px-4 py-2 pr-0">
      <SidebarLink
        href="/dashboard/bookmarks"
        icon={<PencilRuler className="h-5 w-5" />}
        label="Essentials"
        isActive={pathname === "/dashboard/bookmarks"}
        isCollapsed={isCollapsed}
      />
      <nav className="flex flex-col gap-0.5 pl-5">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => router.push(`/dashboard/bookmarks?folder=${folder.id}`)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-all hover:bg-accent rounded-lg rounded-tr-none rounded-br-none text-muted-foreground"
          >
            <Folder className="h-3 w-3" style={{ color: folder.color || undefined }} />
            {!isCollapsed && <span className="truncate">{folder.name}</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}
