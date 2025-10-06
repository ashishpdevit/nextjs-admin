import { axios } from "@/lib/axios"
import mockProducts from "@/mocks/products.json"

export type Product = {
  id: number
  name: string
  price: number
  inventory: number
  status: "Active" | "Hidden" | string
  category: string
  sku: string
  description: string
  image: string
  brand: string
  barcode: string
  featured: boolean
  images: string[]
  tags: string[]
  variants: any[]
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

export type ProductsResponse = {
  status: boolean
  message: string
  data: Product[]
  links: PaginationLinks
  meta: PaginationMeta
}

export type ProductsParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  status?: string
  category?: string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"

export async function fetchProductsApi(params?: ProductsParams): Promise<ProductsResponse> {
  if (USE_MOCK) {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 200))
    
    let filteredProducts = [...mockProducts]
    
    // Apply search filter
    if (params?.search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        p.description.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    // Apply status filter
    if (params?.status && params.status !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.status === params.status)
    }
    
    // Apply category filter
    if (params?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === params.category)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      filteredProducts.sort((a, b) => {
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
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
    
    const total = filteredProducts.length
    const lastPage = Math.ceil(total / limit)
    
    return {
      status: true,
      message: "Products fetched successfully",
      data: paginatedProducts.map((p) => ({ 
        ...p, 
        status: p.status || "Active",
        image: p.images?.[0] || "",
        variants: p.variants || [],
      })),
      links: {
        first: page > 1 ? `/api/admin/products?page=1&limit=${limit}` : null,
        last: page < lastPage ? `/api/admin/products?page=${lastPage}&limit=${limit}` : null,
        prev: page > 1 ? `/api/admin/products?page=${page - 1}&limit=${limit}` : null,
        next: page < lastPage ? `/api/admin/products?page=${page + 1}&limit=${limit}` : null,
      },
      meta: {
        current_page: page,
        from: startIndex + 1,
        last_page: lastPage,
        links: Array.from({ length: lastPage }, (_, i) => ({
          url: i + 1 === page ? null : `/api/admin/products?page=${i + 1}&limit=${limit}`,
          label: String(i + 1),
          active: i + 1 === page
        })),
        path: "/api/admin/products",
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
  if (params?.category) searchParams.set('category', params.category)
  
  const queryString = searchParams.toString()
  const url = `/api/admin/products${queryString ? `?${queryString}` : ''}`
  
  const res = await axios.get<ProductsResponse>(url)
  return res.data
}

export async function createProductApi(payload: Omit<Product, "id">): Promise<Product> {
  if (USE_MOCK) {
    const response = await fetchProductsApi()
    const nextId = (response.data.reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1
    const created: Product = { 
      id: nextId, 
      ...payload, 
    }
    return created
  }
  const res = await axios.post<{success: boolean, message: string, data: Product}>("/api/admin/products", payload)
  return res.data.data
}

export async function updateProductApi(payload: Product): Promise<Product> {
  if (USE_MOCK) {
    return payload
  }
  const res = await axios.put<{success: boolean, message: string, data: Product}>(`/api/admin/products/${payload.id}`, payload)
  return res.data.data
}

export async function deleteProductApi(id: number): Promise<number> {
  if (USE_MOCK) {
    return id
  }
  await axios.delete(`/api/admin/products/${id}`)
  return id
}
