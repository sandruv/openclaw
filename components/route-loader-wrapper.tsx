"use client"

import { ReactNode, Suspense } from 'react';
import { useRouteLoader } from '@/hooks/useRouteLoader';

interface RouteLoaderWrapperProps {
  children: ReactNode;
}

function RouteLoaderInner({ children }: RouteLoaderWrapperProps) {
  useRouteLoader();
  return <>{children}</>;
}

export function RouteLoaderWrapper({ children }: RouteLoaderWrapperProps) {
  return (
    <Suspense>
      <RouteLoaderInner>{children}</RouteLoaderInner>
    </Suspense>
  );
}