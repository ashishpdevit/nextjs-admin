"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchAppMenuLinks, saveAppMenuLink, selectAppMenuLinks, selectAppMenuLinksLoading } from "@/store/appMenuLinks"
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
})

type LinkFormData = z.infer<typeof linkSchema>

export default function EditAppMenuLinkPage() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  
  const idStr = params?.id as string
  const linkId = idStr && idStr !== "new" ? Number(idStr) : null

  const data = useAppSelector(selectAppMenuLinks)
  const loading = useAppSelector(selectAppMenuLinksLoading)
  
  const [init, setInit] = useState(false)

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: { name: "", type: "link", audience: "User", link: "", content: "" }
  })

  const formType = useWatch({ control, name: "type" })

  useEffect(() => {
    if (!data || data.length === 0) {
      dispatch(fetchAppMenuLinks())
    }
  }, [dispatch, data])

  useEffect(() => {
    if (linkId && data && data.length > 0 && !init) {
      const existing = data.find((l: any) => l.id === linkId)
      if (existing) {
        reset({ ...existing, link: existing.link || "", content: existing.content || "" })
      }
      setInit(true)
    } else if (!linkId && !init) {
      setInit(true)
    }
  }, [data, linkId, init, reset])

  const onSubmit = async (formData: LinkFormData) => {
    // @ts-ignore - 'for' vs 'audience' mismatch handled here
    dispatch(saveAppMenuLink(formData))
    toast.success("Link saved successfully")
    router.push("/admin/app-menu-links")
  }

  if (linkId && !init) return <div className="p-4 text-muted-foreground text-sm">Loading record...</div>

  return (
    <div className="space-y-4 max-w-4xl max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {linkId ? "Edit Menu Link" : "Create Menu Link"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Modify settings and content for the selected app menu link.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                <style>{`.ck-editor__editable_inline { min-height: 400px; max-height: 600px; overflow-y: auto; }`}</style>
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
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/app-menu-links")}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Link"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
