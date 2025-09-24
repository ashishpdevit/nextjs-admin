"use client"
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ConfirmVariant = "default" | "destructive"

export type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

type Resolver = (ok: boolean) => void

type Ctx = {
  confirm: (options?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<Ctx | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<Resolver | null>(null)

  const confirm = useCallback((opts?: ConfirmOptions) => {
    setOptions({
      title: "Are you sure?",
      description: "This action cannot be undone.",
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "destructive",
      ...(opts || {}),
    })
    setOpen(true)
    return new Promise<boolean>((resolve) => setResolver(() => resolve))
  }, [])

  const onClose = useCallback(() => {
    setOpen(false)
    // If closed without choice, resolve as false
    if (resolver) resolver(false)
    setResolver(null)
  }, [resolver])

  const onConfirm = useCallback(() => {
    setOpen(false)
    if (resolver) resolver(true)
    setResolver(null)
  }, [resolver])

  const onCancel = useCallback(() => {
    setOpen(false)
    if (resolver) resolver(false)
    setResolver(null)
  }, [resolver])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : onClose())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{options?.title || "Confirm"}</DialogTitle>
          </DialogHeader>
          {options?.description && (
            <p className="text-sm text-muted-foreground">{options.description}</p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              {options?.cancelText || "Cancel"}
            </Button>
            <Button
              onClick={onConfirm}
              className={options?.variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white" : "text-white"}
            >
              {options?.confirmText || "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider")
  return ctx.confirm
}

