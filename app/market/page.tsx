"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Wifi, Smartphone, Plus, ArrowLeft } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  category: "wifi" | "pulsa"
  provider?: string
  description: string
  stock: number
}

interface CartItem extends Product {
  quantity: number
}

const initialProducts: Product[] = [
  {
    id: "wifi-1day",
    name: "Voucher WiFi Hotspot - 1 Hari",
    price: 5000,
    category: "wifi",
    description: "Akses internet unlimited selama 1 hari",
    stock: 50,
  },
  {
    id: "wifi-1month",
    name: "Voucher WiFi Hotspot - 1 Bulan",
    price: 50000,
    category: "wifi",
    description: "Akses internet unlimited selama 1 bulan",
    stock: 25,
  },
  {
    id: "telkomsel-10k",
    name: "Pulsa Telkomsel 10.000",
    price: 11000,
    category: "pulsa",
    provider: "Telkomsel",
    description: "Pulsa reguler Telkomsel Rp 10.000",
    stock: 100,
  },
  {
    id: "xl-15k",
    name: "Pulsa XL 15.000",
    price: 16000,
    category: "pulsa",
    provider: "XL",
    description: "Pulsa reguler XL Rp 15.000",
    stock: 75,
  },
  {
    id: "tri-20k",
    name: "Pulsa Tri 20.000",
    price: 21000,
    category: "pulsa",
    provider: "Tri",
    description: "Pulsa reguler Tri Rp 20.000",
    stock: 60,
  },
  {
    id: "indosat-25k",
    name: "Pulsa Indosat 25.000",
    price: 26000,
    category: "pulsa",
    provider: "Indosat",
    description: "Pulsa reguler Indosat Rp 25.000",
    stock: 40,
  },
]

export default function Market() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [userData, setUserData] = useState<{ name: string; whatsapp: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user data exists
    const storedData = sessionStorage.getItem("userData")
    if (!storedData) {
      router.push("/")
      return
    }
    setUserData(JSON.parse(storedData))

    // Load cart from localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [router])

  useEffect(() => {
    // Filter and sort products
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.provider && product.provider.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "popular":
          return b.stock - a.stock
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, sortBy])

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    let newCart: CartItem[]

    if (existingItem) {
      newCart = cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }

    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div className="flex items-center space-x-2">
                <Wifi className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">GARDENS-NET</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Halo, {userData.name}</span>
              <Button variant="outline" onClick={() => router.push("/cart")} className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Keranjang
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nama A-Z</SelectItem>
              <SelectItem value="price-low">Harga Terendah</SelectItem>
              <SelectItem value="price-high">Harga Tertinggi</SelectItem>
              <SelectItem value="popular">Paling Populer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center h-16 bg-gray-100 rounded-lg mb-3">
                  {product.category === "wifi" ? (
                    <Wifi className="h-8 w-8 text-blue-600" />
                  ) : (
                    <Smartphone className="h-8 w-8 text-green-600" />
                  )}
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription className="text-sm">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</span>
                  <Badge variant={product.stock > 10 ? "default" : "destructive"}>Stok: {product.stock}</Badge>
                </div>

                {product.provider && <Badge variant="outline">{product.provider}</Badge>}

                <Button onClick={() => addToCart(product)} disabled={product.stock === 0} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada produk yang ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}
