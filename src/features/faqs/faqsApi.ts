import { axios } from "@/lib/axios"
import defaults from "@/mocks/faqs.json"

export type Faq = {
  id: number
  question: Record<string, string>
  answer: Record<string, string>
  type: "web" | "user_app"
  status: string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
const STORAGE_KEY = "faqs:data"

function readMock(): Faq[] {
  if (typeof window === "undefined") return defaults as Faq[]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Faq[]) : (defaults as Faq[]);
  } catch {
    return defaults as Faq[];
  }
}
function writeMock(items: Faq[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

export async function fetchFaqsApi(): Promise<Faq[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150))
    return readMock()
  }
  const res = await axios.get<Faq[]>("/api/admin/faqs")
  return res.data
}

export async function createFaqApi(payload: Omit<Faq, "id">): Promise<Faq> {
  if (USE_MOCK) {
    const list = readMock()
    const nextId = (list.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1
    const created: Faq = { id: nextId, ...payload }
    writeMock([created, ...list])
    return created
  }
  const res = await axios.post<Faq>("/api/admin/faqs", payload)
  return res.data
}

export async function updateFaqApi(payload: Faq): Promise<Faq> {
  if (USE_MOCK) {
    const list = readMock().map((f) => (f.id === payload.id ? payload : f))
    writeMock(list)
    return payload
  }
  const res = await axios.put<Faq>(`/api/admin/faqs/${payload.id}`, payload)
  return res.data
}

export async function deleteFaqApi(id: number): Promise<number> {
  if (USE_MOCK) {
    const left = readMock().filter((f) => f.id !== id)
    writeMock(left)
    return id
  }
  await axios.delete(`/api/admin/faqs/${id}`)
  return id
}

