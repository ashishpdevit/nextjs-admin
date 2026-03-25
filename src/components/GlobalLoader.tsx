"use client"
import { useEffect } from "react"
import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

export default function GlobalLoader() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()

  const active = isFetching > 0 || isMutating > 0

  if (!active) return null

  let message = "Loading..."
  if (isMutating > 0) message = "Saving changes..."
  else if (isFetching > 0) message = "Syncing data..."

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-full border border-border/50 bg-background/80 px-4 py-2.5 text-sm font-medium shadow-xl backdrop-blur-md">
      {/* Sonar/Ping effect behind the spinner */}
      <div className="relative flex h-4 w-4 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75"></span>
        <Loader2 className="relative h-4 w-4 animate-spin text-primary" />
      </div>
      
      <span className="tracking-wide text-foreground">{message}</span>
    </div>
  )
}
