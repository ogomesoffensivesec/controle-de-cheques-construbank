import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { size?: 'sm' | 'md' | 'lg' }>(
  ({ className, type, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-7 w-full px-2 py-0 text-sm',
      md: 'h-9 w-full px-3 py-1 text-base',
      lg: 'h-11 w-full px-4 py-2 text-lg',
    };

    return (
      <input
        type={type}
        className={cn(
          sizes[size as keyof typeof sizes],
          "rounded-md border border-input bg-transparent shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
