import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"

import { cn } from "@/lib/utils"

interface ToggleProps extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

const Toggle = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, ToggleProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-transparent",
      outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
    }

    const sizeClasses = {
      default: "h-10 px-3",
      sm: "h-9 px-2.5",
      lg: "h-11 px-5",
    }

    return (
      <TogglePrimitive.Root
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle }
