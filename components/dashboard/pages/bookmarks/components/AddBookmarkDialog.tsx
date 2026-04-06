'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBookmarkStore } from '@/stores/useBookmarkStore'
import { useToast } from '@/components/ui/toast-provider'
import { Checkbox } from '@/components/ui/checkbox'

interface AddBookmarkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBookmarkDialog({ open, onOpenChange }: AddBookmarkDialogProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('')
  const [folderId, setFolderId] = useState<string>('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { folders, addBookmark } = useBookmarkStore()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !url.trim()) {
      showToast({
        title: 'Error',
        description: 'Name and URL are required',
        type: 'error',
      })
      return
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showToast({
        title: 'Error',
        description: 'URL must start with http:// or https://',
        type: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await addBookmark({
        name: name.trim(),
        url: url.trim(),
        icon: icon.trim() || undefined,
        folder_id: folderId ? parseInt(folderId) : undefined,
        is_favorite: isFavorite,
        order: 0,
      })
      
      showToast({
        title: 'Success',
        description: 'Bookmark added successfully',
        type: 'success',
      })
      
      setName('')
      setUrl('')
      setIcon('')
      setFolderId('')
      setIsFavorite(false)
      onOpenChange(false)
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to add bookmark',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Quick Link</DialogTitle>
          <DialogDescription>
            Add a new bookmark for quick access
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bookmark-name">Name</Label>
              <Input
                id="bookmark-name"
                placeholder="e.g., Google Drive"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bookmark-url">URL</Label>
              <Input
                id="bookmark-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bookmark-icon">Icon (optional)</Label>
              <Input
                id="bookmark-icon"
                placeholder="e.g., 🔗"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="folder">Folder (optional)</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger id="folder">
                  <SelectValue placeholder="No folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.icon && <span className="mr-2">{folder.icon}</span>}
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="favorite"
                checked={isFavorite}
                onCheckedChange={(checked) => setIsFavorite(checked as boolean)}
              />
              <Label
                htmlFor="favorite"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Add to favorites
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
