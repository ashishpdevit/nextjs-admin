"use client"
import { useEffect, useMemo, useState, Suspense, useCallback, useRef } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useSmartEffect } from "@/hooks/use-smart-effect"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { FiltersBar } from "@/components/admin/filters"
import { Eye, Pencil, Trash } from "lucide-react"
import { exportCsv } from "@/lib/utils"
import PageHeader from "@/components/admin/page-header"
import { LazyTableCard } from "@/components/LazyLoading"
import CreateProductModal, { CreateProductPayload } from "@/components/modules/products/CreateProductModal"
import EditProductModal from "@/components/modules/products/EditProductModal"
import ProductViewModal from "@/components/modules/products/ProductViewModal"
import { useConfirm } from "@/components/ConfirmDialog"
import { Toaster, toast } from 'sonner';
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProducts, selectProducts, selectProductsLoading, toggleStatus, removeProduct, createProduct, updateProduct } from "@/store/products"
import { selectProductsPagination, selectProductsLinks } from "@/features/products/productsSlice"
import { TableLoadingState, TableEmptyState } from "@/components/ui/table-states"



export default function ProductsPage() {
  const confirm = useConfirm()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [category, setCategory] = useState("")
  const [sortKey, setSortKey] = useState<"id" | "name" | "price" | "inventory" | "status">("id")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<number[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [viewingProduct, setViewingProduct] = useState<any | null>(null)
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectProducts)
  const loading = useAppSelector(selectProductsLoading)
  const pagination = useAppSelector(selectProductsPagination)
  const links = useAppSelector(selectProductsLinks)
  // Debounce search query to prevent excessive API calls
  const debouncedQ = useDebounce(q, 500)

  // Create a stable reference for the search parameters
  const searchParams = useMemo(() => ({
    page,
    limit: pageSize,
    sortBy: sortKey,
    sortOrder: sortDir,
    search: debouncedQ || undefined,
    status: status !== 'all' ? status : undefined,
    category: category || undefined,
  }), [page, pageSize, sortKey, sortDir, debouncedQ, status, category])

  // Smart effect that prevents double calls but allows parameter changes
  useEffect(() => {
    dispatch(fetchProducts(searchParams))
  }, [dispatch, searchParams])

  // Data is already filtered, sorted, and paginated by the backend
  const total = pagination?.total || 0
  const paged = data || []

  const allVisibleSelected = paged.every((p) => selected.includes(p.id))
  const toggleAllVisible = (checked: boolean) => {
    if (checked) setSelected(Array.from(new Set([...selected, ...paged.map((p) => p.id)])))
    else setSelected(selected.filter((id) => !paged.some((p) => p.id === id)))
  }

  const handleCreateProduct = (productData: CreateProductPayload) => {
    // Create new product object
    const newProduct = {
      name: productData.name,
      price: productData.price,
      inventory: productData.inventory,
      status: productData.status,
      category: productData.category,
      sku: productData.sku,
      description: productData.description,
      image: productData.image || "",
      brand: "",
      barcode: "",
      featured: false,
      images: [],
      tags: [],
      variants: []
    }
    
    // Dispatch to Redux store
    dispatch(createProduct(newProduct))
    
    // Show success message
    toast.success("Product created successfully")
    
    // Close modal
    setShowCreateModal(false)
    
    // Refresh the data
        dispatch(fetchProducts({
          page: 1,
          limit: pageSize,
          sortBy: sortKey,
          sortOrder: sortDir,
          search: debouncedQ || undefined,
          status: status !== 'all' ? status : undefined,
          category: category || undefined,
        }))
  }

  const handleViewProduct = (product: any) => {
    setViewingProduct(product)
    setShowViewModal(true)
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setShowEditModal(true)
  }

  const handleUpdateProduct = (updatedProduct: any) => {
    // Dispatch to Redux store
    dispatch(updateProduct(updatedProduct))
    
    // Show success message
    toast.success("Product updated successfully")
    
    // Close modal
    setShowEditModal(false)
    setEditingProduct(null)
    
    // Refresh the data
        dispatch(fetchProducts({
          page: 1,
          limit: pageSize,
          sortBy: sortKey,
          sortOrder: sortDir,
          search: debouncedQ || undefined,
          status: status !== 'all' ? status : undefined,
          category: category || undefined,
        }))
  }

  const handleDeleteProduct = async (id: number) => {
    const product = data?.find(p => p.id === id)
    const ok = await confirm({ 
      title: "Delete Product", 
      description: `Are you sure you want to delete ${product?.name}? This action cannot be undone.`, 
      confirmText: "Delete", 
      variant: "destructive" 
    })
    if (ok) { 
      dispatch(removeProduct(id))
      toast.success("Product deleted successfully")
      
      // Refresh the data
        dispatch(fetchProducts({
          page: 1,
          limit: pageSize,
          sortBy: sortKey,
          sortOrder: sortDir,
          search: debouncedQ || undefined,
          status: status !== 'all' ? status : undefined,
          category: category || undefined,
        }))
    }
  }

  return (
    <div className="space-y-3">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">Products</h2>
          <p className="mt-1 text-xs text-muted-foreground">{total} products found</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            const rows = paged
            const cols = ["id", "name", "price", "inventory", "status"]
            exportCsv("products.csv", rows, cols)
          }}>Export</Button>
          <Button onClick={() => setShowCreateModal(true)}>New</Button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title">Products</div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search products" 
              value={q} 
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1) // Reset to first page when searching
              }} 
              className="h-9 w-56 md:w-72" 
            />
          </div>
        </div>
        <div className="px-2 py-2">
          <FiltersBar id="products" values={{ status, category }} onLoadPreset={() => { }}>
            <span />
            <span />
            <Select data-below value={status} onChange={(e) => {
              setStatus(e.target.value)
              setPage(1) // Reset to first page when filtering
            }}>
              <option value="all">All status</option>
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
            </Select>
            <Select data-below value={category} onChange={(e) => {
              setCategory(e.target.value)
              setPage(1) // Reset to first page when filtering
            }}>
              <option value="">All categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Home">Home</option>
            </Select>
          </FiltersBar>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
            <div>{selected.length} selected</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                  onClick={() => {
                    const rows = data?.filter((p) => selected.includes(p.id)) || []
                    const header = ["id", "name", "price", "inventory", "status"]
                    const csv = [header.join(","), ...rows.map((r) => header.map((h) => (r as any)[h]).join(","))].join("\n")
                    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "products.csv"
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
              >
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => setSelected([])}>Clear</Button>
            </div>
          </div>
        )}

        {loading ? (
          <TableLoadingState message="Loading products..." />
        ) : paged.length === 0 ? (
          <TableEmptyState 
            title="No products found"
            message="Try adjusting your search or filter criteria to find what you're looking for."
          />
        ) : (
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox checked={allVisibleSelected} onChange={(e) => toggleAllVisible(e.currentTarget.checked)} />
                </TableHead>
                {[
                  ["id", "ID"],
                  ["name", "Name"],
                  ["price", "Price"],
                  ["inventory", "Inventory"],
                  ["status", "Status"],
                  ["action", "Action"],
                ].map(([key, label]) => (
                  <TableHead
                    key={key}
                    onClick={() => {
                      const k = key as typeof sortKey
                      if (sortKey === k) {
                        setSortDir(sortDir === "asc" ? "desc" : "asc")
                      } else {
                        setSortKey(k)
                        setSortDir("asc")
                      }
                      setPage(1) // Reset to first page when sorting changes
                    }}
                    className={"cursor-pointer select-none" + (key === "price" ? " text-right" : "")}
                  >
                    {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(p.id)}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked
                        setSelected((prev) => checked ? [...prev, p.id] : prev.filter((id) => id !== p.id))
                      }}
                    />
                  </TableCell>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-right">${p.price.toFixed(2)}</TableCell>
                  <TableCell>{p.inventory}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "Active" ? "default" : "secondary"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="outline" size="sm" title="View" onClick={() => handleViewProduct(p)}>
                      <Eye size={14} />
                    </Button>
                    <Button variant="outline" size="sm" title="Edit" onClick={() => handleEditProduct(p)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="outline" size="sm" title="Delete" onClick={() => handleDeleteProduct(p.id)}>
                      <Trash size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!loading && paged.length > 0 && (
          <Pagination
            page={pagination?.current_page || 1}
            total={pagination?.total || 0}
            pageSize={pagination?.per_page || 10}
            onChange={(newPage) => { setPage(newPage) }}
            showPageSize
            onPageSizeChange={(n) => { setPageSize(n); setPage(1) }}
          />
        )}
      </div>

      {/* Modals */}
      <CreateProductModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSave={handleCreateProduct}
      />

      <ProductViewModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        product={viewingProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      <EditProductModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        product={editingProduct}
        onSave={handleUpdateProduct}
      />
    </div>
  )
}
