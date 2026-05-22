"use client";

import type React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

export const Command = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive className={cn("overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] text-white", className)} {...props} />
);

export const CommandInput = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) => (
  <CommandPrimitive.Input className={cn("w-full border-b border-white/10 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/35", className)} {...props} />
);

export const CommandList = CommandPrimitive.List;
export const CommandEmpty = CommandPrimitive.Empty;
export const CommandGroup = CommandPrimitive.Group;
export const CommandItem = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item className={cn("cursor-pointer px-4 py-3 text-sm text-white/70 data-[selected=true]:bg-white/10 data-[selected=true]:text-white", className)} {...props} />
);
