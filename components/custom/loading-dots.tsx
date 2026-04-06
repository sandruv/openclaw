"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DivideCircleIcon } from "lucide-react";

interface LoadingDotsProps {
  className?: string;
  color?: string;
}

export function LoadingDots({ className, color = "bg-black dark:bg-white" }: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1 ml-1", className)}>
      <div className={cn("opacity-0 animate-[loading_1.4s_ease-in-out_infinite] delay-200 w-[2px] h-[2px] rounded-full ", color)}></div>
      <div className={cn("opacity-0 animate-[loading_1.4s_ease-in-out_infinite] delay-300 w-[2px] h-[2px] rounded-full ", color)}></div>
      <div className={cn("opacity-0 animate-[loading_1.4s_ease-in-out_infinite] delay-500 w-[2px] h-[2px] rounded-full ", color)}></div>
    </div>
  );
}
