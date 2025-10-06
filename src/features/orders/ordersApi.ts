import { axios } from "@/lib/axios"
import mockOrders from "@/mocks/orders.json"

export type Order = {
  id: string
  customer: string
  total: number
  date: string
  status: "Paid" | "Pending" | "Shipped" | "Refunded" | string
}

export type PaginationLinks = {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export type PaginationMeta = {
  current_page: number
  from: number
  last_page: number
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  path: string
  per_page: number
  to: number
  total: number
}

export type OrdersResponse = {
  status: boolean
  message: string
  data: Order[]
  links: PaginationLinks
  meta: PaginationMeta
}

export type OrdersParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  status?: string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"

export async function fetchOrdersApi(params?: OrdersParams): Promise<OrdersResponse> {
  if (USE_MOCK) {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 200))
    
    let filteredOrders = [...mockOrders]
    
    // Apply search filter
    if (params?.search) {
      filteredOrders = filteredOrders.filter(o => 
        o.id.toLowerCase().includes(params.search!.toLowerCase()) ||
        o.customer.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    // Apply status filter
    if (params?.status && params.status !== 'all') {
      filteredOrders = filteredOrders.filter(o => o.status === params.status)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      filteredOrders.sort((a, b) => {
        const aVal = a[params.sortBy as keyof typeof a]
        const bVal = b[params.sortBy as keyof typeof b]
        
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return params.sortOrder === 'asc' ? -1 : 1
        if (bVal == null) return params.sortOrder === 'asc' ? 1 : -1
        
        if (aVal < bVal) return params.sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return params.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }
    
    // Apply pagination
    const page = params?.page || 1
    const limit = params?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex)
    
    const total = filteredOrders.length
    const lastPage = Math.ceil(total / limit)
    
    return {
      status: true,
      message: "Orders fetched successfully",
      data: paginatedOrders.map((o) => ({ 
        ...o, 
        status: o.status || "Pending",
      })),
      links: {
        first: page > 1 ? `/api/admin/orders?page=1&limit=${limit}` : null,
        last: page < lastPage ? `/api/admin/orders?page=${lastPage}&limit=${limit}` : null,
        prev: page > 1 ? `/api/admin/orders?page=${page - 1}&limit=${limit}` : null,
        next: page < lastPage ? `/api/admin/orders?page=${page + 1}&limit=${limit}` : null,
      },
      meta: {
        current_page: page,
        from: startIndex + 1,
        last_page: lastPage,
        links: Array.from({ length: lastPage }, (_, i) => ({
          url: i + 1 === page ? null : `/api/admin/orders?page=${i + 1}&limit=${limit}`,
          label: String(i + 1),
          active: i + 1 === page
        })),
        path: "/api/admin/orders",
        per_page: limit,
        to: Math.min(endIndex, total),
        total
      }
    }
  }
  
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder)
  if (params?.search) searchParams.set('search', params.search)
  if (params?.status && params.status !== 'all') searchParams.set('status', params.status)
  
  const queryString = searchParams.toString()
  const url = `/api/admin/orders${queryString ? `?${queryString}` : ''}`
  
  const res = await axios.get<OrdersResponse>(url)
  return res.data
}

export async function createOrderApi(payload: Omit<Order, "id">): Promise<Order> {
  if (USE_MOCK) {
    const response = await fetchOrdersApi()
    const nextId = `ORD-${Date.now()}`
    const created: Order = { 
      id: nextId, 
      ...payload, 
    }
    return created
  }
  const res = await axios.post<{success: boolean, message: string, data: Order}>("/api/admin/orders", payload)
  return res.data.data
}

export async function updateOrderApi(payload: Order): Promise<Order> {
  if (USE_MOCK) {
    return payload
  }
  const res = await axios.put<{success: boolean, message: string, data: Order}>(`/api/admin/orders/${payload.id}`, payload)
  return res.data.data
}

export async function deleteOrderApi(id: string): Promise<string> {
  if (USE_MOCK) {
    return id
  }
  await axios.delete(`/api/admin/orders/${id}`)
  return id
}
