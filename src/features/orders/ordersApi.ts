import { axios } from "@/lib/axios"
import mockOrders from "@/mocks/orders.json"

export type Order = {
  id: string
  customer: string
  total: number
  date: string
  status: "Paid" | "Pending" | "Shipped" | "Refunded" | string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"

export async function fetchOrdersApi(): Promise<Order[]> {
  if (USE_MOCK) {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 200))
    return mockOrders.map((o) => ({ 
      ...o, 
      status: o.status || "Pending",
    }))
  }
  const res = await axios.get<Order[]>("/api/orders")
  return res.data
}

export async function createOrderApi(payload: Omit<Order, "id">): Promise<Order> {
  if (USE_MOCK) {
    const list = await fetchOrdersApi()
    const nextId = `ORD-${Date.now()}`
    const created: Order = { 
      id: nextId, 
      ...payload, 
    }
    return created
  }
  const res = await axios.post<Order>("/api/orders", payload)
  return res.data
}

export async function updateOrderApi(payload: Order): Promise<Order> {
  if (USE_MOCK) {
    return payload
  }
  const res = await axios.put<Order>(`/api/orders/${payload.id}`, payload)
  return res.data
}

export async function deleteOrderApi(id: string): Promise<string> {
  if (USE_MOCK) {
    return id
  }
  await axios.delete(`/api/orders/${id}`)
  return id
}
