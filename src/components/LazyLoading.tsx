"use client"
import { Loader2 } from "lucide-react"

// Keep this fallback strictly for explicit client-side boundaries if needed elsewhere.
export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

import FaqsTable from "@/components/modules/faqs/FaqsTable"
import CreateFaqDialog from "@/components/modules/faqs/CreateFaqDialog"
import EditFaqDialog from "@/components/modules/faqs/EditFaqDialog"
import { TableCard } from "@/components/admin/table-card"
import { FiltersBar } from "@/components/admin/filters"

// Safely alias standard imports to preserve existing usages.
// Tip: Slowly rename these in your app directly to standard imports over time!
export const LazyFaqsTable = FaqsTable
export const LazyCreateFaqDialog = CreateFaqDialog
export const LazyEditFaqDialog = EditFaqDialog
export const LazyTableCard = TableCard
export const LazyFiltersBar = FiltersBar
