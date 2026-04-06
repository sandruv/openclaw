"use client"

import { useEffect, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoader } from '@/contexts/LoaderContext';
import { useAuth } from '@/contexts/AuthContext';

export function useRouteLoader() {
  const { setIsLoading, isLoading } = useLoader();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const previousPathnameRef = useRef(pathname);
  const previousSearchParamsRef = useRef(searchParams);
  const previousAuthStateRef = useRef(isAuthenticated);

  const startLoading = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    setIsLoading(true);
  }, [setIsLoading]);

  const stopLoading = useCallback(() => {
    // Small delay to ensure smooth transition
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, [setIsLoading]);

  useEffect(() => {
    const isRouteChanged = previousPathnameRef.current !== pathname;
    const isSearchParamsChanged = previousSearchParamsRef.current !== searchParams;
    const isAuthStateChanged = previousAuthStateRef.current !== isAuthenticated;

    // Stop loading when route change completes (pathname or searchParams changed)
    // This works with NavLink which starts loading on click
    if (isRouteChanged || isSearchParamsChanged || isAuthStateChanged) {
      // If we were loading (from NavLink click), stop it now that navigation completed
      if (isLoading) {
        stopLoading();
      }
    }

    previousPathnameRef.current = pathname;
    previousSearchParamsRef.current = searchParams;
    previousAuthStateRef.current = isAuthenticated;

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [pathname, searchParams, isAuthenticated, isLoading, stopLoading]);

  return { startLoading, stopLoading };
}