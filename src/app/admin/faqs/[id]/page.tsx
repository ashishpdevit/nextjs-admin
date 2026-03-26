"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchFaqs, selectFaqs, createFaq, updateFaq } from "@/store/faqs"
import { toast } from "sonner"
import langs from "@/mocks/langs.json"
import type { Faq, Lang } from "@/components/modules/faqs/types"

export default function FaqFormPage() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  const idStr = params?.id as string
  const isNew = idStr === "new"
  const faqId = !isNew ? Number(idStr) : null

  const data = useAppSelector(selectFaqs)
  const languages: Lang[] = (langs as Lang[]) || []

  // Initialize editing state
  const [editing, setEditing] = useState<Faq | null>(null)
  const [init, setInit] = useState(false)

  // Fetch data if not available
  useEffect(() => {
    if (!data || data.length === 0) {
      dispatch(fetchFaqs({}))
    }
  }, [dispatch, data])

  // Set form data
  useEffect(() => {
    if (!init) {
      if (isNew) {
        const question: Record<string, string> = {}
        const answer: Record<string, string> = {}
        languages.forEach((l) => {
          question[l.code] = ""
          answer[l.code] = ""
        })
        setEditing({
          id: 0,
          type: "web",
          status: "Active",
          question,
          answer
        })
        setInit(true)
      } else if (faqId && data && data.length > 0) {
        const existing = data.find((f: any) => f.id === faqId)
        if (existing) {
          const question: Faq["question"] = { ...(existing.question ?? {}) }
          const answer: Faq["answer"] = { ...(existing.answer ?? {}) }
          languages.forEach((l) => {
            if (!question[l.code]) question[l.code] = ""
            if (!answer[l.code]) answer[l.code] = ""
          })
          setEditing({ ...existing, question, answer })
        }
        setInit(true)
      }
    }
  }, [data, faqId, isNew, init, languages])

  const handleSave = async () => {
    if (!editing) return
    if (isNew) {
      // Create
      // @ts-ignore
      await dispatch(createFaq(editing))
      toast.success("FAQ created successfully")
    } else {
      // @ts-ignore
      await dispatch(updateFaq(editing))
      toast.success("FAQ updated successfully")
    }
    router.push("/admin/faqs")
  }

  if (!init || !editing) return <div className="p-4 text-muted-foreground text-sm">Loading record...</div>

  return (
    <div className="space-y-4 max-w-3xl max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {isNew ? "Create FAQ" : "Edit FAQ"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Manage frequently asked questions and their translations.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-4 border-b pb-4">
            <div className="grid gap-1.5 flex-1">
              <label className="text-sm font-medium">Type</label>
              <Select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as "web" | "user_app" })}>
                <option value="web">Web</option>
                <option value="user_app">User App</option>
              </Select>
            </div>
            <div className="grid gap-1.5 flex-1">
              <label className="text-sm font-medium">Status</label>
              <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
            {languages.map((l) => (
              <div key={l.code} className="grid gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 p-4">
                <div className="text-sm font-semibold">{l.label} Translation</div>
                <div className="grid gap-1.5">
                  <label className="text-xs text-muted-foreground">Question</label>
                  <Input
                    placeholder={`Question in ${l.label}`}
                    value={editing.question[l.code] ?? ""}
                    onChange={(e) =>
                      setEditing((prev) =>
                        prev
                          ? {
                              ...prev,
                              question: { ...prev.question, [l.code]: e.target.value },
                            }
                          : prev
                      )
                    }
                  />
                </div>
                <div className="grid gap-1.5 mt-2">
                  <label className="text-xs text-muted-foreground">Answer</label>
                  <Textarea
                    placeholder={`Answer in ${l.label}`}
                    value={editing.answer[l.code] ?? ""}
                    className="min-h-[100px]"
                    onChange={(e) =>
                      setEditing((prev) =>
                        prev
                          ? {
                              ...prev,
                              answer: { ...prev.answer, [l.code]: e.target.value },
                            }
                          : prev
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/faqs")}>Cancel</Button>
            <Button onClick={handleSave}>
              {isNew ? "Create FAQ" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
