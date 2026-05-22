"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = ({ className, sideOffset = 8, ...props }: TooltipPrimitive.TooltipContentProps) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      sideOffset={sideOffset}
      className={cn("z-50 rounded-lg border border-white/10 bg-black/85 px-3 py-2 text-xs text-white shadow-blueglow backdrop-blur-xl", className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
);
