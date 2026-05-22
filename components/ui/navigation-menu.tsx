"use client";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cn } from "@/lib/utils";

export const NavigationMenu = NavigationMenuPrimitive.Root;
export const NavigationMenuList = ({ className, ...props }: NavigationMenuPrimitive.NavigationMenuListProps) => (
  <NavigationMenuPrimitive.List className={cn("flex items-center gap-2", className)} {...props} />
);
export const NavigationMenuItem = NavigationMenuPrimitive.Item;
export const NavigationMenuLink = ({ className, ...props }: NavigationMenuPrimitive.NavigationMenuLinkProps) => (
  <NavigationMenuPrimitive.Link className={cn("rounded-full px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white", className)} {...props} />
);
