"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, ArrowLeft, Edit, Trash, Mail, Phone, Building, Globe, Clock } from "lucide-react"
import PageHeader from "@/components/admin/page-header"
import customersData from "@/data/customers.json"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  company: string
  status: "Active" | "Inactive"
  country: string
  timezone: string
  createdAt: string
  updatedAt: string
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = parseInt(params.id as string)
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find customer by ID
    const foundCustomer = customersData.find(c => c.id === customerId)
    if (foundCustomer) {
      setCustomer(foundCustomer)
    } else {
      // Customer not found, redirect back
      router.push("/admin/customers")
    }
    setLoading(false)
  }, [customerId, router])

  const handleEdit = () => {
    router.push(`/admin/customers/edit/${customerId}`)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this customer?")) {
      // In a real app, this would make an API call
      console.log("Deleting customer:", customerId)
      router.push("/admin/customers")
    }
  }

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      "USA": "🇺🇸",
      "UK": "🇬🇧",
      "Germany": "🇩🇪",
      "France": "🇫🇷",
      "Japan": "🇯🇵",
      "Canada": "🇨🇦",
      "Australia": "🇦🇺",
      "Spain": "🇪🇸",
      "Italy": "🇮🇹",
      "Netherlands": "🇳🇱"
    }
    return flags[country] || "🌍"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading customer...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Customer Not Found</h2>
          <p className="text-muted-foreground mb-4">The customer you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/admin/customers")}>
            Back to Customers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        subtitle="Customer Details"
        breadcrumbs={[
          { label: "Customers", href: "/admin/customers" },
          { label: customer.name }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Profile */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{customer.name}</h3>
                <p className="text-muted-foreground">{customer.company}</p>
                <Badge 
                  variant={customer.status === "Active" ? "default" : "secondary"}
                  className="mt-2"
                >
                  {customer.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleEdit} className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit Customer
              </Button>
              <Button variant="outline" onClick={handleDelete} className="w-full text-destructive hover:text-destructive">
                <Trash className="w-4 h-4 mr-2" />
                Delete Customer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">{customer.company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Country</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCountryFlag(customer.country)}</span>
                      <span className="text-sm text-muted-foreground">{customer.country}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time Zone</p>
                    <p className="text-sm text-muted-foreground">{customer.timezone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Customer created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Last updated</p>
                    <p className="text-xs text-muted-foreground">{formatDate(customer.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push("/admin/customers")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    </div>
  )
}
