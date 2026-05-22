"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List
    className={cn("inline-flex rounded-2xl border border-white/10 bg-white/[0.06] p-1 backdrop-blur-xl", className)}
    {...props}
  />
);

export const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn(
      "rounded-xl px-4 py-2 text-sm font-semibold text-white/55 transition data-[state=active]:bg-white data-[state=active]:text-black",
      className
    )}
    {...props}
  />
);

export const TabsContent = TabsPrimitive.Content;
