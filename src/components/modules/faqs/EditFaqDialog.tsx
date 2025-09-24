"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Faq, Lang } from "./types"

export default function EditFaqDialog({
  languages,
  open,
  onOpenChange,
  faq,
  onSave,
}: {
  languages: Lang[]
  open: boolean
  onOpenChange: (next: boolean) => void
  faq: Faq | null
  onSave: (data: Faq) => void
}) {
  const [editing, setEditing] = useState<Faq | null>(null)

  useEffect(() => {
    if (!open || !faq) return
    const question: Faq["question"] = { ...(faq.question ?? {}) }
    const answer: Faq["answer"] = { ...(faq.answer ?? {}) }
    languages.forEach((l) => {
      if (!question[l.code]) question[l.code] = ""
      if (!answer[l.code]) answer[l.code] = ""
    })
    setEditing({ ...faq, question, answer })
  }, [open, faq, languages])

  if (!open || !editing) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-3xl rounded-lg border bg-background p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Edit FAQ</div>
          <div className="flex items-center gap-2">
            <Select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as "web" | "user_app" })}>
              <option value="web">Web</option>
              <option value="user_app">User App</option>
            </Select>
            <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
            <Button onClick={() => onSave(editing)}>Save</Button>
          </div>
        </div>
        <div className="grid gap-3">
          {languages.map((l) => (
            <div key={l.code} className="grid gap-2 rounded-md border p-3">
              <div className="text-xs font-medium text-muted-foreground">{l.label}</div>
              <Input
                placeholder={`Question (${l.label})`}
                value={editing.question[l.code] ?? ""}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev
                      ? {
                          ...prev,
                          question: {
                            ...prev.question,
                            [l.code]: e.target.value,
                          },
                        }
                      : prev
                  )
                }
              />
              <Textarea
                placeholder={`Answer (${l.label})`}
                value={editing.answer[l.code] ?? ""}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev
                      ? {
                          ...prev,
                          answer: {
                            ...prev.answer,
                            [l.code]: e.target.value,
                          },
                        }
                      : prev
                  )
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editing)}>Save</Button>
        </div>
      </div>
    </div>
  )
}

