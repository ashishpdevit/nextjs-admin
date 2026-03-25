"use client"
import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FiltersBar } from "@/components/admin/filters"
import { exportCsv } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchAppMenuLinks, saveAppMenuLink, selectAppMenuLinks, selectAppMenuLinksLoading } from "@/store/appMenuLinks"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"
import { toast } from "sonner"
import { z } from "zod"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import dynamic from "next/dynamic"

const CKEditorWrapper = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react")
    const ClassicEditor = (await import("@ckeditor/ckeditor5-build-classic")).default
    return function Editor(props: any) {
      return <CKEditor editor={ClassicEditor} {...props} />
    }
  },
  { ssr: false, loading: () => <div className="flex min-h-[300px] items-center justify-center rounded-md border bg-muted/50 text-sm text-muted-foreground">Loading editor...</div> }
)

const linkSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.string().min(1, "Type is required."),
  audience: z.string().min(1, "Audience is required."),
  link: z.string().optional(),
  content: z.string().optional(),
  updatedAt: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "link" && (!data.link || data.link.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Link is required.",
      path: ["link"]
    })
  }
  if (data.type === "ckeditor" && (!data.content || data.content.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Content is required.",
      path: ["content"]
    })
  }
})

type LinkFormData = z.infer<typeof linkSchema>

