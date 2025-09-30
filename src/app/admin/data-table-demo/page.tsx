"use client"

import React, { useState } from "react"
import { DataTableCard, createTextColumn, createNumberColumn, createBadgeColumn, createStatusColumn } from "@/components/ui/data-table-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Pencil, Trash, Plus, Download } from "lucide-react"
import type { ColumnDef } from "@/components/ui/data-table"

// Sample data types
interface Product {
  id: number
  name: string
  price: number
  status: "active" | "inactive"
  category: string
  inventory: number
  sku: string
}

interface Customer {
  id: number
  name: string
  email: string
  status: "active" | "inactive"
  orders: number
  totalSpent: number
  joinDate: string
}

interface Faq {
  id: number
  type: string
  question: string
  answer: string
  status: "published" | "draft"
  language: string
}

// Sample data
const sampleProducts: Product[] = [
  { id: 1, name: "Wireless Headphones", price: 99.99, status: "active", category: "Electronics", inventory: 50, sku: "WH-001" },
  { id: 2, name: "Smart Watch", price: 299.99, status: "active", category: "Electronics", inventory: 25, sku: "SW-002" },
  { id: 3, name: "Coffee Maker", price: 149.99, status: "inactive", category: "Appliances", inventory: 0, sku: "CM-003" },
  { id: 4, name: "Laptop Stand", price: 49.99, status: "active", category: "Accessories", inventory: 100, sku: "LS-004" },
  { id: 5, name: "USB Cable", price: 19.99, status: "active", category: "Accessories", inventory: 200, sku: "UC-005" },
  { id: 6, name: "Bluetooth Speaker", price: 79.99, status: "active", category: "Electronics", inventory: 75, sku: "BS-006" },
  { id: 7, name: "Phone Case", price: 29.99, status: "inactive", category: "Accessories", inventory: 0, sku: "PC-007" },
  { id: 8, name: "Wireless Mouse", price: 39.99, status: "active", category: "Accessories", inventory: 150, sku: "WM-008" },
]

const sampleCustomers: Customer[] = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active", orders: 5, totalSpent: 450.00, joinDate: "2024-01-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "active", orders: 3, totalSpent: 299.99, joinDate: "2024-02-20" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "inactive", orders: 1, totalSpent: 99.99, joinDate: "2024-03-10" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", status: "active", orders: 8, totalSpent: 750.50, joinDate: "2024-01-05" },
  { id: 5, name: "Charlie Wilson", email: "charlie@example.com", status: "active", orders: 2, totalSpent: 159.98, joinDate: "2024-04-12" },
  { id: 6, name: "Diana Davis", email: "diana@example.com", status: "inactive", orders: 0, totalSpent: 0, joinDate: "2024-03-25" },
]

