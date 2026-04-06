import { CLIENT_STATUS_COLORS, TECH_APTITUDE_COLORS, ROLE_BADGE_COLORS, ROLE_COLORS } from '@/constants/colors'
import { TECH_APTITUDE_ICON_MAP } from '@/constants/icons'
import { ReactElement, createElement } from 'react'

export function getClientStatusColor(statusKey: string, prefix: string = 'bg-'): string {
  const color = CLIENT_STATUS_COLORS[statusKey.toLowerCase() as keyof typeof CLIENT_STATUS_COLORS];
  return color.replace('bg-', prefix);
}

/**
 * Returns the appropriate icon and color for a tech aptitude level
 * @param level The tech aptitude level as a string
 * @returns Object containing the icon component and color class
 */
export function getTechAptitudeIcon(level: string): { icon: ReactElement, color: string } {
  // Get the icon component from the constants
  const IconComponent = TECH_APTITUDE_ICON_MAP[level as keyof typeof TECH_APTITUDE_ICON_MAP] || 
                       TECH_APTITUDE_ICON_MAP['default'];
  // Get the color from the constants
  const color = TECH_APTITUDE_COLORS[level as keyof typeof TECH_APTITUDE_COLORS] || 
               TECH_APTITUDE_COLORS['default'];
  
  // Create the icon element with the appropriate styling
  const icon = createElement(IconComponent, { className: "h-4 w-4 text-white" });
  
  // Return the icon and color
  return {
    icon,
    color
  };
}

/**
 * Returns the appropriate background and text colors for a role badge
 * @param role The user role as a string
 * @returns Object containing background and text color classes
 */
export function getRoleBadgeColor(role: string): { bg: string, text: string } {
  return ROLE_BADGE_COLORS[role as keyof typeof ROLE_BADGE_COLORS] || ROLE_BADGE_COLORS['default'];
}

/**
 * Returns the appropriate background and text colors for a role with defined color scheme
 * Agent (id=1) = violet, Client User (id=2) = blue, Admin (id=3) = amber
 * @param role The user role name as a string
 * @returns Object containing background and text color classes
 */
export function getRoleColor(role: string): { bg: string, text: string } {
  return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || ROLE_COLORS['default'];
}