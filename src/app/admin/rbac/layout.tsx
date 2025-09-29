import { RbacNav } from "@/components/rbac/RbacNav"

export default function RbacLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Access Control</h1>
        <p className="text-sm text-muted-foreground">
          Manage modules, permissions, and role assignments for the admin console.
        </p>
      </header>
      <RbacNav />
      <div className="pt-2">
        {children}
      </div>
    </div>
  )
}
