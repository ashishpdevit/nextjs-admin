import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportCsv(filename: string, rows: any[], columns: string[]) {
  const header = columns.join(",")
  const lines = rows.map((r) => columns.map((c) => {
    const v = (r as any)[c]
    const s = v == null ? "" : String(v)
    const needsQuote = /[",\n]/.test(s)
    return needsQuote ? `"${s.replace(/"/g, '""')}"` : s
  }).join(","))
  const csv = [header, ...lines].join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
