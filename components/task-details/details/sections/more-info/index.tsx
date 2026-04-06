'use client'

import { useState, useEffect } from 'react'
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { useDropdownStore } from "@/stores/useDropdownStore"
import { useToast } from "@/hooks/useToast"
import { dropdownService } from "@/services/dropdownService"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ComboboxOption } from "@/components/ui/combobox"
import { getInitials, getAvatarColor } from "@/lib/utils"

// Import subcomponents
import { EditButtons } from './subsections/EditButtons'
import { DateInfoSection } from './subsections/DateInfoSection'
import { TypeStatusSection } from './subsections/TypeStatusSection'
import { PriorityImpactSection } from './subsections/PriorityImpactSection'
import { AgentSection } from './subsections/AgentSection'
import { CreatedBySection } from './subsections/CreatedBySection'
import { CategorySubcategorySection } from './subsections/CategorySubcategorySection'
import { ChildTicketsSection } from './subsections/ChildTicketsSection'
import { ParentTicketSection } from './subsections/ParentTicketSection'
import { TicketSourceSection } from './subsections/TicketSource'
import { TimeRequestSection } from './subsections/TimeRequestSection'

export function MoreInfo() {
  const { task, updateTask, isNavigating } = useTaskDetailsStore()
  const [editMode, setEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<string>("")
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>("")
  const [selectedImpactId, setSelectedImpactId] = useState<string>("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null)
  const [availableSubcategories, setAvailableSubcategories] = useState<ComboboxOption[]>([])
  const [validationErrors, setValidationErrors] = useState<{category?: string, subcategory?: string}>({})
  const [selectedTimeOfRequest, setSelectedTimeOfRequest] = useState<Date | null>(null)
  const [selectedAfterHours, setSelectedAfterHours] = useState<boolean>(false)
  const { ticketTypes, priorities, impacts, categories, fetchTicketTypes, fetchPriorities, fetchImpacts, fetchCategories } = useDropdownStore()
  const { showToast } = useToast()

  // Initialize dropdowns data
  useEffect(() => {
    const loadDropdowns = async () => {
      await Promise.all([
        fetchTicketTypes(),
        fetchPriorities(),
        fetchImpacts(),
        fetchCategories()
      ])
    }
    
    loadDropdowns()
    // We want to load these only once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize selected values when task loads or changes
  useEffect(() => {
    if (task) {
      setSelectedTypeId(task.ticket_type?.id?.toString() || '')
      setSelectedPriorityId(task.priority?.id?.toString() || '')
      setSelectedImpactId(task.impact?.id?.toString() || '')
      if (task.category) {
        setSelectedCategoryId(task.category.id.toString())
      }
      if (task.subcategory) {
        setSelectedSubcategoryId(task.subcategory.id.toString())
      }
      // Initialize time of request and after hours
      setSelectedTimeOfRequest(task.time_of_request ? new Date(task.time_of_request) : null)
      setSelectedAfterHours(task.after_hours ?? false)
    }
  }, [task])

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const fetchSubcategories = async () => {
        const response = await dropdownService.getSubcategories(Number(selectedCategoryId));
        const transformedSubcategories = response.data.map(subcategory => ({
          value: subcategory.id+"",
          label: subcategory.name || ''
        }))
        
        setAvailableSubcategories(transformedSubcategories);
      };
      fetchSubcategories();
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategoryId])

  const validateForm = (): boolean => {
    const errors: {category?: string, subcategory?: string} = {}
    
    if (!selectedCategoryId) {
      errors.category = "Category is required"
    }
    
    if (selectedCategoryId && !selectedSubcategoryId) {
      errors.subcategory = "Subcategory is required"
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!task) return
    
    // Validate form before submission
    if (!validateForm()) {
      showToast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        type: "error"
      })
      return
    }
    
    setIsSubmitting(true)
    try {
      await updateTask({
        id: task.id,
        ticket_type_id: parseInt(selectedTypeId),
        priority_id: parseInt(selectedPriorityId),
        impact_id: parseInt(selectedImpactId),
        category_id: selectedCategoryId ? parseInt(selectedCategoryId) : undefined,
        subcategory_id: selectedSubcategoryId ? parseInt(selectedSubcategoryId) : undefined,
        time_of_request: selectedTimeOfRequest?.toISOString() || null,
        after_hours: selectedAfterHours
      })
      
      showToast({
        title: "Success",
        description: "Task details updated successfully",
        type: "success"
      })
      
      setEditMode(false)
      setValidationErrors({}) // Clear validation errors
    } catch (error) {
      console.error("Failed to update task:", error)
      showToast({
        title: "Error",
        description: "Failed to update task details",
        type: "error"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (task) {
      setSelectedTypeId(task.ticket_type?.id?.toString() || '')
      setSelectedPriorityId(task.priority?.id?.toString() || '')
      setSelectedImpactId(task.impact?.id?.toString() || '')
      if (task.category) {
        setSelectedCategoryId(task.category.id.toString())
      }
      if (task.subcategory) {
        setSelectedSubcategoryId(task.subcategory.id.toString())
      }
      // Reset time of request and after hours
      setSelectedTimeOfRequest(task.time_of_request ? new Date(task.time_of_request) : null)
      setSelectedAfterHours(task.after_hours ?? false)
    }
    setEditMode(false)
    setValidationErrors({}) // Clear validation errors on cancel
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value)
    setSelectedSubcategoryId(null)
    
    // Clear category validation error when a selection is made
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: undefined }))
    }
  }

  if (!task) {
    return null
  }

  // Handle nullable agent data
  const assignee = task.agent 
    ? `${task.agent.first_name || ''} ${task.agent.last_name || ''}`.trim() || 'Unassigned'
    : 'Unassigned'
  const initials = getInitials(assignee)
  // Get a consistent color for the assigned agent based on their user ID
  const agentAvatarColor = task.agent?.id ? getAvatarColor(task.agent.id) : getAvatarColor(0)

  return (
    <div className="">
      <div className="flex items-center justify-between mb-1 px-4">
        <h2 className="text-base font-medium my-3">More Information</h2>
        <EditButtons
          editMode={editMode}
          isNavigating={isNavigating}
          isSubmitting={isSubmitting}
          onEdit={() => setEditMode(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-465px)] border-b pb-0 px-4">
        <div className="space-y-4">
          <DateInfoSection task={task} isNavigating={isNavigating} />
          
          <TimeRequestSection
            task={task}
            editMode={editMode}
            isNavigating={isNavigating}
            isSubmitting={isSubmitting}
            selectedTimeOfRequest={selectedTimeOfRequest}
            selectedAfterHours={selectedAfterHours}
            setSelectedTimeOfRequest={setSelectedTimeOfRequest}
            setSelectedAfterHours={setSelectedAfterHours}
          />
          
          <ParentTicketSection task={task} isNavigating={isNavigating} />
          
          <ChildTicketsSection task={task} isNavigating={isNavigating} editMode={editMode} />
          
          <TypeStatusSection
            task={task}
            editMode={editMode}
            isNavigating={isNavigating}
            isSubmitting={isSubmitting}
            ticketTypes={ticketTypes}
            selectedTypeId={selectedTypeId}
            setSelectedTypeId={setSelectedTypeId}
          />
          
          <PriorityImpactSection
            task={task}
            editMode={editMode}
            isNavigating={isNavigating}
            isSubmitting={isSubmitting}
            priorities={priorities}
            impacts={impacts}                                       
            selectedPriorityId={selectedPriorityId}
            selectedImpactId={selectedImpactId}
            setSelectedPriorityId={setSelectedPriorityId}
            setSelectedImpactId={setSelectedImpactId}
          />
          
          <AgentSection
            task={task}
            isNavigating={isNavigating}
          />

          <CreatedBySection
            task={task}
            isNavigating={isNavigating}
          />

          <TicketSourceSection
            task={task}
            isNavigating={isNavigating}
          />
          
          <CategorySubcategorySection
            task={task}
            editMode={editMode}
            isNavigating={isNavigating}
            isSubmitting={isSubmitting}
            categories={categories}
            availableSubcategories={availableSubcategories}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            validationErrors={validationErrors}
            handleCategoryChange={handleCategoryChange}
            setSelectedSubcategoryId={setSelectedSubcategoryId}
            setValidationErrors={setValidationErrors}
          />
        </div>  
      </ScrollArea>
    </div>
  )
}