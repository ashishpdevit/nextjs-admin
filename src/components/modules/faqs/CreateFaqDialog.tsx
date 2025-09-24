"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Faq, Lang } from "./types"

export default function CreateFaqDialog({
  languages,
  open,
  onOpenChange,
  onSave,
}: {
  languages: Lang[]
  open: boolean
  onOpenChange: (next: boolean) => void
  onSave: (data: Faq) => void
}) {
  const [status, setStatus] = useState("Active")
  const [type, setType] = useState<"web" | "user_app">("web")
  const [question, setQuestion] = useState<Faq["question"]>({})
  const [answer, setAnswer] = useState<Faq["answer"]>({})

  useEffect(() => {
    const t: Faq["question"] = {}
    const a: Faq["answer"] = {}
    languages.forEach((l) => {
      t[l.code] = ""
      a[l.code] = ""
    })
    setQuestion(t)
    setAnswer(a)
    setStatus("Active")
    setType("web")
  }, [open, languages])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-3xl rounded-lg border bg-background p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Add FAQ</div>
          <div className="flex items-center gap-2">
            <Select value={type} onChange={(e) => setType(e.target.value as "web" | "user_app")}>
              <option value="web">Web</option>
              <option value="user_app">User App</option>
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
            <Button onClick={() => onSave({ id: 0, type, status, question, answer })}>Save</Button>
          </div>
        </div>
        <div className="grid gap-3">
          {languages.map((l) => (
            <div key={l.code} className="grid gap-2 rounded-md border p-3">
              <div className="text-xs font-medium text-muted-foreground">{l.label}</div>
              <Input
                placeholder={`Question (${l.label})`}
                value={question[l.code] ?? ""}
                onChange={(e) =>
                  setQuestion((prev) => ({
                    ...prev,
                    [l.code]: e.target.value,
                  }))
                }
              />
              <Textarea
                placeholder={`Answer (${l.label})`}
                value={answer[l.code] ?? ""}
                onChange={(e) => {
                  setAnswer((prev) => ({
                    ...prev,
                    [l.code]: e.target.value,
                  }))
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave({ id: 0, type, status, question, answer })}>Save</Button>
        </div>
      </div>
    </div>
  )
}

