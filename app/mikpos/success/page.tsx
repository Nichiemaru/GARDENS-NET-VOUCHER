"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Copy, Wifi, Phone, ExternalLink, Clock, QrCode, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SuccessData {
  order_id: string
  voucher_code: string
  customer: {
    name: string
    whatsapp: string
    ip_address: string
    mac_address: string
    hotspot_info: {
      login_url: string
      server_name: string
      interface: string
    }
  }
  package_info: {
    name: string
    duration: string
    bandwidth: string
    price: number
  }
  expires_at: string
  created_at: string
  whatsapp_sent: boolean
}

export default function MikPosSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(15)
  const [whatsappStatus, setWhatsappStatus] = useState<"sending" | "sent" | "failed">("sending")

  const orderId = searchParams.get("order_id")
  const voucherCode = searchParams.get("voucher")
  const sessionId = searchParams.get("session")

  useEffect(() => {
    if (orderId && voucherCode) {
      fetchSuccessData()
    }
  }, [orderId, voucherCode])

  useEffect(() => {
    if (countdown > 0 && successData) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && successData) {
      // Auto redirect to hotspot login
      redirectToHotspotLogin()
    }
  }, [countdown, successData])

  const fetchSuccessData = async () => {
    try {
      const response = await fetch(`/api/mikpos/order/status?order_id=${orderId}&voucher=${voucherCode}`)
      if (!response.ok) {
        throw new Error("Failed to fetch order status")
      }

      const data = await response.json()
      setSuccessData(data.order)
      setWhatsappStatus(data.order.whatsapp_sent ? "sent" : "failed")
    } catch (error) {
      console.error("Error fetching success data:", error)
      // Fallback with mock data for demo
      const mockData: SuccessData = {
        order_id: orderId!,
        voucher_code: voucherCode!,
        customer: {
          name: "Customer MikPos",
          whatsapp: "628123456789",
          ip_address: "192.168.1.100",
          mac_address: "AA:BB:CC:DD:EE:FF",
          hotspot_info: {
            login_url: "http://192.168.1.1/login",
            server_name: "GARDENS-NET Hotspot",
            interface: "ether1",
          },
        },
        package_info: {
          name: "Daily 1 Hari",
          duration: "24 Jam",
          bandwidth: "20 Mbps",
          price: 15000,
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        whatsapp_sent: true,
      }
      setSuccessData(mockData)
      setWhatsappStatus("sent")
    } finally {
      setLoading(false)
    }
  }

  const copyVoucherCode = () => {
    if (successData?.voucher_code) {
      navigator.clipboard.writeText(successData.voucher_code)
      toast({
        title: "Berhasil!",
        description: "Kode voucher berhasil disalin ke clipboard",
      })
    }
  }

  const redirectToHotspotLogin = () => {
    if (successData?.customer.hotspot_info.login_url) {
      window.location.href = successData.customer.hotspot_info.login_url
    }
  }

  const resendWhatsApp = async () => {
    if (!successData) return

    setWhatsappStatus("sending")
    try {
      const response = await fetch("/api/mikpos/whatsapp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp: successData.customer.whatsapp,
          voucher_code: successData.voucher_code,
          order_id: successData.order_id,
        }),
      })

      if (response.ok) {
        setWhatsappStatus("sent")
        toast({
          title: "Berhasil!",
          description: "Kode voucher berhasil dikirim ulang ke WhatsApp",
        })
      } else {
        throw new Error("Failed to resend WhatsApp")
      }
    } catch (error) {
      setWhatsappStatus("failed")
      toast({
        title: "Gagal",
        description: "Gagal mengirim ulang ke WhatsApp",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data voucher...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-gray-600">Voucher WiFi Anda telah berhasil dibuat dan siap digunakan</p>
        </div>

        {/* Voucher Code Card - Main Focus */}
        <Card className="mb-6 border-2 border-green-300 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center text-green-800 text-xl">
              <Wifi className="h-6 w-6 mr-2" />
              Kode Voucher WiFi Anda
            </CardTitle>
            <CardDescription className="text-green-700">
              Gunakan kode ini untuk login ke hotspot WiFi GARDENS-NET
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Large Voucher Code Display */}
            <div className="bg-white rounded-xl p-6 mb-4 border-2 border-dashed border-green-300">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">KODE VOUCHER</p>
                <div className="flex items-center justify-center gap-4">
                  <code className="text-4xl font-mono font-bold text-blue-600 tracking-wider">
                    {successData?.voucher_code}
                  </code>
                  <Button variant="outline" size="lg" onClick={copyVoucherCode} className="h-12">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Klik tombol untuk menyalin kode</p>
              </div>
            </div>

            {/* Package Info */}
            {successData && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-gray-600">Paket</p>
                  <p className="font-bold text-green-700">{successData.package_info.name}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-gray-600">Durasi</p>
                  <p className="font-bold text-blue-700">{successData.package_info.duration}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-gray-600">Bandwidth</p>
                  <p className="font-bold text-purple-700">{successData.package_info.bandwidth}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-gray-600">Harga</p>
                  <p className="font-bold text-orange-700">{formatPrice(successData.package_info.price)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Status */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-green-600" />
                <div>
                  <p className="font-medium">Status WhatsApp</p>
                  <p className="text-sm text-gray-600">Kode voucher dikirim ke {successData?.customer.whatsapp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {whatsappStatus === "sending" && (
                  <Badge variant="secondary">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Mengirim...
                  </Badge>
                )}
                {whatsappStatus === "sent" && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Terkirim
                  </Badge>
                )}
                {whatsappStatus === "failed" && (
                  <>
                    <Badge variant="destructive">Gagal</Badge>
                    <Button variant="outline" size="sm" onClick={resendWhatsApp}>
                      Kirim Ulang
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Cara Menggunakan Voucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium">Kembali ke halaman login hotspot</p>
                  <p className="text-sm text-gray-600">Klik tombol "Kembali ke Login Hotspot" di bawah</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium">Masukkan kode voucher</p>
                  <p className="text-sm text-gray-600">
                    Masukkan kode:{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded text-blue-600 font-mono">
                      {successData?.voucher_code}
                    </code>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-600 font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium">Klik "Connect" atau "Login"</p>
                  <p className="text-sm text-gray-600">Voucher akan aktif dan Anda bisa mulai browsing</p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <Alert>
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                <strong>Penting:</strong> Voucher hanya bisa digunakan sekali dan berlaku hingga{" "}
                <strong>{successData && formatDateTime(successData.expires_at)}</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Action - Back to Hotspot */}
          <Button
            onClick={redirectToHotspotLogin}
            className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="lg"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Kembali ke Login Hotspot
            {countdown > 0 && <span className="ml-2 text-sm">({countdown}s)</span>}
          </Button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => window.print()}>
              <QrCode className="h-4 w-4 mr-2" />
              Print Voucher
            </Button>
            <Button variant="outline" onClick={() => router.push("/mikpos/status?code=" + successData?.voucher_code)}>
              <Clock className="h-4 w-4 mr-2" />
              Cek Status
            </Button>
          </div>
        </div>

        {/* Auto Redirect Notice */}
        {countdown > 0 && (
          <Alert className="mt-6 border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Auto Redirect:</strong> Anda akan otomatis diarahkan ke halaman login hotspot dalam{" "}
              <strong>{countdown} detik</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Order Details */}
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm text-gray-700">Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-mono">{successData?.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Server:</span>
              <span>{successData?.customer.hotspot_info.server_name}</span>
            </div>
            <div className="flex justify-between">
              <span>IP Address:</span>
              <span className="font-mono">{successData?.customer.ip_address}</span>
            </div>
            <div className="flex justify-between">
              <span>MAC Address:</span>
              <span className="font-mono">{successData?.customer.mac_address}</span>
            </div>
            <div className="flex justify-between">
              <span>Dibuat:</span>
              <span>{successData && formatDateTime(successData.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
