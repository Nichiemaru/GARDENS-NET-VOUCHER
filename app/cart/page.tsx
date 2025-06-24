"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, Wifi, Smartphone } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  category: "wifi" | "pulsa"
  provider?: string
  description: string
  stock: number
  quantity: number
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([])
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

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }

    const newCart = cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    updateCart(newCart)
  }

  const removeItem = (id: string) => {
    const newCart = cart.filter((item) => item.id !== id)
    updateCart(newCart)
  }

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
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

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Keranjang belanja kosong")
      return
    }
    router.push("/checkout")
  }

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/market")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali Belanja
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Keranjang Belanja</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">{getTotalItems()} item</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cart.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keranjang Belanja Kosong</h3>
              <p className="text-gray-500 mb-6">Belum ada produk yang ditambahkan ke keranjang</p>
              <Button onClick={() => router.push("/market")}>Mulai Berbelanja</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Produk yang Dipilih ({getTotalItems()} item)</h2>

              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0">
                        {item.category === "wifi" ? (
                          <Wifi className="h-8 w-8 text-blue-600" />
                        ) : (
                          <Smartphone className="h-8 w-8 text-green-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        {item.provider && (
                          <Badge variant="outline" className="mt-2">
                            {item.provider}
                          </Badge>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-green-600">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({getTotalItems()} item)</span>
                      <span>{formatPrice(getSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Biaya Admin</span>
                      <span>Gratis</span>
                    </div>
                  </div>

                  <hr />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">{formatPrice(getSubtotal())}</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Pembeli:</strong> {userData.name}
                    </p>
                    <p>
                      <strong>WhatsApp:</strong> {userData.whatsapp}
                    </p>
                  </div>

                  <Button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    Lanjutkan ke Pembayaran
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Kode voucher akan dikirim ke WhatsApp Anda setelah pembayaran berhasil
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
