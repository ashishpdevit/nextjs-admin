"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart, Heart, Share2 } from "lucide-react"
import { Toaster, toast } from 'sonner'

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
  rating?: number
  reviews?: number
  colors?: string[]
  sizes?: string[]
  fit?: string
}

export default function ProductViewPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use mock data
    const mockProduct: Product = {
      id: parseInt(params.id as string),
      name: "Cloud Shift Lightweight Runner",
      description: "Lightweight and stylish, these sneakers offer all-day comfort with breathable mesh upper and responsive cushioning. Perfect for running, walking, or casual wear.",
      price: 96.23,
      inventory: 1263,
      status: "Active",
      category: "Sneakers",
      sku: "WM-8421",
      images: [
        "/api/placeholder/600/600",
        "/api/placeholder/600/600",
        "/api/placeholder/600/600",
        "/api/placeholder/600/600",
        "/api/placeholder/600/600"
      ],
      rating: 4.2,
      reviews: 834,
      colors: ["White", "Black", "Red"],
      sizes: ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
      fit: "True to size"
    }
    setProduct(mockProduct)
  }, [params.id])

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select size and color")
      return
    }
    toast.success("Added to cart!")
  }

  const handleWishlist = () => {
    toast.success("Added to wishlist!")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

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

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img 
                src={product.images?.[selectedImageIndex] || "/api/placeholder/600/600"} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 ${
                    selectedImageIndex === index 
                      ? "border-primary" 
                      : "border-gray-200 dark:border-gray-700"
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

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(product.rating || 4)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {product.status}
                </Badge>
              </div>
            </div>

            <div>
              <div className="text-3xl font-bold text-foreground">${product.price}</div>
              <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
            </div>

            <div>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md text-sm ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-gray-300 dark:border-gray-600 hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex gap-2">
                {product.colors?.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColor === color
                        ? "border-primary"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.inventory} in stock
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!selectedSize || !selectedColor}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleWishlist}
                  className="px-4"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="px-4"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fit</span>
                  <span>{product.fit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU</span>
                  <span>{product.sku}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
