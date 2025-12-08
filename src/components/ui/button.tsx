import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "src/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white text-xs text-primary-foreground shadow-none hover:bg-blue-900",
        destructive:
          "bg-destructive text-xs text-destructive-foreground shadow-none hover:bg-red-700",
        outline:
          "border text-xs border-blue-600 bg-white text-blue-600 shadow-none hover:text-white hover:bg-blue-600 hover:border-blue-600",
        secondary:
          "bg-secondary text-xs text-secondary-foreground shadow-none hover:bg-secondary/80",
        ghost: "hover:bg-accent text-xs shadow-none hover:text-accent-foreground",
        link: "text-primary text-xs shadow-none underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 rounded-md py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
