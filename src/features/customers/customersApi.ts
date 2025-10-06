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

export type CustomersResponse = {
  status: boolean
  message: string
  data: Customer[]
  links: PaginationLinks
  meta: PaginationMeta
}

export type CustomersParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  status?: string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"

export async function fetchCustomersApi(params?: CustomersParams): Promise<CustomersResponse> {
  if (USE_MOCK) {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 200))
    
    let filteredCustomers = [...mockCustomers]
    
    // Apply search filter
    if (params?.search) {
      filteredCustomers = filteredCustomers.filter(c => 
        c.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        c.email.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    // Apply status filter
    if (params?.status && params.status !== 'all') {
      filteredCustomers = filteredCustomers.filter(c => c.status === params.status)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      filteredCustomers.sort((a, b) => {
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
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)
    
    const total = filteredCustomers.length
    const lastPage = Math.ceil(total / limit)
    
    return {
      status: true,
      message: "Customers fetched successfully",
      data: paginatedCustomers.map((c) => ({ 
        ...c, 
        status: c.status === "Suspended" ? "Inactive" : (c.status as any),
        createdAt: c.createdAt || new Date().toISOString(),
      })),
      links: {
        first: page > 1 ? `/api/app/customers?page=1&limit=${limit}` : null,
        last: page < lastPage ? `/api/app/customers?page=${lastPage}&limit=${limit}` : null,
        prev: page > 1 ? `/api/app/customers?page=${page - 1}&limit=${limit}` : null,
        next: page < lastPage ? `/api/app/customers?page=${page + 1}&limit=${limit}` : null,
      },
      meta: {
        current_page: page,
        from: startIndex + 1,
        last_page: lastPage,
        links: Array.from({ length: lastPage }, (_, i) => ({
          url: i + 1 === page ? null : `/api/app/customers?page=${i + 1}&limit=${limit}`,
          label: String(i + 1),
          active: i + 1 === page
        })),
        path: "/api/app/customers",
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
  const url = `/api/app/customers${queryString ? `?${queryString}` : ''}`
  
  const res = await axios.get<CustomersResponse>(url)
  return res.data
}

export async function createCustomerApi(payload: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
  if (USE_MOCK) {
    const response = await fetchCustomersApi()
    const nextId = (response.data.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1
    const created: Customer = { 
      id: nextId, 
      ...payload, 
      createdAt: new Date().toISOString() 
    }
    return created
  }
  const res = await axios.post<{success: boolean, message: string, data: Customer}>("/app/customers", payload)
  return res.data.data
}

export async function updateCustomerApi(payload: Customer): Promise<Customer> {
  if (USE_MOCK) {
    return payload
  }
  const res = await axios.put<{success: boolean, message: string, data: Customer}>(`/app/customers/${payload.id}`, payload)
  return res.data.data
}

export async function deleteCustomerApi(id: number): Promise<number> {
  if (USE_MOCK) {
    return id
  }
  await axios.delete(`/app/customers/${id}`)
  return id
}

