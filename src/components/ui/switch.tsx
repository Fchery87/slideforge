"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.ComponentProps<"input"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Switch({
  className,
  checked,
  onCheckedChange,
  ...props
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(checked ?? false)
  
  const isChecked = checked !== undefined ? checked : internalChecked
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked
    if (checked === undefined) {
      setInternalChecked(newChecked)
    }
    onCheckedChange?.(newChecked)
  }

  return (
    <label
      className={cn(
        "relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors",
        isChecked ? "bg-rose-600" : "bg-white/10",
        className
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={isChecked}
        onChange={handleChange}
        {...props}
      />
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white transition-transform",
          isChecked ? "translate-x-4.5" : "translate-x-0.5"
        )}
      />
    </label>
  )
}

export { Switch }
