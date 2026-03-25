import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Outer subtle ping effect */}
        <div className="absolute h-12 w-12 animate-ping rounded-full bg-primary/20" />
        {/* Inner clean spinner */}
        <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
      </div>
      <p className="animate-pulse text-sm font-medium text-muted-foreground tracking-wide">
        Loading...
      </p>
    </div>
  )
}