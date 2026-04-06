'use client';

import { usePathname } from 'next/navigation';
import { NavLink } from '@/components/ui/nav-link';
import { cn } from '@/lib/utils';
import { Settings, FileText, Radio, Shield, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionStore } from '@/stores/useSessionStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminTabs = [
  {
    name: 'System Initialization',
    href: '/admin',
    icon: Settings,
    superAdminOnly: true,
  },
  {
    name: 'Patch Updates',
    href: '/admin/patch',
    icon: FileText,
    superAdminOnly: false,
  },
  {
    name: 'Realtime Status',
    href: '/admin/realtime-status',
    icon: Radio,
    superAdminOnly: true,
  },
  {
    name: 'Roles & Permissions',
    href: '/admin/roles-permissions',
    icon: Shield,
    superAdminOnly: false,
  },
  {
    name: 'AI Usage',
    href: '/admin/ai-usage',
    icon: BarChart2,
    superAdminOnly: false,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isSuperAdmin } = useSessionStore();
  
  // Filter tabs based on user role
  const visibleTabs = adminTabs.filter(tab => !tab.superAdminOnly || isSuperAdmin());

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-100 dark:bg-[#1e1e1e] overflow-hidden">
      {/* Top Navigation Bar - IDE style */}
      <div className="flex-shrink-0 h-10 bg-white dark:bg-[#252526] border-b border-gray-200 dark:border-[#3c3c3c] flex items-center px-2">
        <nav className="flex h-full" aria-label="Admin Navigation">
          {visibleTabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            
            return (
              <NavLink
                key={tab.name}
                href={tab.href}
                className={cn(
                  'inline-flex items-center h-full px-4 text-sm font-medium border-r border-gray-200 dark:border-[#3c3c3c] transition-colors',
                  isActive
                    ? 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-900 dark:text-white border-t-2 border-t-blue-500 dark:border-t-[#007acc]'
                    : 'text-gray-500 dark:text-[#969696] hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#2a2d2e]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('mr-2 h-4 w-4', isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-[#969696]')} />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content - fills remaining height */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

// Re-export SystemInitializationPage for backward compatibility
export { SystemInitializationPage } from './pages/system-initialization';
