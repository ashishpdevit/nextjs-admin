"use client"
import { useEffect, useMemo, useState } from "react"
import langs from "@/mocks/langs.json"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FiltersBar } from "@/components/admin/filters"
import { exportCsv } from "@/lib/utils"
import { Plus } from "lucide-react"
import type { Faq, Lang } from "@/components/modules/faqs/types"
import { Suspense } from "react"
import { LazyFaqsTable, LazyCreateFaqDialog, LazyEditFaqDialog } from "@/components/LazyLoading"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { createFaq, fetchFaqs, removeFaq, selectFaqs, updateFaq } from "@/store/faqs"
import { useConfirm } from "@/components/ConfirmDialog"
import { Toaster, toast } from 'sonner';

const STORAGE_KEY = "faqs:data"

export default function FaqsPage() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [pageSize, setPageSize] = useState(10)
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectFaqs)
  const confirm = useConfirm()
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [current, setCurrent] = useState<Faq | null>(null)

  const languages: Lang[] = (langs as Lang[]) || []

  useEffect(() => { dispatch(fetchFaqs()) }, [dispatch])

  const filtered = useMemo(() => {
    return data.filter((f) => {
      const text = languages
        .map((l) => (f.question[l.code] || "") + " " + (f.answer[l.code] || ""))
        .join(" ")
        .toLowerCase()
      const mq = q ? text.includes(q.toLowerCase()) : true
      const ms = status === "all" ? true : f.status === status
      return mq && ms
    })
  }, [data, q, status, languages])

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">FAQs</h2>
          <p className="mt-1 text-xs text-muted-foreground">{filtered.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const rows = filtered
            const cols = ["id", "status"]
            exportCsv("faqs.csv", rows, cols)
          }}>Export</Button>
          <Button onClick={() => setShowCreate(true)}><Plus size={16} className="mr-1" /> New</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">FAQs</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search FAQs" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-56 md:w-72" />
          </div>
        </div>
        <div className="px-2 py-2">
          <FiltersBar id="faqs" values={{ status }} onLoadPreset={() => { }}>
            <span />
            <span />
            <Select data-below value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </FiltersBar>
        </div>

        <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="text-sm text-muted-foreground">Loading table...</div></div>}>
          <LazyFaqsTable
            rows={filtered}
            languages={languages}
            pageSize={pageSize}
            onPageSizeChange={(n) => setPageSize(n)}
            onEdit={(faq) => {
              setCurrent(faq)
              setShowEdit(true)
            }}
            onDelete={async (id) => {
              const ok = await confirm({ title: "Delete FAQ", description: "Are you sure you want to delete this FAQ?", confirmText: "Delete", variant: "destructive" })
              if (ok) { await dispatch(removeFaq(id)); toast.success("FAQ deleted") }
            }}
          />
        </Suspense>

        <Suspense fallback={null}>
          <LazyCreateFaqDialog
            languages={languages}
            open={showCreate}
            onOpenChange={setShowCreate}
            onSave={(payload) => { dispatch(createFaq(payload)); setShowCreate(false) }}
          />
        </Suspense>

        <Suspense fallback={null}>
          <LazyEditFaqDialog
            languages={languages}
            open={showEdit}
            onOpenChange={setShowEdit}
            faq={current}
            onSave={(updated) => { dispatch(updateFaq(updated)); setShowEdit(false); setCurrent(null) }}
          />
        </Suspense>
      </div>
    </div>
  )
}
