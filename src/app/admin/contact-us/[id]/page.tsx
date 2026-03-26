"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchMessages, selectContact, selectContactLoading } from "@/store/contact"
import { ArrowLeft, Mail, Calendar, Hash } from "lucide-react"

export default function ContactUsViewPage() {
  const router = useRouter()
  const params = useParams()
  const idStr = params?.id as string
  const dispatch = useAppDispatch()
  
  const messages = useAppSelector(selectContact)
  const loading = useAppSelector(selectContactLoading)
  
  const [init, setInit] = useState(false)
  
  useEffect(() => {
    if (!loading && (!messages || messages.length === 0)) {
      dispatch(fetchMessages())
    }
    setInit(true)
  }, [dispatch, loading, messages])

  const message = messages?.find((m: any) => m.id.toString() === idStr)

  if (!init || loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading message details...</div>
  }

  if (!message) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/admin/contact-us")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to messages
        </Button>
        <div className="p-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-lg border">
          Message not found or has been deleted.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl max-w-full">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin/contact-us")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Contact Message Details</h2>
          <p className="text-sm text-muted-foreground">Viewing full message from the contact form.</p>
        </div>
      </div>
      
      <Card className="shadow-none border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message ID</p>
                <p className="font-semibold">{message.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email / Contact</p>
                <p className="font-semibold">{message.contact}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Received Date</p>
                <p className="font-semibold">{new Date(message.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Message Content</h3>
            <div className="rounded-md border bg-muted/30 p-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground min-h-[150px]">
              {message.message}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
