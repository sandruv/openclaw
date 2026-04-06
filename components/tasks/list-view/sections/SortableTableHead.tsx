import React from 'react';
import { TableHead } from "@/components/ui/table";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useTasksStore } from "@/stores/useTasksStore";

// Define sortable columns
const SORTABLE_COLUMNS = ['id', 'status_id', 'priority_id', 'impact_id', 'created_at', 'updated_at'];

interface SortableTableHeadProps {
  field: string;
  className?: string;
  children: React.ReactNode;
  disableSort?: boolean;
}

export function SortableTableHead({ 
  field, 
  className = "text-gray-700 dark:text-gray-200", 
  children,
  disableSort = false 
}: SortableTableHeadProps) {
  const { sort, setSortField, resetSort } = useTasksStore();
  const isActive = sort.field === field;
  const isSortable = SORTABLE_COLUMNS.includes(field) && !disableSort;
  
  // Handle click on header to sort with three states: asc → desc → remove
  const handleSort = () => {
    if (!isSortable) return;
    
    if (!isActive) {
      // First click on a column: sort ascending
      setSortField(field, 'asc');
    } else if (sort.direction === 'asc') {
      // Second click: sort descending
      setSortField(field, 'desc');
    } else {
      // Third click: remove sorting
      resetSort();
    }
  };

  return (
    <TableHead 
      className={`${className} ${isSortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700' : ''} transition-colors relative`}
      onClick={handleSort}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        
        {isSortable && isActive && (
          <span className="inline-flex">
            {sort.direction === 'asc' ? (
              <ArrowUp className="h-4 w-4 text-blue-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-blue-500" />
            )}
          </span>
        )}
      </div>
    </TableHead>
  );
}
