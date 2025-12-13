"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Database, Lock, BarChart3, Users, Settings, FileText } from "lucide-react"

export default function Landing() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Enterprise-Grade Admin Panel</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Powerful Admin Dashboard
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Built for Modern Teams
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              A comprehensive Next.js admin dashboard with advanced features, role-based access control, 
              and a beautiful, intuitive interface. Manage your business with ease.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="group h-12 px-8 text-base">
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to streamline your workflow and boost productivity
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Database className="h-6 w-6" />}
              title="Comprehensive Modules"
              description="Users, Products, Orders, Customers, FAQs, and more. All the modules you need in one place."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Lightning Fast"
              description="Built with Next.js 15 and optimized for performance. Experience blazing-fast load times."
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title="Role-Based Access"
              description="Advanced RBAC system with granular permissions. Control who can access what."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Advanced Analytics"
              description="CSV export, sorting, pagination, and saved filters. Make data-driven decisions."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="User Management"
              description="Complete user and customer management with detailed profiles and activity tracking."
            />
            <FeatureCard
              icon={<Settings className="h-6 w-6" />}
              title="Customizable"
              description="Theming, brand colors, and settings. Make it yours with easy customization."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 text-center shadow-lg md:p-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of teams already using our admin dashboard to manage their business efficiently.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/login">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/signup">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="border-t bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/legal/terms" className="font-medium text-primary hover:underline">
              Terms & Conditions
            </Link>{" "}
            and acknowledge our{" "}
            <Link href="/legal/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
