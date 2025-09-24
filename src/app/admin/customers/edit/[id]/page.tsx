"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, User, ArrowLeft } from "lucide-react"
import PageHeader from "@/components/admin/page-header"
import customersData from "@/mocks/customers.json"

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

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = parseInt(params.id as string)
  
  const [formData, setFormData] = useState<Customer>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Active",
    country: "",
    timezone: "",
    createdAt: "",
    updatedAt: ""
  })
  const [errors, setErrors] = useState<Partial<Customer>>({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Find customer by ID
    const customer = customersData.find(c => c.id === customerId)
    if (customer) {
      setFormData(customer)
    } else {
      // Customer not found, redirect back
      router.push("/admin/customers")
    }
    setInitialLoading(false)
  }, [customerId, router])

  const handleInputChange = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Customer> = {}

    if (!formData.name.trim()) newErrors.name = "Full name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.company.trim()) newErrors.company = "Company name is required"
    if (!formData.country.trim()) newErrors.country = "Country is required"
    if (!formData.timezone.trim()) newErrors.timezone = "Time zone is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // In a real app, this would make an API call
      console.log("Updating customer:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect back to customers list
      router.push("/admin/customers")
    } catch (error) {
      console.error("Error updating customer:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/customers")
  }

  const countries = [
    { value: "USA", label: "United States", flag: "🇺🇸" },
    { value: "UK", label: "United Kingdom", flag: "🇬🇧" },
    { value: "Germany", label: "Germany", flag: "🇩🇪" },
    { value: "France", label: "France", flag: "🇫🇷" },
    { value: "Japan", label: "Japan", flag: "🇯🇵" },
    { value: "Canada", label: "Canada", flag: "🇨🇦" },
    { value: "Australia", label: "Australia", flag: "🇦🇺" },
    { value: "Spain", label: "Spain", flag: "🇪🇸" },
    { value: "Italy", label: "Italy", flag: "🇮🇹" },
    { value: "Netherlands", label: "Netherlands", flag: "🇳🇱" }
  ]

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Europe/Berlin", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" }
  ]

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading customer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Customer"
        subtitle={`Editing ${formData.name}`}
        breadcrumbs={[
          { label: "Customers", href: "/admin/customers" },
          { label: formData.name, href: `/admin/customers/${formData.id}` },
          { label: "Edit" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Profile Picture */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Profile Picture</Label>
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                {formData.image ? (
                  <img 
                    src={formData.image} 
                    alt="Customer" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <User className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG up to 2MB
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <div className="flex gap-2">
                    <Select className="w-24">
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+49">+49</option>
                      <option value="+33">+33</option>
                      <option value="+81">+81</option>
                    </Select>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                      className={errors.phone ? "border-destructive" : ""}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status *</Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value as "Active" | "Inactive")}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">
                  Company Name *
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  placeholder="Enter company name"
                  className={errors.company ? "border-destructive" : ""}
                />
                {errors.company && (
                  <p className="text-sm text-destructive">{errors.company}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Country *</Label>
                  <Select
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.flag} {country.label}
                      </option>
                    ))}
                  </Select>
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Time Zone *</Label>
                  <Select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange("timezone", e.target.value)}
                  >
                    <option value="">Select Time Zone</option>
                    {timezones.map((timezone) => (
                      <option key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </option>
                    ))}
                  </Select>
                  {errors.timezone && (
                    <p className="text-sm text-destructive">{errors.timezone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
        <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
          {loading ? "Updating..." : "Update Customer"}
        </Button>
      </div>
    </div>
  )
}