const sampleFaqs: Faq[] = [
  { id: 1, type: "General", question: "How do I reset my password?", answer: "Click on the 'Forgot Password' link on the login page and follow the instructions.", status: "published", language: "en" },
  { id: 2, type: "Billing", question: "How can I cancel my subscription?", answer: "Go to your account settings and click on the 'Subscription' tab to manage your subscription.", status: "published", language: "en" },
  { id: 3, type: "Technical", question: "What browsers are supported?", answer: "We support all modern browsers including Chrome, Firefox, Safari, and Edge.", status: "published", language: "en" },
  { id: 4, type: "General", question: "How do I contact customer support?", answer: "You can reach our customer support team through the contact form or email us directly.", status: "draft", language: "en" },
  { id: 5, type: "Billing", question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and bank transfers.", status: "published", language: "en" },
]

export default function DataTableDemoPage() {
  const [products, setProducts] = useState(sampleProducts)
  const [customers, setCustomers] = useState(sampleCustomers)
  const [faqs, setFaqs] = useState(sampleFaqs)
  const [selectedProducts, setSelectedProducts] = useState<(string | number)[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<(string | number)[]>([])
  const [selectedFaqs, setSelectedFaqs] = useState<(string | number)[]>([])
  const [activeTab, setActiveTab] = useState("products")

  // Product columns
  const productColumns: ColumnDef<Product>[] = [
    createNumberColumn("id", "ID", "id", { width: "80px" }),
    createTextColumn("name", "Name", "name"),
    createTextColumn("sku", "SKU", "sku", { width: "120px" }),
    createTextColumn("category", "Category", "category", { width: "120px" }),
    {
      id: "price",
      header: "Price",
      accessorKey: "price",
      sortable: true,
      cell: ({ value }) => `$${value.toFixed(2)}`,
      width: "100px",
    },
    {
      id: "inventory",
      header: "Inventory",
      accessorKey: "inventory",
      sortable: true,
      cell: ({ value }) => (
        <Badge variant={value > 10 ? "default" : value > 0 ? "secondary" : "destructive"}>
          {value}
        </Badge>
      ),
      width: "100px",
    },
    createStatusColumn("status", "Status", "status", { width: "100px" }),
  ]

  // Customer columns
  const customerColumns: ColumnDef<Customer>[] = [
    createNumberColumn("id", "ID", "id", { width: "80px" }),
    createTextColumn("name", "Name", "name"),
    createTextColumn("email", "Email", "email"),
    createNumberColumn("orders", "Orders", "orders", { width: "100px" }),
    {
      id: "totalSpent",
      header: "Total Spent",
      accessorKey: "totalSpent",
      sortable: true,
      cell: ({ value }) => `$${value.toFixed(2)}`,
      width: "120px",
    },
    createStatusColumn("status", "Status", "status", { width: "100px" }),
    {
      id: "joinDate",
      header: "Join Date",
      accessorKey: "joinDate",
      sortable: true,
      cell: ({ value }) => new Date(value).toLocaleDateString(),
      width: "120px",
    },
  ]

  // FAQ columns
  const faqColumns: ColumnDef<Faq>[] = [
    createNumberColumn("id", "ID", "id", { width: "80px" }),
    createBadgeColumn("type", "Type", "type", { width: "100px" }),
    {
      id: "question",
      header: "Question",
      accessorKey: "question",
      sortable: true,
      cell: ({ value }) => (
        <div className="max-w-[300px] truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      id: "answer",
      header: "Answer",
      accessorKey: "answer",
      sortable: false,
      cell: ({ value }) => (
        <div className="max-w-[400px] truncate text-muted-foreground" title={value}>
          {value}
        </div>
      ),
    },
    createStatusColumn("status", "Status", "status", { width: "100px" }),
    createTextColumn("language", "Language", "language", { width: "80px" }),
  ]

  // Action handlers
  const handleEditProduct = (product: Product) => {
    console.log("Edit product:", product)
  }

  const handleDeleteProduct = (product: Product) => {
    setProducts(prev => prev.filter(p => p.id !== product.id))
  }

  const handleViewProduct = (product: Product) => {
    console.log("View product:", product)
  }

  const handleEditCustomer = (customer: Customer) => {
    console.log("Edit customer:", customer)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomers(prev => prev.filter(c => c.id !== customer.id))
  }

  const handleEditFaq = (faq: Faq) => {
    console.log("Edit FAQ:", faq)
  }

  const handleDeleteFaq = (faq: Faq) => {
    setFaqs(prev => prev.filter(f => f.id !== faq.id))
  }

  const handleCreateProduct = () => {
    console.log("Create new product")
  }

  const handleExportProducts = () => {
    console.log("Export products:", selectedProducts)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">DataTable Component Demo</h1>
        <p className="text-muted-foreground">
          A comprehensive, reusable table component with sorting, pagination, selection, and actions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <h4 className="font-medium">Sorting</h4>
              <p className="text-sm text-muted-foreground">Click headers to sort</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Pagination</h4>
              <p className="text-sm text-muted-foreground">Configurable page sizes</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Selection</h4>
              <p className="text-sm text-muted-foreground">Row and bulk selection</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">Actions</h4>
              <p className="text-sm text-muted-foreground">Custom action buttons</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex space-x-1 border-b">
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            onClick={() => setActiveTab("products")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Products
          </Button>
          <Button
            variant={activeTab === "customers" ? "default" : "ghost"}
            onClick={() => setActiveTab("customers")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Customers
          </Button>
          <Button
            variant={activeTab === "faqs" ? "default" : "ghost"}
            onClick={() => setActiveTab("faqs")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            FAQs
          </Button>
        </div>

        {activeTab === "products" && (
          <DataTableCard
            title="Products"
            subtitle="Manage your product inventory with full CRUD operations"
            headerActions={
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportProducts}
                  disabled={selectedProducts.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export ({selectedProducts.length})
                </Button>
                <Button size="sm" onClick={handleCreateProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </>
            }
            data={products}
            columns={productColumns}
            selectable
            onSelectionChange={setSelectedProducts}
            actions={{
              items: [
                {
                  label: "View",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: handleViewProduct,
                  variant: "ghost",
                },
                {
                  label: "Edit",
                  icon: <Pencil className="h-4 w-4" />,
                  onClick: handleEditProduct,
                },
                {
                  label: "Delete",
                  icon: <Trash className="h-4 w-4" />,
                  onClick: handleDeleteProduct,
                  variant: "destructive",
                  disabled: (row) => row.inventory > 0,
                },
              ],
            }}
            emptyMessage="No products found"
          />
        )}

        {activeTab === "customers" && (
          <DataTableCard
            title="Customers"
            subtitle="Customer management and analytics"
            data={customers}
            columns={customerColumns}
            selectable
            onSelectionChange={setSelectedCustomers}
            actions={{
              items: [
                {
                  label: "Edit",
                  icon: <Pencil className="h-4 w-4" />,
                  onClick: handleEditCustomer,
                },
                {
                  label: "Delete",
                  icon: <Trash className="h-4 w-4" />,
                  onClick: handleDeleteCustomer,
                  variant: "destructive",
                },
              ],
            }}
          />
        )}

        {activeTab === "faqs" && (
          <DataTableCard
            title="FAQs"
            subtitle="Frequently asked questions management"
            data={faqs}
            columns={faqColumns}
            selectable
            onSelectionChange={setSelectedFaqs}
            actions={{
              items: [
                {
                  label: "Edit",
                  icon: <Pencil className="h-4 w-4" />,
                  onClick: handleEditFaq,
                },
                {
                  label: "Delete",
                  icon: <Trash className="h-4 w-4" />,
                  onClick: handleDeleteFaq,
                  variant: "destructive",
                },
              ],
            }}
          />
        )}
      </div>
    </div>
  )
}
