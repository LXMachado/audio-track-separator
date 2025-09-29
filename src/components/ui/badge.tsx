import * as React from "react"

import { cn } from "../../lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-blue-500 text-white",
    secondary: "bg-gray-500 text-white",
    destructive: "bg-red-500 text-white",
    outline: "border border-gray-300 text-gray-700"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }