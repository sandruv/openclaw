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
import { useBookmarkStore } from '@/stores/useBookmarkStore'
import { useToast } from '@/components/ui/toast-provider'
import { PRESET_THEME_COLORS } from '@/constants/colors'

interface AddFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFolderDialog({ open, onOpenChange }: AddFolderDialogProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_THEME_COLORS[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { addFolder } = useBookmarkStore()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      showToast({
        title: 'Error',
        description: 'Folder name is required',
        type: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await addFolder({
        name: name.trim(),
        icon: icon.trim() || undefined,
        color: selectedColor,
        order: 0,
      })
      
      showToast({
        title: 'Success',
        description: 'Folder created successfully',
        type: 'success',
      })
      
      setName('')
      setIcon('')
      setSelectedColor(PRESET_THEME_COLORS[0].value)
      onOpenChange(false)
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to create folder',
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
          <DialogTitle>Add New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your bookmarks
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                placeholder="e.g., Work Resources"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                placeholder="e.g., 📁"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Folder Color</Label>
              <div className="flex gap-2">
                {PRESET_THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
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
              {isSubmitting ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
