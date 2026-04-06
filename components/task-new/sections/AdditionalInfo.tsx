'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { useNewTaskStore } from "@/stores/useNewTaskStore"
import { useDropdownStore } from "@/stores/useDropdownStore"
import { dropdownService } from "@/services/dropdownService"
import { AdditionalInfoLoader } from "../loaders/AdditionalInfoLoader"
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"
import { FileDropbox } from "@/components/custom/FileDropbox"
import { ValidationErrors } from "@/types/newTask"

interface AdditionalInfoProps {
  handleAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void
  errors: ValidationErrors
}

export function AdditionalInfo({ handleAttachment, errors }: AdditionalInfoProps) {
  const { newTask, setNewTask } = useNewTaskStore()
  const { ticketSources, isLoading, categories, subcategories, requestSubcategories, fetchRequestSubcategories } = useDropdownStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [availableSubcategories, setAvailableSubcategories] = useState<ComboboxOption[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  useEffect(() => {
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        const response = await dropdownService.getSubcategories(Number(selectedCategory));
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
  }, [selectedCategory])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    
    fetchRequestSubcategories(Number(value))

    setNewTask({
      additional: {
        ...newTask.additional,
        category: { value, label: categories.find(c => c.value === value)?.label || '' },
        subcategory: null
      }
    })
  }

  const handleSubcategoryChange = (value: string) => {
    setNewTask({
      additional: {
        ...newTask.additional,
        subcategory: { value, label: value }
      }
    })
  }

  const handleTicketSourceChange = (value: string) => {
    const selectedSource = ticketSources.find(source => source.value === value)
    setNewTask({
      additional: {
        ...newTask.additional,
        ticket_source: selectedSource ? { value: selectedSource.value, label: selectedSource.label } : null
      }
    })
  }

  const handleRequestCategoryChange = (value: string) => {
    setNewTask({
      additional: {
        ...newTask.additional,
        request_category: selectedCategory ? { value, label: value } : null
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files.map(file => file.name))
    setNewTask({
      additional: {
        ...newTask.additional,
        attachments: files
      }
    })
  }

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove))
    setNewTask({
      additional: {
        ...newTask.additional,
        attachments: newTask.additional.attachments.filter((_, index) => index !== indexToRemove)
      }
    })
  }

  return (
    <>
      {isLoading ? (
        <AdditionalInfoLoader />
      ) : (
        <div className="space-y-4 pt-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Combobox
                options={categories}
                placeholder="Category"
                onValueChange={handleCategoryChange}
                value={newTask.additional.category?.value || ''}
                disabled={false}
                data-testid="category-select"
              />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}

              <div className={cn(
                "grid grid-cols-2 gap-4", 
                newTask.task.type?.value == "2"? "grid-cols-2": "grid-cols-1"
              )}>
                <div>
                  <Combobox
                    options={availableSubcategories}
                    placeholder="Subcategory"
                    onValueChange={handleSubcategoryChange}
                    value={newTask.additional.subcategory?.value || ''}
                    disabled={!selectedCategory}
                    data-testid="subcategory-select"
                  />
                  {errors.subcategory && <p className="text-red-500 text-xs mt-1">{errors.subcategory}</p>}
                </div>

                {newTask.task.type?.value == "2" && (
                  <div className="">
                    <Combobox
                      options={requestSubcategories}
                      placeholder="Request category"
                      onValueChange={handleRequestCategoryChange}
                      value={newTask.additional.request_category?.value || ''}
                      disabled={!selectedCategory}
                    />
                    {errors.request_category && <p className="text-red-500 text-xs mt-1">{errors.request_category}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Ticket Source</Label>
                <div className="flex flex-wrap gap-2">
                  {ticketSources.map((source) => (
                    <Button
                      type="button"
                      key={source.value}
                      onClick={() => handleTicketSourceChange(source.value)}
                      className={cn(
                        "h-8 px-4 text-sm hover:bg-gray-200 dark:hover:bg-gray-900/50 text-white",
                        newTask.additional.ticket_source?.value === source.value 
                          ? 'bg-emerald-600 text-white'
                          : newTask.additional.ticket_source 
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-400' 
                            : 'bg-white text-black-300 dark:text-black dark:bg-gray-800 dark:text-gray-400'
                      )}
                      data-testid={`ticket-source-${(source.label || '').toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {source.label}
                    </Button>
                  ))}
                </div>
                {errors.ticket_source && <p className="text-red-500 text-xs mt-1">{errors.ticket_source}</p>}
              </div>
            </div>

            <FileDropbox
              selectedFiles={selectedFiles}
              onFileChange={handleFileChange}
              onFileRemove={removeFile}
            />
          </div>

        </div>
      )}
    </>
  )
}