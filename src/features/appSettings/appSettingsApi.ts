import { axios } from "@/lib/axios"
import defaults from "@/mocks/appSettings.json"

export type AppSetting = {
  id: number
  label: string
  version: string
  forceUpdates: number
  maintenance: number
  updatedAt: string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"
const STORAGE_KEY = "app-settings:data"

function readMock(): AppSetting[] {
  if (typeof window === "undefined") return defaults as AppSetting[]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AppSetting[]) : (defaults as AppSetting[])
  } catch {
    return defaults as AppSetting[]
  }
}
function writeMock(items: AppSetting[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

export async function fetchAppSettingsApi(): Promise<AppSetting[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150))
    return readMock()
  }
  const res = await axios.get<AppSetting[]>("/app-settings")
  return res.data
}

export async function updateAppSettingApi(update: AppSetting): Promise<AppSetting> {
  if (USE_MOCK) {
    const list = readMock().map((it) => (it.id === update.id ? { ...update, updatedAt: new Date().toISOString() } : it))
    writeMock(list)
    return list.find((i) => i.id === update.id) as AppSetting
  }
  const res = await axios.put<AppSetting>(`/app-settings/${update.id}`, update)
  return res.data
}
