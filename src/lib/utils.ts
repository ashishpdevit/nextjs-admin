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

/**
 * Converts an image URL to use the Next.js proxy route to avoid CORS issues
 * @param imageUrl - The original image URL (e.g., http://localhost:3000/images/file.png)
 * @returns The proxied URL (e.g., /api/images/file.png)
 */
export function getProxiedImageUrl(imageUrl: string | undefined | null): string | undefined {
  if (!imageUrl) return undefined
  
  try {
    const url = new URL(imageUrl)
    
    // Check if it's from localhost:3000 or the API URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'
    const apiUrl = new URL(apiBaseUrl)
    
    // If the image is from the same origin as the API, proxy it
    if (url.origin === apiUrl.origin && url.pathname.startsWith('/images/')) {
      // Extract the path after /images/
      const imagePath = url.pathname.replace('/images/', '')
      return `/api/images/${imagePath}`
    }
    
    // If it's already a relative URL or from a different origin, return as is
    return imageUrl
  } catch (error) {
    // If URL parsing fails, check if it's already a relative path
    if (imageUrl.startsWith('/')) {
      return imageUrl
    }
    
    // If it starts with /images/, convert to proxy route
    if (imageUrl.startsWith('/images/')) {
      const imagePath = imageUrl.replace('/images/', '')
      return `/api/images/${imagePath}`
    }
    
    // Return as is if we can't parse it
    return imageUrl
  }
}