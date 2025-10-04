import { axios } from "@/lib/axios"
import defaults from "@/mocks/appMenuLinks.json"

export type AppMenuLink = {
  id: number
  name: string
  type: string
  for: string
  updatedAt: string
  link: string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
const STORAGE_KEY = "app-menu-links:data"

function readMock(): AppMenuLink[] {
  if (typeof window === "undefined") return defaults as AppMenuLink[]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AppMenuLink[]) : (defaults as AppMenuLink[])
  } catch {
    return defaults as AppMenuLink[]
  }
}
function writeMock(items: AppMenuLink[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

export async function fetchAppMenuLinksApi(): Promise<AppMenuLink[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150))
    return readMock()
  }
  const res = await axios.get<AppMenuLink[]>("/api/admin/menu-links")
  return res.data
}

export async function updateAppMenuLinkApi(update: AppMenuLink): Promise<AppMenuLink> {
  if (USE_MOCK) {
    const list = readMock().map((it) => (it.id === update.id ? { ...update, updatedAt: new Date().toISOString() } : it))
    writeMock(list)
    return list.find((i) => i.id === update.id) as AppMenuLink
  }
  const res = await axios.put<AppMenuLink>(`/api/admin/menu-links/${update.id}`, update)
  return res.data
}
