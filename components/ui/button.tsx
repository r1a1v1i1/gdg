import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyanline disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-floodlight",
        glass: "border border-white/10 bg-white/[0.06] text-white shadow-stadium hover:border-cyanline/50 hover:bg-white/[0.10]",
        neon: "border border-neon/30 bg-neon/12 text-neon shadow-glow hover:bg-neon/20",
        danger: "border border-danger/35 bg-danger/12 text-danger hover:bg-danger/20",
        ghost: "text-white/70 hover:bg-white/[0.08] hover:text-white"
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-5",
        lg: "h-[52px] px-7 text-base",
        icon: "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";
