"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Home, MessageCircle, Copy, Wifi, Smartphone } from "lucide-react"

interface OrderData {
  id: string
  customer: { name: string; whatsapp: string }
  items: Array<{
    id: string
    name: string
    price: number
    category: "wifi" | "pulsa"
    quantity: number
  }>
  total: number
  paymentMethod: string
  status: string
  createdAt: string
  voucherCodes?: string[]
}

export default function PaymentStatus() {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [voucherCodes, setVoucherCodes] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  useEffect(() => {
    const storedOrder = sessionStorage.getItem("currentOrder")
    if (storedOrder) {
      const order = JSON.parse(storedOrder)
      setOrderData(order)

      // Generate voucher codes for successful payments
      if (status === "success") {
        const codes = generateVoucherCodes(order.items)
        setVoucherCodes(codes)

        // Update order with voucher codes
        const updatedOrder = { ...order, voucherCodes: codes, status: "completed" }
        sessionStorage.setItem("currentOrder", JSON.stringify(updatedOrder))

        // Simulate sending WhatsApp message
        sendWhatsAppNotification(order.customer.whatsapp, codes, order.customer.name)
      }
    }
  }, [status])

  const generateVoucherCodes = (items: any[]) => {
    const codes: string[] = []
    items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        if (item.category === "wifi") {
          codes.push(`WIFI-${Math.random().toString(36).substr(2, 8).toUpperCase()}`)
        } else {
          codes.push(`PULSA-${Math.random().toString(36).substr(2, 8).toUpperCase()}`)
        }
      }
    })
    return codes
  }

  const sendWhatsAppNotification = (whatsapp: string, codes: string[], name: string) => {
    // Simulate WhatsApp API call
    console.log(`Sending WhatsApp to ${whatsapp}:`)
    console.log(`Halo ${name}, terima kasih atas pembelian Anda!`)
    console.log(`Kode voucher Anda: ${codes.join(", ")}`)
    console.log("Gunakan kode ini sesuai petunjuk yang diberikan.")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Kode berhasil disalin!")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case "failed":
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Clock className="h-16 w-16 text-yellow-500" />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case "success":
        return "Pembayaran Berhasil!"
      case "failed":
        return "Pembayaran Gagal"
      default:
        return "Menunggu Pembayaran"
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "success":
        return `Terima kasih atas pembelian Anda. Kode voucher telah dikirimkan ke nomor WhatsApp ${orderData?.customer.whatsapp}. Silakan periksa pesan Anda.`
      case "failed":
        return "Pembayaran Anda tidak dapat diproses. Silakan coba lagi atau hubungi customer service kami jika masalah berlanjut."
      default:
        return "Silakan selesaikan pembayaran Anda. Halaman ini akan diperbarui secara otomatis setelah pembayaran berhasil."
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-6">{getStatusIcon()}</div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{getStatusTitle()}</h1>

            <p className="text-gray-600 mb-8 leading-relaxed">{getStatusMessage()}</p>

            {/* Order Details */}
            {orderData && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Detail Pesanan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ID Pesanan:</span>
                    <span className="font-mono">{orderData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nama:</span>
                    <span>{orderData.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WhatsApp:</span>
                    <span>{orderData.customer.whatsapp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-semibold text-green-600">{formatPrice(orderData.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge
                      variant={status === "success" ? "default" : status === "failed" ? "destructive" : "secondary"}
                    >
                      {status === "success" ? "Berhasil" : status === "failed" ? "Gagal" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Voucher Codes */}
            {status === "success" && voucherCodes.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-green-900 mb-4 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Kode Voucher Anda
                </h3>
                <div className="space-y-3">
                  {voucherCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex items-center space-x-3">
                        {code.startsWith("WIFI") ? (
                          <Wifi className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Smartphone className="h-5 w-5 text-green-600" />
                        )}
                        <span className="font-mono text-lg font-semibold">{code}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-green-700 mt-4">Kode voucher juga telah dikirimkan ke WhatsApp Anda</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/")} variant="outline" className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>

              {status === "failed" && (
                <Button onClick={() => router.push("/checkout")} className="bg-green-600 hover:bg-green-700">
                  Coba Lagi
                </Button>
              )}

              {status === "success" && (
                <Button onClick={() => router.push("/market")} className="bg-green-600 hover:bg-green-700">
                  Belanja Lagi
                </Button>
              )}
            </div>

            {/* Customer Service */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">Butuh bantuan? Hubungi customer service kami</p>
              <Button variant="link" className="text-green-600">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
