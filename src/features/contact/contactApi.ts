import { axios } from "@/lib/axios"
import defaults from "@/mocks/contactUs.json"

export type ContactMessage = { id: number; message: string; contact: string; createdAt: string }

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
const STORAGE_KEY = "contact-us:data"

function readMock(): ContactMessage[] {
  if (typeof window === "undefined") return defaults as ContactMessage[]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ContactMessage[]) : (defaults as ContactMessage[])
  } catch {
    return defaults as ContactMessage[]
  }
}
function writeMock(items: ContactMessage[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

export async function fetchContactMessagesApi(): Promise<ContactMessage[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150))
    return readMock()
  }
  const res = await axios.get<ContactMessage[]>("/api/admin/contact-requests")
  return res.data
}

export async function deleteContactMessageApi(id: number): Promise<number> {
  if (USE_MOCK) {
    const left = readMock().filter((m) => m.id !== id)
    writeMock(left)
    return id
  }
  await axios.delete(`/api/admin/contact-requests/${id}`)
  return id
}

