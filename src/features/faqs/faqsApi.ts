import { axios } from "@/lib/axios"
import defaults from "@/mocks/faqs.json"

export type Faq = {
  id: number
  question: Record<string, string>
  answer: Record<string, string>
  type: "web" | "user_app"
  status: string
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface PaginationMeta {
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

export interface FaqsResponse {
  status: boolean
  message: string
  data: Faq[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface FaqsParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  status?: string
  type?: string
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

export async function fetchFaqsApi(params?: FaqsParams): Promise<FaqsResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    let filteredFaqs = [...readMock()]
    
    // Apply search filter
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredFaqs = filteredFaqs.filter(faq => 
        Object.values(faq.question).some(q => q.toLowerCase().includes(searchLower)) ||
        Object.values(faq.answer).some(a => a.toLowerCase().includes(searchLower))
      )
    }
    
    // Apply status filter
    if (params?.status && params.status !== 'all') {
      filteredFaqs = filteredFaqs.filter(faq => faq.status === params.status)
    }
    
    // Apply type filter
    if (params?.type && params.type !== 'all') {
      filteredFaqs = filteredFaqs.filter(faq => faq.type === params.type)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      filteredFaqs.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (params.sortBy) {
          case 'id':
            aValue = a.id
            bValue = b.id
            break
          case 'status':
            aValue = a.status
            bValue = b.status
            break
          case 'type':
            aValue = a.type
            bValue = b.type
            break
          default:
            aValue = a.id
            bValue = b.id
        }
        
        if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }
    
    // Apply pagination
    const page = params?.page || 1
    const limit = params?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFaqs = filteredFaqs.slice(startIndex, endIndex)
    const total = filteredFaqs.length
    const lastPage = Math.ceil(total / limit)
    
    return {
      status: true,
      message: "FAQs fetched successfully",
      data: paginatedFaqs,
      links: {
        first: page === 1 ? null : `/api/admin/faqs?page=1&limit=${limit}`,
        last: page === lastPage ? null : `/api/admin/faqs?page=${lastPage}&limit=${limit}`,
        prev: page === 1 ? null : `/api/admin/faqs?page=${page - 1}&limit=${limit}`,
        next: page === lastPage ? null : `/api/admin/faqs?page=${page + 1}&limit=${limit}`
      },
      meta: {
        current_page: page,
        from: startIndex + 1,
        last_page: lastPage,
        links: Array.from({ length: lastPage }, (_, i) => ({
          url: i + 1 === page ? null : `/api/admin/faqs?page=${i + 1}&limit=${limit}`,
          label: String(i + 1),
          active: i + 1 === page
        })),
        path: "/api/admin/faqs",
        per_page: limit,
        to: Math.min(endIndex, total),
        total
      }
    }
  }
  
  try {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.type) searchParams.append('type', params.type)
    
    const { data } = await axios.get<FaqsResponse>(`/api/admin/faqs?${searchParams.toString()}`)
    return data
  } catch (error) {
    console.error("Failed to fetch faqs:", error)
    throw error
  }
}

export async function createFaqApi(payload: Omit<Faq, "id">): Promise<Faq> {
  if (USE_MOCK) {
    const list = readMock()
    const nextId = (list.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1
    const created: Faq = { id: nextId, ...payload }
    writeMock([created, ...list])
    return created
  }
  const res = await axios.post<{success: boolean, message: string, data: Faq}>("/api/admin/faqs", payload)
  return res.data.data
}

export async function updateFaqApi(payload: Faq): Promise<Faq> {
  if (USE_MOCK) {
    const list = readMock().map((f) => (f.id === payload.id ? payload : f))
    writeMock(list)
    return payload
  }
  const res = await axios.put<{success: boolean, message: string, data: Faq}>(`/api/admin/faqs/${payload.id}`, payload)
  return res.data.data
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

