'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pen, Check } from 'lucide-react'
import { CompanyTools } from './sections/CompanyTools'
import { PersonalTools } from './sections/PersonalTools'
import { DefaultTools } from './sections/DefaultTools'
import { useToolsStore } from '@/stores/useToolsStore'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export const ToolsSection = () => {
  const { user } = useAuth()
  const { fetchCompanyTools, fetchPersonalTools, isLoading } = useToolsStore()
  const [editMode, setEditMode] = useState(false)
  
  // Collapsible state for each section
  const [defaultToolsCollapsed, setDefaultToolsCollapsed] = useState(true)
  const [companyToolsCollapsed, setCompanyToolsCollapsed] = useState(false)
  const [personalToolsCollapsed, setPersonalToolsCollapsed] = useState(false)
  
  useEffect(() => {
    if (user) {
      // Fetch tools based on user's client_id and user_id
      if (user.client_id) {
        fetchCompanyTools(user.client_id)
      }
      
      fetchPersonalTools(user.id)
    }
  }, [user, fetchCompanyTools, fetchPersonalTools])

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-medium">Tools & Applications</CardTitle>
            <CardDescription className="text-xs">Quick access to company and personal tools</CardDescription>
          </div>
          <Button 
            variant="default" 
            className={cn(editMode ? `bg-green-100 text-green-600 dark:bg-green-200 dark:text-green-400 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-200 dark:hover:text-green-400` : `bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400`, `text-xs`)} 
            title={editMode ? 'Done Editing' : 'Edit Tools'}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 
            (<div className="flex items-center gap-2">
              <Check className="h-3 w-3" />
              <span>Done Editing</span>
            </div>) : 
            (<div className="flex items-center gap-2">
              <Pen className="h-3 w-3" />
              <span>Edit Tools</span>
            </div>)}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Microsoft Tools Section */}
        <DefaultTools 
          isCollapsed={defaultToolsCollapsed} 
          onToggleCollapse={() => setDefaultToolsCollapsed(!defaultToolsCollapsed)} 
        />
        
        {/* Company Tools Section */}
        <CompanyTools 
          isLoading={isLoading} 
          editMode={editMode} 
          isCollapsed={companyToolsCollapsed}
          onToggleCollapse={() => setCompanyToolsCollapsed(!companyToolsCollapsed)}
        />
        
        {/* Personal Tools Section */}
        <PersonalTools 
          isLoading={isLoading} 
          editMode={editMode}
          isCollapsed={personalToolsCollapsed}
          onToggleCollapse={() => setPersonalToolsCollapsed(!personalToolsCollapsed)}
        />
      </CardContent>
    </Card>
  )
}

export default ToolsSection