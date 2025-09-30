"use client"

import React, { useState, useMemo } from "react"
import { DataTableCard, createTextColumn, createNumberColumn, createBadgeColumn, createStatusColumn, createCustomColumn } from "@/components/ui/data-table-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Eye, Pencil, Trash, Plus } from "lucide-react"
import type { ColumnDef } from "@/components/ui/data-table"

// Example data types
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

// Example data
const sampleProducts: Product[] = [
  { id: 1, name: "Wireless Headphones", price: 99.99, status: "active", category: "Electronics", inventory: 50, sku: "WH-001" },
  { id: 2, name: "Smart Watch", price: 299.99, status: "active", category: "Electronics", inventory: 25, sku: "SW-002" },
  { id: 3, name: "Coffee Maker", price: 149.99, status: "inactive", category: "Appliances", inventory: 0, sku: "CM-003" },
]

const sampleCustomers: Customer[] = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "active", orders: 5, totalSpent: 450.00, joinDate: "2024-01-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "active", orders: 3, totalSpent: 299.99, joinDate: "2024-02-20" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "inactive", orders: 1, totalSpent: 99.99, joinDate: "2024-03-10" },
]

const sampleFaqs: Faq[] = [
  { id: 1, type: "General", question: "How do I reset my password?", answer: "Click on forgot password link...", status: "published", language: "en" },
  { id: 2, type: "Billing", question: "How can I cancel my subscription?", answer: "Go to your account settings...", status: "published", language: "en" },
  { id: 3, type: "Technical", question: "What browsers are supported?", answer: "We support all modern browsers...", status: "draft", language: "en" },
]

export function ProductsTableExample() {
  const [products, setProducts] = useState(sampleProducts)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                           product.sku.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || product.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [products, search, statusFilter])

  const columns: ColumnDef<Product>[] = [
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

  const handleEdit = (product: Product) => {
    console.log("Edit product:", product)
  }

  const handleDelete = (product: Product) => {
    setProducts(prev => prev.filter(p => p.id !== product.id))
  }

  const handleView = (product: Product) => {
    console.log("View product:", product)
  }

  const handleCreate = () => {
    console.log("Create new product")
  }

  return (
    <DataTableCard
      title="Products"
      subtitle="Manage your product inventory"
      headerActions={
        <>
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </>
      }
      data={filteredProducts}
      columns={columns}
      selectable
      onSelectionChange={(selectedIds) => console.log("Selected:", selectedIds)}
      actions={{
        items: [
          {
            label: "View",
            icon: <Eye className="h-4 w-4" />,
            onClick: handleView,
            variant: "ghost",
          },
          {
            label: "Edit",
            icon: <Pencil className="h-4 w-4" />,
            onClick: handleEdit,
            variant: "ghost",
          },
          {
            label: "Delete",
            icon: <Trash className="h-4 w-4" />,
            onClick: handleDelete,
            variant: "ghost",
            disabled: (row) => row.inventory > 0,
          },
        ],
      }}
      emptyMessage="No products found"
    />
  )
}

export function CustomersTableExample() {
  const [customers, setCustomers] = useState(sampleCustomers)

  const columns: ColumnDef<Customer>[] = [
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

  const handleEdit = (customer: Customer) => {
    console.log("Edit customer:", customer)
  }

  const handleDelete = (customer: Customer) => {
    setCustomers(prev => prev.filter(c => c.id !== customer.id))
  }

  return (
    <DataTableCard
      title="Customers"
      subtitle="Customer management and analytics"
      data={customers}
      columns={columns}
      selectable
      actions={{
        items: [
          {
            label: "Edit",
            icon: <Pencil className="h-4 w-4" />,
            onClick: handleEdit,
          },
          {
            label: "Delete",
            icon: <Trash className="h-4 w-4" />,
            onClick: handleDelete,
            variant: "destructive",
          },
        ],
      }}
    />
  )
}

export function FaqsTableExample() {
  const [faqs, setFaqs] = useState(sampleFaqs)

  const columns: ColumnDef<Faq>[] = [
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

  const handleEdit = (faq: Faq) => {
    console.log("Edit FAQ:", faq)
  }

  const handleDelete = (faq: Faq) => {
    setFaqs(prev => prev.filter(f => f.id !== faq.id))
  }

  return (
    <DataTableCard
      title="FAQs"
      subtitle="Frequently asked questions"
      data={faqs}
      columns={columns}
      selectable
      actions={{
        items: [
          {
            label: "Edit",
            icon: <Pencil className="h-4 w-4" />,
            onClick: handleEdit,
          },
          {
            label: "Delete",
            icon: <Trash className="h-4 w-4" />,
            onClick: handleDelete,
            variant: "destructive",
          },
        ],
      }}
    />
  )
}
