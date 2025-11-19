import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
    "h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base outline-none transition-colors duration-200",
    "border border-gray-300 focus:border-gray-400 focus:!border-gray-400 focus:!ring-0 focus:!shadow-none dark:border-gray-500/40 dark:focus:border-gray-400/40",
    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
    className
      )}
      {...props}
    />
  )
}

export { Input }
