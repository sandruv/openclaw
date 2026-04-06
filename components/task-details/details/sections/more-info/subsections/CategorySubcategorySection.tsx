'use client'

import { Task } from "@/types/tasks"
import { SkeletonText } from "@/components/ui/skeleton-inline"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"

interface CategorySubcategorySectionProps {
  task: Task
  editMode: boolean
  isNavigating: boolean
  isSubmitting: boolean
  categories: ComboboxOption[]
  availableSubcategories: ComboboxOption[]
  selectedCategoryId: string | null
  selectedSubcategoryId: string | null
  validationErrors: { category?: string; subcategory?: string }
  handleCategoryChange: (value: string) => void
  setSelectedSubcategoryId: (value: string) => void
  setValidationErrors: React.Dispatch<React.SetStateAction<{
    category?: string;
    subcategory?: string;
  }>>
}

export function CategorySubcategorySection({
  task,
  editMode,
  isNavigating,
  isSubmitting,
  categories,
  availableSubcategories,
  selectedCategoryId,
  selectedSubcategoryId,
  validationErrors,
  handleCategoryChange,
  setSelectedSubcategoryId,
  setValidationErrors
}: CategorySubcategorySectionProps) {
  return (
    <>
      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Category</div>
        {editMode ? (
          <>
            <Combobox
              options={categories}
              placeholder="Category"
              onValueChange={handleCategoryChange}
              value={selectedCategoryId || ''}
              disabled={isSubmitting}
              className='text-xs font-normal'
            />
            {validationErrors.category && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
            )}
          </>
        ) : (
          <SkeletonText isLoading={isNavigating} className="w-32 h-4">
            <p className="text-sm font-semibold">{task.category?.name || 'Not set'}</p>
          </SkeletonText>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Subcategory</div>
        {editMode ? (
          <>
            <Combobox
              options={availableSubcategories}
              placeholder="Subcategory"
              onValueChange={(value) => {
                setSelectedSubcategoryId(value);
                // Clear the subcategory error when a selection is made
                if (validationErrors.subcategory) {
                  setValidationErrors(prev => ({ ...prev, subcategory: undefined }));
                }
              }}
              value={selectedSubcategoryId || ''}
              disabled={!selectedCategoryId || isSubmitting}
              className='text-xs font-normal'
            />
            {validationErrors.subcategory && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.subcategory}</p>
            )}
          </>
        ) : (
          <SkeletonText isLoading={isNavigating} className="w-32 h-4">
            <p className="text-sm font-semibold">{task.subcategory?.name || 'Not set'}</p>
          </SkeletonText>
        )}
      </div>
    </>
  )
}
