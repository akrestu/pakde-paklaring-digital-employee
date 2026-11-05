import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground flex field-sizing-content min-h-24 w-full rounded-md border-2 border-transparent bg-input px-4 py-3 text-base transition-[color,border-color,box-shadow] outline-none focus-visible:border-foreground focus-visible:bg-card dark:focus-visible:border-accent aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
