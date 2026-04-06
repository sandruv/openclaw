'use client'

import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, Users, MessageCircle, Phone, CheckCircle2, GitMerge } from 'lucide-react'
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { TaskAction } from '@/types/tasks'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type FormType = 'email' | 'privateNote' | 'reassign' | 'resolve' | 'merge' | null

interface ButtonsFormsProps {
  onFormChange: (form: FormType) => void
  activeForm: FormType
  compact?: boolean
}

export function ButtonsForms({ onFormChange, activeForm, compact }: ButtonsFormsProps) {
  const { compactMode } = useSettingsStore()
  
  // Use the prop if provided, otherwise use the value from the store
  const isCompact = compact !== undefined ? compact : compactMode
  const { setCurrentAction, isNavigating } = useTaskDetailsStore()

  const handleFormChange = (form: FormType) => {
    onFormChange(form)
    if(form === 'reassign' || form === 'merge') return
    
    switch(form) {
      case 'email':
        setCurrentAction(TaskAction.Emailing)
        break
      case 'privateNote':
        setCurrentAction(TaskAction.Noting)
        break
      case 'resolve':
        setCurrentAction(TaskAction.Resolving)
        break
      default:
        setCurrentAction(TaskAction.Viewing)
    }
  }

  const getButtonClass = (form: FormType) => {
    return activeForm === form ? "bg-emerald-500 border-emerald-500 text-white" : ""
  }

  return (
    <div className="flex flex-wrap gap-2">
      {isCompact ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isNavigating}
                onClick={() => handleFormChange('merge')}
                className={getButtonClass('merge')}
                data-testid="merge-button"
              >
                <GitMerge className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Merge Tasks</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isNavigating}
          onClick={() => handleFormChange('merge')}
          className={getButtonClass('merge')}
          data-testid="merge-button"
        >
          <GitMerge className="w-4 h-4 mr-1" />
          Merge
        </Button>
      )}

      {isCompact ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                disabled={isNavigating}
                onClick={() => handleFormChange('email')}
                className={getButtonClass('email')}
                data-testid="email-button"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Email</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          type="button" 
          disabled={isNavigating}
          onClick={() => handleFormChange('email')}
          className={getButtonClass('email')}
        >
          <Mail className="w-4 h-4 mr-1" />
          Email
        </Button>
      )}

      {isCompact ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isNavigating}
                onClick={() => handleFormChange('privateNote')}
                className={getButtonClass('privateNote')}
                data-testid="private-note-button"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Private Note</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isNavigating}
          onClick={() => handleFormChange('privateNote')}
          className={getButtonClass('privateNote')}
          data-testid="private-note-button"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          Private Note
        </Button>
      )}

      {isCompact ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isNavigating}
                onClick={() => handleFormChange('reassign')}
                className={getButtonClass('reassign')}
                data-testid="reassign-button"
              >
                <Users className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Re-Assign</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isNavigating}
          onClick={() => handleFormChange('reassign')}
          className={getButtonClass('reassign')}
          data-testid="reassign-button"
        >
          <Users className="w-4 h-4 mr-1" />
          Re-Assign
        </Button>
      )}
      
      {isCompact ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isNavigating}
                onClick={() => handleFormChange('resolve')}
                className={getButtonClass('resolve')}
                data-testid="resolve-button"
              >
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resolve Task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isNavigating}
          onClick={() => handleFormChange('resolve')}
          className={getButtonClass('resolve')}
          data-testid="resolve-button"
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Resolve
        </Button>
      )}
      
    </div>
  )
}
