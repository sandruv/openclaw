import React from 'react';
import { Metadata } from 'next';
import { RolesPermissionsPage } from '@/components/admin/pages/roles-permissions';

export const metadata: Metadata = {
  title: 'Roles & Permissions | YW Portal',
  description: 'Manage user roles and permissions',
};

export default function Page() {
  return <RolesPermissionsPage />;
}