export default function AppMenuLinksPage() {
  const [q, setQ] = useState("")
  const [type, setType] = useState("all")
  const [target, setTarget] = useState("all")
  const [sortKey, setSortKey] = useState<"name" | "type" | "audience" | "updatedAt">("updatedAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<number[]>([])
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectAppMenuLinks)
  const loading = useAppSelector(selectAppMenuLinksLoading)
  const [editing, setEditing] = useState<any | null>(null)
  const hasFetched = useRef(false)

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: { name: "", type: "link", audience: "User", link: "", content: "" }
  })

  const formType = useWatch({ control, name: "type" })

  useEffect(() => {
    if (editing) {
      reset({ ...editing, link: editing.link || "", content: editing.content || "" })
    } else {
      reset({ name: "", type: "link", audience: "User", link: "", content: "" })
    }
  }, [editing, reset])

  const fetchData = useCallback(() => {
    if (!hasFetched.current && !loading && (!data || data.length === 0)) {
      hasFetched.current = true
      dispatch(fetchAppMenuLinks())
    }
  }, [dispatch, loading, data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    return data?.filter((l:any) => {
      const mq = q ? l.name.toLowerCase().includes(q.toLowerCase()) : true
      const mt = type === "all" ? true : l.type === type
      const mf = target === "all" ? true : l.audience === target
      return mq && mt && mf
    })
  }, [q, type, target, data])

  const sorted = useMemo(() => {
    const list = [...filtered]
    list.sort((a: any, b: any) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return list
  }, [filtered, sortKey, sortDir])

  const onSubmit = async (formData: LinkFormData) => {
    // If your dispatch is an async thunk, you can await it here.
    dispatch(saveAppMenuLink(formData))
    toast.success("Link saved successfully")
    setEditing(null)
  }

  const total = sorted.length
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  const allVisibleSelected = paged.every((l) => selected.includes(l.id))

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">App Menu Links</h2>
          <p className="mt-1 text-xs text-muted-foreground">{total} links</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selected.length} items?`)) {
                toast.success(`Deleted ${selected.length} items`)
                setSelected([])
              }
            }}>
              Delete Selected ({selected.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => {
            const rows = sorted
            const cols = ["name", "type", "audience", "updatedAt", "link", "content"]
            exportCsv("app-menu-links.csv", rows, cols)
          }}>Export</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Links</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search links" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 md:w-72" />
          </div>
        </div>
        <div className="px-2 py-2">
          <FiltersBar id="app-menu-links" values={{ target }} onLoadPreset={() => { }}>
            <span />
            <span />
            <Select data-below value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="all">All targets</option>
              <option value="User">User</option>
              <option value="Website">Website</option>
            </Select>
          </FiltersBar>
        </div>

        {loading ? (
          <TableLoadingState message="Loading menu links..." />
        ) : paged.length === 0 ? (
          <TableEmptyState 
            title="No menu links found"
            message="Try adjusting your search or filter criteria to find what you're looking for."
          />
        ) : (
          <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={allVisibleSelected}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked
                    if (checked) setSelected(Array.from(new Set([...selected, ...paged.map((s) => s.id)])))
                    else setSelected(selected.filter((id) => !paged.some((s) => s.id === id)))
                  }}
                />
              </TableHead>
              {[
                ["name", "Name"],
                ["type", "Type"],
                ["audience", "For"],
                ["updatedAt", "Last Updated"],
                ["link", "Link / Content"],
                ["action", "Action"],
              ].map(([key, label]) => (
                <TableHead
                  key={key}
                  onClick={() => {
                    if (key === "link" || key === "action") return
                    const k = key as typeof sortKey
                    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc")
                    else { setSortKey(k); setSortDir("asc") }
                  }}
                  className={key === "link" || key === "action" ? "" : "cursor-pointer select-none"}
                >
                  {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(l.id)}
                    onChange={(e) => {
                      const checked = e.currentTarget.checked
                      setSelected((prev) => checked ? [...prev, l.id] : prev.filter((id) => id !== l.id))
                    }}
                  />
                </TableCell>
                <TableCell>{l.name}</TableCell>
                <TableCell>{l.type}</TableCell>
                <TableCell>{l.audience}</TableCell>
                <TableCell>{new Date(l.updatedAt).toLocaleString()}</TableCell>
                <TableCell className="space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    title="Copy link"
                    onClick={() => {
                      const url = new URL(l.link, location.origin).toString()
                      navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard"))
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 15L7 17a5 5 0 0 1-7-7l2-2" /><path d="M15 9l2-2a5 5 0 1 1 7 7l-2 2" /><path d="M8 12l8-8" /></svg>
                  </Button>
                  <Button variant="outline" size="sm" title="Edit" onClick={() => setEditing(l)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        )}

        {!loading && paged.length > 0 && (
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
            showPageSize
            onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
          />
        )}

        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="sm:max-w-2xl sm:h-[650px] flex flex-col overflow-hidden">
            <DialogHeader className="shrink-0">
              <DialogTitle>Edit App Menu Link</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              {editing && (
                <div className="flex flex-col gap-4 py-4 flex-1 overflow-y-auto pr-1">
                  <div className="grid gap-1.5 shrink-0">
                    <label className="text-sm font-medium">Name</label>
                    <Input {...register("name")} className={errors.name ? "border-destructive" : ""} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 shrink-0">
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium">Type</label>
                      <Select {...register("type")} className={errors.type ? "border-destructive" : ""}>
                        <option value="ckeditor">ckeditor</option>
                        <option value="link">link</option>
                      </Select>
                      {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <label className="text-sm font-medium">For</label>
                      <Select {...register("audience")} className={errors.audience ? "border-destructive" : ""}>
                        <option value="User">User</option>
                        <option value="Website">Website</option>
                      </Select>
                      {errors.audience && <p className="text-xs text-destructive">{errors.audience.message}</p>}
                    </div>
                  </div>
                  {formType === "ckeditor" ? (
                    <div className="flex flex-col gap-1.5 flex-1 min-h-[300px]">
                      <label className="text-sm font-medium">Editor Content</label>
                      <style>{`.ck-editor__editable_inline { min-height: 300px; max-height: 350px; overflow-y: auto; }`}</style>
                      <div className={`flex-1 rounded-md overflow-hidden text-foreground ${errors.content ? "border border-destructive" : ""}`}>
                        <Controller
                          name="content"
                          control={control}
                          render={({ field }) => (
                            <CKEditorWrapper
                              data={field.value || ""}
                              onChange={(_event: any, editor: any) => field.onChange(editor.getData())}
                            />
                          )}
                        />
                      </div>
                      {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
                    </div>
                  ) : (
                    <div className="grid gap-1.5 shrink-0">
                      <label className="text-sm font-medium">Generated Link</label>
                      <Input {...register("link")} className={errors.link ? "border-destructive" : ""} placeholder="https://..." />
                      {errors.link && <p className="text-xs text-destructive">{errors.link.message}</p>}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
