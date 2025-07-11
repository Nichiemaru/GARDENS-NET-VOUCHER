"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Package, Wifi, Smartphone, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  id: string
  name: string
  price: number
  category: "wifi" | "pulsa"
  provider?: string
  description: string
  stock: number
  duration?: string
  validity?: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [product, setProduct] = useState<Partial<Product>>({})

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        // In real app, this would fetch from API
        // For demo, we'll use some default data based on ID
        const mockProducts: Record<string, Product> = {
          "wifi-1day": {
            id: "wifi-1day",
            name: "Voucher WiFi Hotspot - 1 Hari",
            price: 5000,
            category: "wifi",
            description: "Akses internet unlimited selama 1 hari",
            stock: 50,
            duration: "1 Hari",
          },
          "wifi-1month": {
            id: "wifi-1month",
            name: "Voucher WiFi Hotspot - 1 Bulan",
            price: 50000,
            category: "wifi",
            description: "Akses internet unlimited selama 1 bulan",
            stock: 25,
            duration: "1 Bulan",
          },
        }

        const foundProduct = mockProducts[productId]
        if (foundProduct) {
          setProduct(foundProduct)
        } else {
          setErrors({ general: "Produk tidak ditemukan" })
        }
      } catch (error) {
        setErrors({ general: "Gagal memuat data produk" })
      } finally {
        setIsLoadingProduct(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!product.name?.trim()) {
      newErrors.name = "Nama produk wajib diisi"
    }

    if (!product.price || product.price <= 0) {
      newErrors.price = "Harga harus lebih dari 0"
    }

    if (!product.stock || product.stock < 0) {
      newErrors.stock = "Stok tidak boleh negatif"
    }

    if (!product.description?.trim()) {
      newErrors.description = "Deskripsi produk wajib diisi"
    }

    if (product.category === "pulsa" && !product.provider?.trim()) {
      newErrors.provider = "Provider wajib diisi untuk produk pulsa"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateProduct = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSuccessMessage("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In real app, this would update the database
      console.log("Updating product:", product)

      setSuccessMessage("Produk berhasil diperbarui!")

      // Redirect after successful update
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 1500)
    } catch (error) {
      console.error("Error updating product:", error)
      setErrors({ general: "Gagal memperbarui produk. Silakan coba lagi." })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (value: string) => {
    const number = value.replace(/\D/g, "")
    return new Intl.NumberFormat("id-ID").format(Number(number))
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setProduct({ ...product, price: Number(value) })
  }

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data produk...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Produk</h1>
                <p className="text-sm text-gray-500">GARDENS-NET Admin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Package className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* General Error */}
        {errors.general && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Edit Produk</span>
            </CardTitle>
            <CardDescription>Perbarui informasi produk</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informasi Dasar</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nama Produk <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={product.name || ""}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    placeholder="Contoh: Voucher WiFi Hotspot - 1 Hari"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Kategori <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={product.category}
                    onValueChange={(value: "wifi" | "pulsa") => setProduct({ ...product, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wifi">
                        <div className="flex items-center space-x-2">
                          <Wifi className="h-4 w-4 text-blue-600" />
                          <span>WiFi Voucher</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pulsa">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-green-600" />
                          <span>Pulsa/Kuota</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Harga <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                    <Input
                      id="price"
                      type="text"
                      value={product.price ? formatPrice(product.price.toString()) : ""}
                      onChange={handlePriceChange}
                      placeholder="0"
                      className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock">
                    Stok/Kuantitas <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={product.stock || ""}
                    onChange={(e) => setProduct({ ...product, stock: Number.parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className={errors.stock ? "border-red-500" : ""}
                  />
                  {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
                  <p className="text-sm text-gray-500">Jumlah voucher/kode yang tersedia</p>
                </div>
              </div>
            </div>

            {/* Category Specific Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Detail Kategori</h3>

              {product.category === "pulsa" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">
                      Provider <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={product.provider || ""}
                      onValueChange={(value) => setProduct({ ...product, provider: value })}
                    >
                      <SelectTrigger className={errors.provider ? "border-red-500" : ""}>
                        <SelectValue placeholder="Pilih provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Telkomsel">Telkomsel</SelectItem>
                        <SelectItem value="XL Axiata">XL Axiata</SelectItem>
                        <SelectItem value="Tri">Tri (3)</SelectItem>
                        <SelectItem value="Indosat">Indosat Ooredoo</SelectItem>
                        <SelectItem value="Smartfren">Smartfren</SelectItem>
                        <SelectItem value="By.U">By.U</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.provider && <p className="text-sm text-red-500">{errors.provider}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validity">Masa Berlaku</Label>
                    <Input
                      id="validity"
                      value={product.validity || ""}
                      onChange={(e) => setProduct({ ...product, validity: e.target.value })}
                      placeholder="Contoh: 30 hari"
                    />
                  </div>
                </div>
              )}

              {product.category === "wifi" && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Durasi Akses</Label>
                  <Select
                    value={product.duration || ""}
                    onValueChange={(value) => setProduct({ ...product, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih durasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 Jam">1 Jam</SelectItem>
                      <SelectItem value="3 Jam">3 Jam</SelectItem>
                      <SelectItem value="6 Jam">6 Jam</SelectItem>
                      <SelectItem value="12 Jam">12 Jam</SelectItem>
                      <SelectItem value="1 Hari">1 Hari</SelectItem>
                      <SelectItem value="3 Hari">3 Hari</SelectItem>
                      <SelectItem value="1 Minggu">1 Minggu</SelectItem>
                      <SelectItem value="1 Bulan">1 Bulan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Deskripsi Produk <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={product.description || ""}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                placeholder="Jelaskan detail produk, fitur, dan cara penggunaan..."
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              <p className="text-sm text-gray-500">Deskripsi akan ditampilkan kepada pelanggan</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Batal
              </Button>
              <Button onClick={handleUpdateProduct} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Memperbarui...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Perbarui Produk
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
