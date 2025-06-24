"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { CreditCard, Smartphone, Clock, CheckCircle, ArrowLeft, Wifi, Phone, Router } from "lucide-react"

interface OrderData {
  id: string
  package_id: string
  customer: {
    name: string
    whatsapp: string
    mac_address: string
    ip_address: string
    hotspot_info: {
      server_name: string
      login_url: string
    }
  }
  amount: number
  expires_at: string
  source: string
}

interface PaymentMethod {
  id: string
  name: string
  type: "ewallet" | "bank" | "qris"
  icon: string
  fee: number
  description: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    type: "qris",
    icon: "🏦",
    fee: 0,
    description: "Scan QR Code dengan aplikasi bank/e-wallet",
  },
  {
    id: "gopay",
    name: "GoPay",
    type: "ewallet",
    icon: "💚",
    fee: 0,
    description: "Bayar dengan GoPay",
  },
  {
    id: "ovo",
    name: "OVO",
    type: "ewallet",
    icon: "💜",
    fee: 0,
    description: "Bayar dengan OVO",
  },
  {
    id: "dana",
    name: "DANA",
    type: "ewallet",
    icon: "💙",
    fee: 0,
    description: "Bayar dengan DANA",
  },
]

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const orderId = searchParams.get("order_id")
  const source = searchParams.get("source")
  const sessionId = searchParams.get("session")

  useEffect(() => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "Order ID tidak ditemukan",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    fetchOrderData()
  }, [orderId])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && orderData) {
      // Order expired
      toast({
        title: "Pesanan Berakhir",
        description: "Waktu pembayaran telah habis",
        variant: "destructive",
      })
    }
  }, [timeLeft, orderData])

  const fetchOrderData = async () => {
    try {
      const response = await fetch(`/api/mikpos/order/${orderId}`)

      if (!response.ok) {
        throw new Error("Order tidak ditemukan")
      }

      const data = await response.json()
      setOrderData(data.order)

      // Calculate time left
      const expiresAt = new Date(data.order.expires_at)
      const now = new Date()
      const diffSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
      setTimeLeft(diffSeconds)

      // Default payment method
      setSelectedPayment("qris")
    } catch (error) {
      console.error("Error fetching order:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedPayment || !orderData) return

    setProcessing(true)

    try {
      // Simulate payment process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Process payment success
      const paymentResponse = await fetch("/api/mikpos/payment/success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_method: selectedPayment,
          transaction_id: `TXN-${Date.now()}`,
          amount: orderData.amount,
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error("Pembayaran gagal diproses")
      }

      const paymentData = await paymentResponse.json()

      toast({
        title: "Pembayaran Berhasil!",
        description: "Voucher WiFi telah dikirim ke WhatsApp Anda",
      })

      // Redirect to success page
      router.push(`/mikpos/success?order_id=${orderId}&voucher=${paymentData.voucher_code}`)
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Pembayaran gagal",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Pesanan Tidak Ditemukan</CardTitle>
            <CardDescription>Order ID tidak valid atau telah berakhir</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/")}>Kembali ke Beranda</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">Selesaikan pembayaran voucher WiFi</p>
          </div>
        </div>

        {/* Timer */}
        {timeLeft > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Waktu tersisa: {formatTime(timeLeft)}</strong>
              <br />
              Selesaikan pembayaran sebelum waktu habis
            </AlertDescription>
          </Alert>
        )}

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="h-5 w-5 mr-2" />
              Ringkasan Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Order ID</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{orderData.id}</code>
            </div>

            <div className="flex justify-between items-center">
              <span>Paket Voucher</span>
              <Badge variant="outline">{orderData.package_id}</Badge>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>WhatsApp: {orderData.customer.whatsapp}</span>
              </div>
              <div className="flex items-center">
                <Router className="h-4 w-4 mr-2 text-gray-500" />
                <span>Server: {orderData.customer.hotspot_info.server_name}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Pembayaran</span>
              <span className="text-blue-600">{formatPrice(orderData.amount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Pilih Metode Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPayment === method.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{method.icon}</span>
                      <div>
                        <h3 className="font-medium">{method.name}</h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                    {method.fee > 0 && <span className="text-sm text-gray-500">+{formatPrice(method.fee)}</span>}
                    {selectedPayment === method.id && <CheckCircle className="h-5 w-5 text-blue-500" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handlePayment}
              disabled={!selectedPayment || processing || timeLeft === 0}
              className="w-full py-3 text-lg"
              size="lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Memproses Pembayaran...
                </>
              ) : (
                <>
                  <Smartphone className="h-5 w-5 mr-2" />
                  Bayar {formatPrice(orderData.amount)}
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Voucher akan dikirim ke WhatsApp setelah pembayaran berhasil
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
