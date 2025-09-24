import { axios } from "@/lib/axios"
import mockAdmins from "@/mocks/admins.json"

export type Admin = {
  id: number
  name: string
  email: string
  role: string
  status: "Active" | "Inactive" | string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"

export async function fetchAdminsApi(): Promise<Admin[]> {
  if (USE_MOCK) {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 200))
    return mockAdmins.map((u) => ({ ...u, status: u.status === "Suspended" ? "Inactive" : (u.status as any) }))
  }
  const res = await axios.get<Admin[]>("/admins")
  return res.data
}
