'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Eye, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewAsRoleStore } from '@/stores/useViewAsRoleStore';
import { useLoader } from '@/contexts/LoaderContext';
import { cn } from '@/lib/utils';

interface RoleSimulationBannerProps {
  className?: string;
}

export function RoleSimulationBanner({ className }: RoleSimulationBannerProps) {
  const router = useRouter();
  const { isSimulating, stopSimulation, getSimulatedRoleName } = useViewAsRoleStore();
  const { setIsLoading } = useLoader();
  
  const [positionX, setPositionX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const initialPosX = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    initialPosX.current = positionX;
  }, [positionX]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    initialPosX.current = positionX;
  }, [positionX]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !bannerRef.current) return;
      const deltaX = e.clientX - dragStartX.current;
      const bannerWidth = bannerRef.current.offsetWidth;
      const maxX = (window.innerWidth - bannerWidth) / 2;
      const newX = Math.max(-maxX, Math.min(maxX, initialPosX.current + deltaX));
      setPositionX(newX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !bannerRef.current) return;
      const deltaX = e.touches[0].clientX - dragStartX.current;
      const bannerWidth = bannerRef.current.offsetWidth;
      const maxX = (window.innerWidth - bannerWidth) / 2;
      const newX = Math.max(-maxX, Math.min(maxX, initialPosX.current + deltaX));
      setPositionX(newX);
    };

    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  if (!isSimulating) {
    return null;
  }

  const roleName = getSimulatedRoleName();

  const handleExit = () => {
    setIsLoading(true);
    stopSimulation();
    if (window.location.pathname != '/tasks') {
      router.push('/tasks');
    } else {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <div 
      ref={bannerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ transform: `translateX(calc(-50% + ${positionX}px))` }}
      className={cn(
        "fixed top-2 left-1/2 z-[100] select-none",
        "bg-amber-500 text-amber-950 rounded-full shadow-lg",
        "flex items-center gap-2 px-3 py-1.5",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
    >
      <GripVertical className="h-4 w-4 opacity-50" />
      <div className="flex items-center gap-2 text-white">
        <Eye className="h-4 w-4" />
        <span className="text-sm font-medium">Viewing as:</span>
        <span className="text-sm font-bold">{roleName}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleExit}
        className="h-6 px-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white hover:text-white gap-[1.5px]"
      >
        <X className="h-2 w-2" />
        <span className="text-xs">Exit</span>
      </Button>
    </div>
  );
}
