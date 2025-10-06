import { axios } from "@/lib/axios"
import mockAdmins from "@/mocks/admins.json"

export type Admin = {
  id: number
  name: string
  email: string
  role: string
  status: "Active" | "Inactive" | string
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

export type AdminsResponse = {
  status: boolean
  message: string
  data: Admin[]
  links: PaginationLinks
  meta: PaginationMeta
}

export type AdminsParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  status?: string
  role?: string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"

export async function fetchAdminsApi(params?: AdminsParams): Promise<AdminsResponse> {
  if (USE_MOCK) {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 200))
    
    let filteredAdmins = [...mockAdmins]
    
    // Apply search filter
    if (params?.search) {
      filteredAdmins = filteredAdmins.filter(a => 
        a.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        a.email.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    // Apply status filter
    if (params?.status && params.status !== 'all') {
      filteredAdmins = filteredAdmins.filter(a => a.status === params.status)
    }
    
    // Apply role filter
    if (params?.role && params.role !== 'all') {
      filteredAdmins = filteredAdmins.filter(a => a.role === params.role)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      filteredAdmins.sort((a, b) => {
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
    const paginatedAdmins = filteredAdmins.slice(startIndex, endIndex)
    
    const total = filteredAdmins.length
    const lastPage = Math.ceil(total / limit)
    
    return {
      status: true,
      message: "Admins fetched successfully",
      data: paginatedAdmins.map((u) => ({ 
        ...u, 
        status: u.status === "Suspended" ? "Inactive" : (u.status as any) 
      })),
      links: {
        first: page > 1 ? `/api/admin/users?page=1&limit=${limit}` : null,
        last: page < lastPage ? `/api/admin/users?page=${lastPage}&limit=${limit}` : null,
        prev: page > 1 ? `/api/admin/users?page=${page - 1}&limit=${limit}` : null,
        next: page < lastPage ? `/api/admin/users?page=${page + 1}&limit=${limit}` : null,
      },
      meta: {
        current_page: page,
        from: startIndex + 1,
        last_page: lastPage,
        links: Array.from({ length: lastPage }, (_, i) => ({
          url: i + 1 === page ? null : `/api/admin/users?page=${i + 1}&limit=${limit}`,
          label: String(i + 1),
          active: i + 1 === page
        })),
        path: "/api/admin/users",
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
  if (params?.role && params.role !== 'all') searchParams.set('role', params.role)
  
  const queryString = searchParams.toString()
  const url = `/api/admin/users${queryString ? `?${queryString}` : ''}`
  
  const res = await axios.get<AdminsResponse>(url)
  return res.data
}
