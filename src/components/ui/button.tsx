"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link"
  size?: "sm" | "md" | "lg" | "icon"
  asChild?: boolean
}

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-primary text-primary-foreground hover:opacity-90",
  secondary:
    "bg-secondary text-secondary-foreground hover:opacity-90",
  destructive:
    "bg-destructive text-white hover:opacity-90",
  outline:
    "border border-input bg-background hover:bg-muted",
  ghost: "hover:bg-muted",
  link: "text-primary underline-offset-4 hover:underline",
}

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3",
  md: "h-9 px-4",
  lg: "h-10 px-5",
  icon: "h-9 w-9",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild, ...props }, ref) => {
    const buttonClassName = cn(base, variants[variant], sizes[size], className)

    if (asChild) {
      const child = React.Children.only(props.children) as React.ReactElement
      // Filter out children prop that shouldn't be passed to the child
      const { children: _, ...filteredProps } = props
      const childClassName = (child.props as any)?.className
      return React.cloneElement(child, {
        className: cn(buttonClassName, childClassName),
        ...filteredProps,
      } as any)
    }

    return (
      <button
        ref={ref}
        className={buttonClassName}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export default Button
