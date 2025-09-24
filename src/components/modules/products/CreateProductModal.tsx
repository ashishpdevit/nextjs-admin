"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, User } from "lucide-react"
import { Dialog, RightDialogContent, RightDialogHeader, RightDialogTitle } from "@/components/ui/right-dialog"
import { DialogTitle } from "@/components/ui/dialog"
import { PRODUCT_MODAL_CONFIG, PRODUCT_MODAL_CLASSES } from "@/lib/product-modal-config"

interface CreateProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: CreateProductPayload) => void
}

export interface CreateProductPayload {
  name: string
  description: string
  price: number
  inventory: number
  status: "Active" | "Inactive"
  category: string
  sku: string
  image?: string
}

export default function CreateProductModal({ open, onOpenChange, onSave }: CreateProductModalProps) {
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: "",
    description: "",
    price: 0,
    inventory: 0,
    status: "Active",
    category: "",
    sku: "",
    image: ""
  })
  const [errors, setErrors] = useState<any>({})

  const handleInputChange = (field: keyof CreateProductPayload, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value as any }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: any = {}

    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0"
    if (formData.inventory < 0) newErrors.inventory = "Inventory cannot be negative"
    if (!formData.category.trim()) newErrors.category = "Category is required"
    if (!formData.sku.trim()) newErrors.sku = "SKU is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: 0,
        inventory: 0,
        status: "Active",
        category: "",
        sku: "",
        image: ""
      })
      setErrors({})
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      inventory: 0,
      status: "Active",
      category: "",
      sku: "",
      image: ""
    })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RightDialogContent 
        config={PRODUCT_MODAL_CONFIG}
        className={PRODUCT_MODAL_CLASSES.container}
      >
        <RightDialogHeader className={PRODUCT_MODAL_CLASSES.header}>
          <DialogTitle className="text-xl font-semibold">New Product</DialogTitle>
        </RightDialogHeader>
        
        <div className={PRODUCT_MODAL_CLASSES.content}>
          <div className={PRODUCT_MODAL_CLASSES.grid}>
          {/* Left Section - Product Image */}
          <div className={PRODUCT_MODAL_CLASSES.column}>
            <Label className="text-sm font-medium">Product Image</Label>
            <Card className="border-2 border-dashed border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt="Product" 
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
          <div className={PRODUCT_MODAL_CLASSES.column}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter product name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium">
                  SKU *
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="Enter SKU"
                  className={errors.sku ? "border-destructive" : ""}
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter product description"
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Price *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.price ? "border-destructive" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory" className="text-sm font-medium">
                  Inventory *
                </Label>
                <Input
                  id="inventory"
                  type="number"
                  value={formData.inventory}
                  onChange={(e) => handleInputChange("inventory", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.inventory ? "border-destructive" : ""}
                />
                {errors.inventory && (
                  <p className="text-sm text-destructive">{errors.inventory}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="Enter category"
                  className={errors.category ? "border-destructive" : ""}
                />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex justify-end gap-3 ${PRODUCT_MODAL_CLASSES.footer}`}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Create Product
          </Button>
        </div>
      </RightDialogContent>
    </Dialog>
  )
}
