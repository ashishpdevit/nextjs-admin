import Link from "next/link"
import { cn } from "@/lib/utils"

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" className="h-6 w-6 rounded bg-muted p-1" />
            <span className="text-base font-semibold tracking-tight">Company</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-muted-foreground hover:underline" href="/login">Login</Link>
            <Link className="text-muted-foreground hover:underline" href="/signup">Sign up</Link>
          </nav>
        </div>
      </header>
      <main className={cn("max-w-screen-4xl p-4 md:p-6 flex-1 flex items-center justify-center bg-main-background")}> 
        {children}
      </main>
      <footer className="mt-auto border-t bg-background">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 text-xs text-muted-foreground">
          <div></div>
          <div className="flex items-center gap-3">
            <Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link>
            <span className="text-border">|</span>
            <Link href="/legal/terms" className="hover:underline">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

