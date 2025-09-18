// src/components/ui/switch.jsx - CREATE THIS FILE
import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ 
  className, 
  checked = false, 
  onCheckedChange, 
  disabled = false, 
  id,
  ...props 
}, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked)

  React.useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleToggle = () => {
    if (disabled) return
    
    const newChecked = !isChecked
    setIsChecked(newChecked)
    
    if (onCheckedChange) {
      onCheckedChange(newChecked)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-disabled={disabled}
      disabled={disabled}
      id={id}
      ref={ref}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        isChecked 
          ? "bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/25" 
          : "bg-input hover:bg-gray-300 dark:hover:bg-gray-600",
        className
      )}
      onClick={handleToggle}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform duration-200 ease-in-out",
          isChecked 
            ? "translate-x-5 bg-white" 
            : "translate-x-0 bg-white",
        )}
      />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch }
