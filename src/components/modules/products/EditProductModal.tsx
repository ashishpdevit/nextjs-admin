"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, User, X, Plus, Edit, Trash, Settings } from "lucide-react"
import { Dialog, RightDialogContent, RightDialogHeader, RightDialogTitle } from "@/components/ui/right-dialog"
import { DialogTitle } from "@/components/ui/dialog"
import { PRODUCT_MODAL_CONFIG, PRODUCT_MODAL_CLASSES } from "@/lib/product-modal-config"

interface ProductVariant {
  id?: number
  size: string
  color: string
  price: number
  available: boolean
  onHand: number
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  inventory: number
  status: "Active" | "Inactive" | "Published" | "Draft"
  category: string
  brand?: string
  sku: string
  barcode?: string
  image?: string
  images?: string[]
  tags?: string[]
  variants?: ProductVariant[]
  featured?: boolean
}

interface EditProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: (product: Product) => void
}

export default function EditProductModal({ open, onOpenChange, product, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<Product>({
    id: 0,
    name: "",
    description: "",
    price: 0,
    inventory: 0,
    status: "Published",
    category: "",
    brand: "",
    sku: "",
    barcode: "",
    image: "",
    images: [],
    tags: [],
    variants: [],
    featured: false
  })
  const [errors, setErrors] = useState<any>({})
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        images: product.images || [],
        tags: product.tags || [],
        variants: product.variants || [],
        featured: product.featured || false
      })
    }
  }, [product])

  const handleInputChange = (field: keyof Product, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now(),
      size: "",
      color: "",
      price: formData.price,
      available: true,
      onHand: 0
    }
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }))
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      ) || []
    }))
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index) || []
    }))
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
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    if (product) {
      setFormData({
        ...product,
        images: product.images || [],
        tags: product.tags || [],
        variants: product.variants || [],
        featured: product.featured || false
      })
    }
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RightDialogContent 
        config={PRODUCT_MODAL_CONFIG}
        className={PRODUCT_MODAL_CLASSES.container}
      >
        {/* Sticky Header */}
        <div className={`flex items-center justify-between ${PRODUCT_MODAL_CLASSES.header}`}>
          <div className="flex items-center gap-4">
            <DialogTitle className="text-2xl font-semibold">Edit Product</DialogTitle>
            <Select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value as any)}
              className="w-32"
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
                </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
                </Button>
          </div>
          </div>

        {/* Scrollable Main Content */}
        <div className={PRODUCT_MODAL_CLASSES.content}>
          <div className={PRODUCT_MODAL_CLASSES.grid}>
            {/* Left Column - Form Fields */}
            <div className={PRODUCT_MODAL_CLASSES.column}>
              {/* Basic Info Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Basic Info</CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="featured" className="text-sm">Featured</Label>
                      <input
                        id="featured"
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => handleInputChange("featured", e.target.checked)}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                      Product Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Product Name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

                  <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium">
                        SKU
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                        placeholder="SKU"
                  className={errors.sku ? "border-destructive" : ""}
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku}</p>
                )}
              </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode" className="text-sm font-medium">
                        Barcode
                      </Label>
                      <Input
                        id="barcode"
                        value={formData.barcode || ""}
                        onChange={(e) => handleInputChange("barcode", e.target.value)}
                        placeholder="Barcode"
                      />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                      Product Description
              </Label>
                    <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Product Description"
                      className="w-full min-h-[100px] p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none bg-background text-foreground"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>
                </CardContent>
              </Card>

              {/* Category & Brand Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Category & Brand</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
              <div className="space-y-2">
                    <Label className="text-sm font-medium">Product Category</Label>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                    >
                      <option value="">Select Category</option>
                      <option value="Sneakers">Sneakers</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Accessories">Accessories</option>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                    <Label className="text-sm font-medium">Product Brand</Label>
                    <Select
                      value={formData.brand || ""}
                      onChange={(e) => handleInputChange("brand", e.target.value)}
                    >
                      <option value="">Select Brand</option>
                      <option value="Nike">Nike</option>
                      <option value="Adidas">Adidas</option>
                      <option value="Jordan">Jordan</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Variants Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Variants</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={addVariant}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {formData.variants && formData.variants.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Size</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>On Hand</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.variants.map((variant, index) => (
                          <TableRow key={variant.id || index}>
                            <TableCell>
                              <Input
                                value={variant.size}
                                onChange={(e) => updateVariant(index, "size", e.target.value)}
                                placeholder="Size"
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={variant.color}
                                onChange={(e) => updateVariant(index, "color", e.target.value)}
                                placeholder="Color"
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <select
                                value={variant.available ? "yes" : "no"}
                                onChange={(e) => updateVariant(index, "available", e.target.value === "yes")}
                                className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded bg-background text-foreground"
                              >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            </TableCell>
                            <TableCell>
                <Input
                  type="number"
                                value={variant.onHand}
                                onChange={(e) => updateVariant(index, "onHand", parseInt(e.target.value) || 0)}
                  placeholder="0"
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeVariant(index)}
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No variants added yet. Click "Add New" to create variants.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Images and Tags */}
            <div className={PRODUCT_MODAL_CLASSES.column}>
              {/* Image Upload Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Existing Images Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images?.map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )) || (
                        <>
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        </>
                      )}
              </div>

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Choose a file or drag & drop here
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          JPEG, PNG, up to 5 MB
                        </p>
                        <Button variant="outline" size="sm">
                          Browse File
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add tags (press Enter or comma)"
                    />
                  </div>
                  
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className={`flex items-center justify-between ${PRODUCT_MODAL_CLASSES.footer}`}>
          <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save
            </Button>
          </div>
        </div>
      </RightDialogContent>
    </Dialog>
  )
}
