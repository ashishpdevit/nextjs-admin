"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // We initialize the QueryClient inside a useState hook to ensure it is only
  // created once per component lifecycle and isn't shared across different users/requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data remains fresh for 1 minute
            refetchOnWindowFocus: false, // Prevents aggressive refetching when switching browser tabs
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}