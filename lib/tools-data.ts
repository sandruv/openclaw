import { FileText } from 'lucide-react';
import React from 'react';

export interface ToolItem {
  icon: React.ReactNode | string;
  label: string;
  action: string;
  color: string;
  isImage?: boolean;
}

// Microsoft Office tools
export const microsoftTools: ToolItem[] = [
  {
    icon: '/microsoft/excel.svg',
    label: 'Excel',
    action: 'https://office.com/launch/excel',
    color: 'bg-green-100 dark:bg-green-900/30',
    isImage: true
  },
  {
    icon: '/microsoft/word.svg',
    label: 'Word',
    action: 'https://office.com/launch/word',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    isImage: true
  },
  {
    icon: '/microsoft/powerpoint.svg',
    label: 'PowerPoint',
    action: 'https://office.com/launch/powerpoint',
    color: 'bg-orange-100 dark:bg-orange-900/30',
    isImage: true
  },
  {
    icon: '/microsoft/outlook.svg',
    label: 'Outlook',
    action: 'https://outlook.office.com',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    isImage: true
  },
  {
    icon: '/microsoft/teams.svg',
    label: 'Teams',
    action: 'https://teams.microsoft.com',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    isImage: true
  },
  {
    icon: '/microsoft/onenote.svg',
    label: 'OneNote',
    action: 'https://onenote.com',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    isImage: true
  },
];

// Company tools
export const companyTools: ToolItem[] = [
  {
    icon: '/company/docusign.svg',
    label: 'DocuSign',
    action: 'https://docusign.com',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    isImage: true
  },
  {
    icon: '/company/skyslope.svg',
    label: 'SkySlope',
    action: 'https://skyslope.com',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    isImage: true
  },
  {
    icon: '/company/cps.svg',
    label: 'CPS',
    action: 'https://cps.com', // Replace with actual CPS URL
    color: 'bg-green-100 dark:bg-green-900/30',
    isImage: true
  }
];

// Get tool URL by name
export const getToolUrl = (tool: string): string => {
  // Search in Microsoft tools
  const msToolMatch = microsoftTools.find(t => t.label === tool);
  if (msToolMatch) return msToolMatch.action;
  
  // Search in Company tools
  const companyToolMatch = companyTools.find(t => t.label === tool);
  if (companyToolMatch) return companyToolMatch.action;
  
  // Default fallback
  return '#';
};
