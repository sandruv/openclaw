"use client"

import Image from "next/image"
import { useLoader } from "@/contexts/LoaderContext"
import { LoadingDots } from "@/components/custom/loading-dots"

interface RouteLoaderDialogProps {
  content?: string;
}

export function RouteLoaderDialog({ content = "Loading" }: RouteLoaderDialogProps) {
  const { isLoading } = useLoader();
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="bg-white dark:bg-gray-800 rounded-lg py-2 px-4 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 border-1 border-black dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="relative w-[45px] h-[45px] flex items-center justify-center">
            {/* Custom spinner ring - border-based for perfect center rotation */}
            <div className="absolute w-[38px] h-[38px] rounded-full border-[3px] border-lime-500/0 border-t-lime-500 animate-spin" />
            <Image
              src="/yw-logo_only.png"
              alt="YW Logo"
              width={27}
              height={27}
            />
          </div>
          <div className="flex items-center justify-center w-[80px]">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{content}</p>
            <LoadingDots className="mt-2" />
          </div>
        </div>
      </div>
    </div>
  )
}