"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, Eye, Edit, Trash, TrendingUp, Star, Settings } from "lucide-react"
import { Dialog, RightDialogContent } from "@/components/ui/right-dialog"
import { DialogTitle } from "@/components/ui/dialog"
import { PRODUCT_MODAL_CONFIG, PRODUCT_MODAL_CLASSES } from "@/lib/product-modal-config"
import { useRouter } from "next/navigation"

interface ProductVariant {
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
  status: "Active" | "Inactive"
  category: string
  sku: string
  image?: string
  images?: string[]
  variants?: ProductVariant[]
  salesPrice?: number
  salesPriceChange?: number
  sales?: number
  salesChange?: number
  totalSales?: number
  velocity?: number
  delta?: number
  updatedBy?: string
  createdDate?: string
  lastUpdated?: string
  rating?: number
  reviews?: number
  colors?: string[]
  sizes?: string[]
  fit?: string
}

interface ProductViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onEdit?: (product: Product) => void
  onDelete?: (id: number) => void
}

export default function ProductViewModal({ 
  open, 
  onOpenChange, 
  product, 
  onEdit, 
  onDelete 
}: ProductViewModalProps) {
  const router = useRouter()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!product) return null

  const mockVariants: ProductVariant[] = product.variants || [
    { size: "EU 40", color: "White", price: 96.00, available: true, onHand: 24 },
    { size: "EU 39", color: "White", price: 96.00, available: true, onHand: 18 },
    { size: "EU 42", color: "Black", price: 96.00, available: true, onHand: 12 },
    { size: "EU 41", color: "White", price: 96.00, available: false, onHand: 30 },
    { size: "EU 44", color: "Red", price: 96.00, available: true, onHand: 27 },
    { size: "EU 43", color: "Black", price: 96.00, available: false, onHand: 15 },
  ]

  const mockImages = product.images || [
    "/api/placeholder/400/300",
    "/api/placeholder/400/300",
    "/api/placeholder/400/300",
    "/api/placeholder/400/300",
    "/api/placeholder/400/300"
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ))
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
            <DialogTitle className="text-2xl font-semibold">Product Details & Analytics</DialogTitle>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                router.push(`/products/${product.id}`)
                onOpenChange(false)
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Customer View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete?.(product.id)}
            >
              <Trash className="w-4 h-4 mr-2" />
              Remove
            </Button>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onEdit?.(product)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Product Info Header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>SKU {product.sku}</span>
                <span>Created {product.createdDate || "16 Jan, 2025"}</span>
                <span>Last Updated {product.lastUpdated || "2 days ago"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className={PRODUCT_MODAL_CLASSES.content}>
          <div className={PRODUCT_MODAL_CLASSES.grid}>
            {/* Left Column - Analytics */}
            <div className={PRODUCT_MODAL_CLASSES.column}>
              {/* Inventory Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={product.status === "Active" ? "default" : "secondary"}>
                      {product.status === "Active" ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{product.inventory}</div>
                      <div className="text-sm text-gray-600">In Stock</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        +{product.delta || 289}
                      </div>
                      <div className="text-sm text-gray-600">Delta</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Velocity</span>
                    <span className="text-sm font-medium">{product.velocity || "0.24"} items/day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Updated By</span>
                    <span className="text-sm font-medium">{product.updatedBy || "Jason Taytum"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sales Price */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Sales Price</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{product.salesPriceChange || "3.5%"}%</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">${product.salesPrice || product.price}</div>
                    <div className="h-16 bg-purple-100 rounded mt-2 flex items-center justify-center">
                      <span className="text-sm text-gray-500">Price Trend Chart</span>
                    </div>
                  </div>

                  {/* Sales */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Sales</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{product.salesChange || "18%"}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold">{product.sales || 6346}</div>
                      <div className="text-lg font-semibold text-gray-600">
                        ${product.totalSales || "43,784.02"}
                      </div>
                    </div>
                    <div className="h-16 bg-purple-100 rounded mt-2 flex items-center justify-center">
                      <span className="text-sm text-gray-500">Sales Volume Chart</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variants Table */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Analytics</CardTitle>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Variants
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
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
                      {mockVariants.map((variant, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{variant.size}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: variant.color.toLowerCase() }}
                              />
                              {variant.color}
                            </div>
                          </TableCell>
                          <TableCell>${variant.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={variant.available ? "default" : "secondary"}>
                              {variant.available ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>{variant.onHand}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Product Image & Details */}
            <div className={PRODUCT_MODAL_CLASSES.column}>
              {/* Product Images */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={mockImages[selectedImageIndex]} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Thumbnail Images */}
                    <div className="flex gap-2">
                      {mockImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${
                            selectedImageIndex === index 
                              ? "border-blue-500" 
                              : "border-gray-200"
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Description */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-3">Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description || "Lightweight and stylish, these sneakers offer all-day comfort with breathable mesh..."}
                  </p>
                </CardContent>
              </Card>

              {/* Product Specifications */}
              <Card>
                <CardContent className="p6">
                  <h4 className="font-semibold mb-4">Specifications</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category</span>
                      <span className="text-sm font-medium">{product.category || "Sneakers"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fit</span>
                      <span className="text-sm font-medium">{product.fit || "True to size"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Colors</span>
                      <div className="flex gap-1">
                        {product.colors?.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                        )) || (
                          <>
                            <div className="w-4 h-4 rounded-full bg-black border" />
                            <div className="w-4 h-4 rounded-full bg-white border" />
                            <div className="w-4 h-4 rounded-full bg-red-500 border" />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sizes</span>
                      <span className="text-sm font-medium">
                        EU: 39-45, US: 6-12, UK: 5.5-11.5
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(product.rating || 4)}
                        </div>
                        <span className="text-sm font-medium">
                          {product.reviews || 834} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className={`flex items-center justify-between ${PRODUCT_MODAL_CLASSES.footer}`}>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                router.push(`/products/${product.id}`)
                onOpenChange(false)
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Customer View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete?.(product.id)}
            >
              <Trash className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onEdit?.(product)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
        </div>
      </RightDialogContent>
    </Dialog>
  )
}
