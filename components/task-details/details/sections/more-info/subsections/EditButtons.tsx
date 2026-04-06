'use client'

import { Button } from "@/components/ui/button"
import { Pencil, Save, Loader2, X } from 'lucide-react'

interface EditButtonsProps {
  editMode: boolean
  isNavigating: boolean
  isSubmitting: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function EditButtons({ 
  editMode, 
  isNavigating,
  isSubmitting, 
  onEdit, 
  onSave, 
  onCancel 
}: EditButtonsProps) {
  if (!editMode) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled={isNavigating}
        onClick={onEdit}
        className="h-8 w-8 p-0"
      >
        <Pencil className="h-4 w-4 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onCancel}
        disabled={isSubmitting}
        className="h-8 px-2 py-0 text-xs"
      >
        <X className="h-3 w-3" />
      </Button>
      <Button 
        variant="default" 
        size="sm" 
        onClick={onSave}
        disabled={isSubmitting}
        className="h-8 px-2 py-0 text-xs bg-blue-500 hover:bg-blue-600"
      >
        {isSubmitting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Save className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}
