import Link from "next/link"

export default function Landing() {
  return (
    <div className="grid gap-12 py-10">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold">Admin Starter Kit</h1>
        <p className="mt-2 text-muted-foreground">A compact Next.js admin with filters, pagination, CSV export and a clean panel-inspired UI.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/login" className="rounded-md bg-primary px-5 py-2 text-primary-foreground">Login</Link>
          <Link href="/signup" className="rounded-md border px-5 py-2">Sign up</Link>
        </div>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <Feature title="Modules" desc="Users, Products, Orders, App Settings, FAQs and more." />
        <Feature title="UX" desc="Saved filters, CSV export, sorting, pagination, dark mode." />
        <Feature title="Theming" desc="Brand, primary color and radius from settings." />
      </section>
      <section className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
        By continuing you agree to our <Link href="/legal/terms" className="hover:underline">Terms</Link> and acknowledge the <Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link>.
      </section>
    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </div>
  )
}
