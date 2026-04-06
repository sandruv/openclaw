'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLoader } from '@/contexts/LoaderContext';
import { useViewAsRoleStore, SIMULATABLE_ROLES, canUseViewAsRole } from '@/stores/useViewAsRoleStore';
import { RoleNames, RoleType } from '@/lib/roleProvider/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Roles that should redirect to /dashboard when simulating
const DASHBOARD_ROLES = [RoleType.ClientUser, RoleType.InternalUser];

interface ViewAsRoleSelectorProps {
  compact?: boolean;
}

export function ViewAsRoleSelector({ compact = false }: ViewAsRoleSelectorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { setIsLoading } = useLoader();
  const { 
    simulatedRoleId, 
    isSimulating, 
    startSimulation, 
    stopSimulation 
  } = useViewAsRoleStore();

  const userRoleId = user?.role_id ? Number(user.role_id) : null;

  // Only show for Admin or SuperAdmin users
  if (!userRoleId || !canUseViewAsRole(userRoleId)) {
    return null;
  }

  const currentRoleName = userRoleId ? RoleNames[userRoleId as RoleType] : 'Unknown';
  const simulatedRoleName = simulatedRoleId ? RoleNames[simulatedRoleId as RoleType] : null;

  const handleRoleSelect = (roleId: number) => {
    setIsLoading(true);
    
    if (roleId === userRoleId) {
      // Selecting current role stops simulation
      stopSimulation();
      router.push('/tasks');
    } else {
      startSimulation(roleId, userRoleId);
      // Redirect to /dashboard for Client User and Internal User roles
      if (DASHBOARD_ROLES.includes(roleId as RoleType)) {
        router.push('/dashboard');
      } else {
        // For Agent role, no redirect - stop loader after brief delay
        setTimeout(() => setIsLoading(false), 500);
      }
    }
  };

  const handleStopSimulation = () => {
    setIsLoading(true);
    stopSimulation();
    router.push('/tasks');
  };

  const buttonContent = (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "relative transition-all duration-200",
        isSimulating && "border-amber-500 bg-amber-50 dark:bg-amber-950/20",
        compact ? "h-8 w-8 p-0" : "h-8 px-3"
      )}
    >
      <Eye className={cn("h-4 w-4", isSimulating && "text-amber-600")} />
      {!compact && (
        <span className={cn("ml-1.5", isSimulating && "text-amber-700 dark:text-amber-500")}>
          {isSimulating ? `As ${simulatedRoleName}` : 'View as...'}
        </span>
      )}
    </Button>
  );

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              {buttonContent}
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white p-1 px-2 rounded">
            <p className="text-sm">
              {isSimulating 
                ? `Viewing as ${simulatedRoleName} - Click to change`
                : 'Test UI as different role'
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View as Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Simulatable roles */}
        {SIMULATABLE_ROLES.map((role) => (
          <DropdownMenuItem
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              simulatedRoleId === role.id && "bg-amber-50 dark:bg-amber-950/20"
            )}
          >
            <span>{role.name}</span>
            {simulatedRoleId === role.id && (
              <Check className="h-4 w-4 text-amber-600" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Current role (Admin) - clicking returns to normal */}
        <DropdownMenuItem
          onClick={handleStopSimulation}
          className={cn(
            "flex items-center justify-between cursor-pointer",
            !isSimulating && "bg-primary/10"
          )}
        >
          <span>{currentRoleName} (Current)</span>
          {!isSimulating && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
