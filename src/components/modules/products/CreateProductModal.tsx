"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, User } from "lucide-react"
import { Dialog, RightDialogContent, RightDialogHeader, RightDialogTitle } from "@/components/ui/right-dialog"
import { DialogTitle } from "@/components/ui/dialog"
import { PRODUCT_MODAL_CONFIG, PRODUCT_MODAL_CLASSES } from "@/lib/product-modal-config"
import { toast } from "sonner"

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
  images?: string[]
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
    image: "",
    images: []
  })
  const [errors, setErrors] = useState<any>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

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
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('inventory', formData.inventory.toString())
      formDataToSend.append('status', formData.status)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('sku', formData.sku)
      
      // Append image files if selected (support multiple images)
      // API expects 'images' key (not 'images[]') for multiple files
      selectedFiles.forEach((file) => {
        formDataToSend.append('images', file)
      })
      
      // Pass FormData to onSave
      onSave(formDataToSend as any)
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: 0,
        inventory: 0,
        status: "Active",
        category: "",
        sku: "",
        // image: "",
        images: []
      })
      setSelectedFiles([])
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
      // image: "",
      images: []
    })
    setSelectedFiles([])
    setErrors({})
    onOpenChange(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newImages: string[] = []
      const validFiles: File[] = []
      let processedCount = 0
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      Array.from(files).forEach((file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`)
          return
        }
        // Validate file size
        if (file.size > maxSize) {
          toast.error(`${file.name} is larger than 5MB`)
          return
        }
        // Store file for FormData submission
        validFiles.push(file)
        // Create preview URL
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          processedCount++
          if (processedCount === files.length) {
            setSelectedFiles(prev => [...prev, ...validFiles])
            setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), ...newImages],
              // image: newImages[0] || prev.image // Set first image as main image
            }))
            toast.success(`${newImages.length} image(s) uploaded successfully`)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
      // image: index === 0 && prev.images && prev.images.length > 1 ? prev.images[1] : (index === 0 ? "" : prev.image)
    }))
    // Also remove from selectedFiles
    if (index < selectedFiles.length) {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }
    toast.success('Image removed')
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
          {/* Left Section - Product Images */}
          <div className={PRODUCT_MODAL_CLASSES.column}>
            <Label className="text-sm font-medium">Product Images</Label>
            <Card className="border-2 border-dashed border-muted-foreground/25">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Images Grid */}
                  {formData.images && formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                          <img 
                            src={image} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            type="button"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                      <User className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" onClick={handleUploadClick} type="button" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    {formData.images && formData.images.length > 0 ? 'Add More Images' : 'Upload Images'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    JPG, PNG up to 5MB each. First image will be used as main image.
                  </p>
                </div>
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
