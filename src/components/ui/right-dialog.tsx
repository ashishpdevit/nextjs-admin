"use client"
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getModalPositionClasses, getModalSizeClasses, type ModalConfig } from "@/lib/modal-config"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

interface RightDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  config?: Partial<ModalConfig>
}

const RightDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  RightDialogContentProps
>(({ className, children, config, ...props }, ref) => {
  const modalConfig = {
    position: config?.position || 'right',
    width: config?.width || '6xl',
    height: config?.height || 'full'
  }

  const positionClasses = getModalPositionClasses(modalConfig.position)
  const sizeClasses = getModalSizeClasses(modalConfig.width, modalConfig.height)

  return (
    <DialogPortal>
      <DialogPrimitive.Overlay className={positionClasses.overlay} />
      <div className={positionClasses.container}>
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            positionClasses.content,
            sizeClasses.width,
            sizeClasses.height,
            "flex flex-col bg-background dark:bg-gray-800 shadow-lg",
            className
          )}
          {...props}
        >
          {/* Hidden DialogTitle for accessibility */}
          <DialogPrimitive.Title className="sr-only">
            Modal Dialog
          </DialogPrimitive.Title>
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  )
})
RightDialogContent.displayName = DialogPrimitive.Content.displayName

const RightDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
RightDialogHeader.displayName = "RightDialogHeader"

const RightDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
RightDialogFooter.displayName = "RightDialogFooter"

const RightDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
RightDialogTitle.displayName = DialogPrimitive.Title.displayName

const RightDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
RightDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogTrigger,
  DialogClose,
  RightDialogContent,
  RightDialogHeader,
  RightDialogFooter,
  RightDialogTitle,
  RightDialogDescription,
}
