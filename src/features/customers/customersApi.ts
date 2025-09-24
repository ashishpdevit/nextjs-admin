import { axios } from "@/lib/axios"
import mockCustomers from "@/mocks/customers.json"

export type Customer = {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  status: "Active" | "Inactive" | "Pending" | string
  createdAt: string
  lastLogin?: string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"

export async function fetchCustomersApi(): Promise<Customer[]> {
  if (USE_MOCK) {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 200))
    return mockCustomers.map((c) => ({ 
      ...c, 
      status: c.status === "Suspended" ? "Inactive" : (c.status as any),
      createdAt: c.createdAt || new Date().toISOString(),
    }))
  }
  const res = await axios.get<Customer[]>("/customers")
  return res.data
}

export async function createCustomerApi(payload: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
  if (USE_MOCK) {
    const list = await fetchCustomersApi()
    const nextId = (list.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1
    const created: Customer = { 
      id: nextId, 
      ...payload, 
      createdAt: new Date().toISOString() 
    }
    return created
  }
  const res = await axios.post<Customer>("/customers", payload)
  return res.data
}

export async function updateCustomerApi(payload: Customer): Promise<Customer> {
  if (USE_MOCK) {
    return payload
  }
  const res = await axios.put<Customer>(`/customers/${payload.id}`, payload)
  return res.data
}

export async function deleteCustomerApi(id: number): Promise<number> {
  if (USE_MOCK) {
    return id
  }
  await axios.delete(`/customers/${id}`)
  return id
}
