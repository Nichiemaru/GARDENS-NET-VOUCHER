"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Smartphone, Building2, QrCode, Wifi } from "lucide-react"

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

interface PaymentMethod {
  id: string
  name: string
  type: "qris" | "va" | "ewallet"
  icon: React.ReactNode
  enabled: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS (Semua Bank & E-Wallet)",
    type: "qris",
    icon: <QrCode className="h-6 w-6" />,
    enabled: true,
  },
  {
    id: "bca_va",
    name: "Virtual Account BCA",
    type: "va",
    icon: <Building2 className="h-6 w-6" />,
    enabled: true,
  },
  {
    id: "bni_va",
    name: "Virtual Account BNI",
    type: "va",
    icon: <Building2 className="h-6 w-6" />,
    enabled: true,
  },
  {
    id: "gopay",
    name: "GoPay",
    type: "ewallet",
    icon: <Smartphone className="h-6 w-6" />,
    enabled: true,
  },
  {
    id: "ovo",
    name: "OVO",
    type: "ewallet",
    icon: <Smartphone className="h-6 w-6" />,
    enabled: true,
  },
  {
    id: "dana",
    name: "DANA",
    type: "ewallet",
    icon: <Smartphone className="h-6 w-6" />,
    enabled: true,
  },
]

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [userData, setUserData] = useState<{ name: string; whatsapp: string } | null>(null)
  const [selectedPayment, setSelectedPayment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
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
      const cartData = JSON.parse(storedCart)
      if (cartData.length === 0) {
        router.push("/market")
        return
      }
      setCart(cartData)
    } else {
      router.push("/market")
    }
  }, [router])

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

  const handlePayment = async () => {
    if (!selectedPayment) {
      alert("Silakan pilih metode pembayaran")
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    try {
      // Create order data
      const orderData = {
        id: `ORDER-${Date.now()}`,
        customer: userData,
        items: cart,
        total: getSubtotal(),
        paymentMethod: selectedPayment,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      // Store order data
      sessionStorage.setItem("currentOrder", JSON.stringify(orderData))

      // Simulate payment gateway redirect
      setTimeout(() => {
        // Simulate random payment result
        const isSuccess = Math.random() > 0.3 // 70% success rate for demo

        if (isSuccess) {
          // Clear cart on successful payment
          localStorage.removeItem("cart")
          router.push("/payment-status?status=success")
        } else {
          router.push("/payment-status?status=failed")
        }
      }, 3000)
    } catch (error) {
      console.error("Payment error:", error)
      setIsProcessing(false)
      alert("Terjadi kesalahan saat memproses pembayaran")
    }
  }

  if (!userData || cart.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/cart")} disabled={isProcessing}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Keranjang
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Pembayaran</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Data Pembeli</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-medium">{userData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp:</span>
                  <span className="font-medium">{userData.whatsapp}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih Metode Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} disabled={isProcessing}>
                  <div className="space-y-3">
                    {paymentMethods
                      .filter((method) => method.enabled)
                      .map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                            <div className="text-blue-600">{method.icon}</div>
                            <span className="font-medium">{method.name}</span>
                          </Label>
                        </div>
                      ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="flex items-center justify-center h-10 w-10 bg-gray-100 rounded-lg flex-shrink-0">
                        {item.category === "wifi" ? (
                          <Wifi className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Smartphone className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-500">{item.quantity}x</span>
                          <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr />

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
                  <span>Total Pembayaran</span>
                  <span className="text-green-600">{formatPrice(getSubtotal())}</span>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={!selectedPayment || isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? "Memproses Pembayaran..." : "Bayar Sekarang"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
