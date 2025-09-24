import { Button } from "@/components/ui/button"

export function Pagination({
  page,
  total,
  pageSize,
  onChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  showPageSize = true,
}: {
  page: number
  total: number
  pageSize: number
  onChange: (next: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  showPageSize?: boolean
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages
  const to = Math.min(total, page * pageSize)
  const from = Math.min(to, (page - 1) * pageSize + 1)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-between py-3 px-3">
      <div className="flex items-center gap-2">
        {showPageSize && (
          <>
            <span className="text-xs text-muted-foreground">Rows per page</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground tabular-nums">
          {from} - {to} of {total}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => onChange(page - 1)}>{"<"}</Button>
          {pages.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(p)}
            >
              {p}
            </Button>
          ))}
          <Button variant="outline" size="sm" disabled={!canNext} onClick={() => onChange(page + 1)}>{">"}</Button>
        </div>
      </div>
    </div>
  )
}
