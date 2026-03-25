import Sidebar from "@/features/layout/Sidebar"
import Topbar from "@/features/layout/Topbar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="relative z-50">
          <Topbar />
        </header>
        <main className="flex-1 p-3 md:p-4 bg-main-background">
          {/* <div className="mx-auto w-full max-w-screen-2xl"> */}
          <div className="mx-auto w-full p-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
