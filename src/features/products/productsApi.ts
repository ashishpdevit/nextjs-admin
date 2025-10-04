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

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false"

export async function fetchProductsApi(): Promise<Product[]> {
  if (USE_MOCK) {
    // Simulate latency
    await new Promise((r) => setTimeout(r, 200))
    return mockProducts.map((p) => ({ 
      ...p, 
      status: p.status || "Active",
      image: p.images[0] || "",
    }))
  }
  const res = await axios.get<Product[]>("/api/admin/products")
  return res.data
}

export async function createProductApi(payload: Omit<Product, "id">): Promise<Product> {
  if (USE_MOCK) {
    const list = await fetchProductsApi()
    const nextId = (list.reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1
    const created: Product = { 
      id: nextId, 
      ...payload, 
    }
    return created
  }
  const res = await axios.post<Product>("/api/admin/products", payload)
  return res.data
}

export async function updateProductApi(payload: Product): Promise<Product> {
  if (USE_MOCK) {
    return payload
  }
  const res = await axios.put<Product>(`/api/admin/products/${payload.id}`, payload)
  return res.data
}

export async function deleteProductApi(id: number): Promise<number> {
  if (USE_MOCK) {
    return id
  }
  await axios.delete(`/api/admin/products/${id}`)
  return id
}
