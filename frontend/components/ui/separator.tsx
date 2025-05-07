// Example from a typical ShadCN separator.tsx
"use client" // Usually client components

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils" // Assumes utils.ts exists in lib

const Separator = React.forwardRef< /* ...types... */ >(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn( /* ...classes... */ )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator } // <--- NAMED EXPORT