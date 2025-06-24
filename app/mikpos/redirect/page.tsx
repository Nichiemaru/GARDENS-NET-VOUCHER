"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { Wifi, Clock, Users, Zap, Phone, ShoppingCart, Router, Globe, CheckCircle, AlertCircle } from "lucide-react"

interface CustomerSession {
  name: string
  mac_address: string
  ip_address: string
  session_id: string
  hotspot_info: {
    interface: string
    server_name: string
    login_url: string
  }
  requested_profile?: string
  created_at: string
}

interface VoucherPackage {
  id: string
  name: string
  duration: string
  price: number
  bandwidth: string
  concurrent_users: number
  description: string
  popular?: boolean
  mikrotik_profile: string
}

const voucherPackages: VoucherPackage[] = [
  {
    id: "1hour",
    name: "Express 1 Jam",
    duration: "1 Jam",
    price: 5000,
    bandwidth: "10 Mbps",
    concurrent_users: 1,
    description: "Cocok untuk browsing cepat",
    mikrotik_profile: "1hour-10M",
  },
  {
    id: "1day",
    name: "Daily 1 Hari",
    duration: "24 Jam",
    price: 15000,
    bandwidth: "20 Mbps",
    concurrent_users: 2,
    description: "Paket harian untuk kebutuhan sehari-hari",
    popular: true,
    mikrotik_profile: "1day-20M",
  },
  {
    id: "3days",
    name: "Weekend 3 Hari",
    duration: "72 Jam",
    price: 35000,
    bandwidth: "25 Mbps",
    concurrent_users: 3,
    description: "Hemat untuk penggunaan akhir pekan",
    mikrotik_profile: "3days-25M",
  },
  {
    id: "1week",
    name: "Weekly 1 Minggu",
    duration: "7 Hari",
    price: 75000,
    bandwidth: "30 Mbps",
    concurrent_users: 5,
    description: "Paket mingguan dengan bandwidth tinggi",
    mikrotik_profile: "1week-30M",
  },
]

export default function MikPosRedirectPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [status, setStatus] = useState("processing")

  const sessionId = searchParams.get("session")

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session tidak valid atau telah berakhir",
        variant: "destructive",
      })
      setSessionExpired(true)
      setLoading(false)
      return
    }

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/mikpos/session/${sessionId}`)
        const sessionData = await response.json()

        if (sessionData.success) {
          setStatus("success")

          // Redirect ke customer landing dengan data session
          const params = new URLSearchParams({
            mac: sessionData.data.mac_address || "",
            ip: sessionData.data.ip_address || "",
            session: sessionId,
          })

          setTimeout(() => {
            router.replace(`/customer?${params.toString()}`)
          }, 2000)
        } else {
          setStatus("error")
          setTimeout(() => {
            router.replace("/customer")
          }, 3000)
        }
      } catch (error) {
        console.error("Failed to fetch session:", error)
        setStatus("error")
        setTimeout(() => {
          router.replace("/customer")
        }, 3000)
      }
    }

    fetchSession()

    // Check session expiry every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30000)
    return () => clearInterval(interval)
  }, [sessionId, router])

  const checkSessionExpiry = async () => {
    if (!sessionId) return

    try {
      const response = await fetch(`/api/mikpos/session/${sessionId}/check`)
      if (!response.ok) {
        setSessionExpired(true)
        toast({
          title: "Session Berakhir",
          description: "Session Anda telah berakhir. Silakan mulai ulang dari hotspot login.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Session check error:", error)
    }
  }

  const handlePurchase = async () => {
    if (!selectedPackage || !whatsappNumber.trim()) {
      toast({
        title: "Error",
        description: "Pilih paket dan masukkan nomor WhatsApp",
        variant: "destructive",
      })
      return
    }

    // Validate WhatsApp number
    const cleanNumber = whatsappNumber.replace(/\D/g, "")
    if (cleanNumber.length < 10 || (!cleanNumber.startsWith("08") && !cleanNumber.startsWith("628"))) {
      toast({
        title: "Error",
        description: "Format nomor WhatsApp tidak valid (08xxx atau 628xxx)",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      const selectedPkg = voucherPackages.find((pkg) => pkg.id === selectedPackage)
      if (!selectedPkg) {
        throw new Error("Paket tidak ditemukan")
      }

      // Create order
      const orderResponse = await fetch("/api/mikpos/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          package_id: selectedPackage,
          mikrotik_profile: selectedPkg.mikrotik_profile,
          customer: {
            ...customerSession,
            whatsapp: cleanNumber,
          },
          amount: selectedPkg.price,
          source: "mikpos_hotspot",
        }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.message || "Gagal membuat pesanan")
      }

      const orderData = await orderResponse.json()

      // Store order info for checkout
      sessionStorage.setItem(
        "mikpos_order",
        JSON.stringify({
          order_id: orderData.order_id,
          session_id: sessionId,
          return_url: customerSession?.hotspot_info.login_url,
        }),
      )

      // Redirect to checkout with MikPos context
      router.push(`/checkout?order_id=${orderData.order_id}&source=mikpos&session=${sessionId}`)
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal memproses pesanan",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-600 p-4 rounded-full">
                <Wifi className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600">Memproses koneksi Anda...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-600 p-4 rounded-full">
                <Wifi className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-gray-600">Koneksi berhasil! Mengarahkan ke halaman pembelian...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-600 p-4 rounded-full">
                <Wifi className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-600 text-xl">!</span>
              </div>
              <p className="text-gray-600">Terjadi kesalahan. Mengarahkan ulang...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sessionExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-700">Session Berakhir</CardTitle>
              <CardDescription className="text-red-600">Session Anda telah berakhir atau tidak valid</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">Untuk membeli voucher WiFi, silakan:</p>
              <ol className="text-left text-sm text-gray-600 space-y-2">
                <li>1. Kembali ke halaman login hotspot MikroTik</li>
                <li>2. Klik menu "Beli Voucher" atau "Purchase Voucher"</li>
                <li>3. Anda akan diarahkan kembali ke halaman ini</li>
              </ol>
              <Button onClick={() => window.close()} variant="outline" className="mt-4">
                Tutup Halaman
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Router className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">GARDENS-NET WiFi</h1>
          </div>
          <p className="text-gray-600 mb-2">Selamat datang {customerSession?.name}! Pilih paket voucher WiFi Anda</p>

          {/* Connection Info */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <Globe className="h-4 w-4 mr-2 text-blue-500" />
                <span>IP: {customerSession?.ip_address}</span>
              </div>
              <div className="flex items-center justify-center">
                <Wifi className="h-4 w-4 mr-2 text-green-500" />
                <span>MAC: {customerSession?.mac_address}</span>
              </div>
              <div className="flex items-center justify-center">
                <Router className="h-4 w-4 mr-2 text-purple-500" />
                <span>Server: {customerSession?.hotspot_info.server_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Packages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {voucherPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPackage === pkg.id ? "ring-2 ring-blue-500 shadow-lg bg-blue-50" : "hover:shadow-md"
              } ${pkg.popular ? "border-blue-500" : ""}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  {pkg.popular && (
                    <Badge variant="default" className="bg-blue-500">
                      Populer
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-2xl font-bold text-blue-600">{formatPrice(pkg.price)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {pkg.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="h-4 w-4 mr-2" />
                  {pkg.bandwidth}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {pkg.concurrent_users} device
                </div>
                <p className="text-xs text-gray-500 mt-2">{pkg.description}</p>
                {selectedPackage === pkg.id && (
                  <div className="flex items-center text-xs text-blue-600 font-medium">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Dipilih
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* WhatsApp Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Nomor WhatsApp
            </CardTitle>
            <CardDescription>
              Kode voucher akan dikirim ke nomor WhatsApp ini setelah pembayaran berhasil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="08123456789 atau 628123456789"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="text-lg"
                required
              />
              <p className="text-xs text-gray-500">
                Format: 08123456789 atau 628123456789 (tanpa spasi atau tanda hubung)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handlePurchase}
            disabled={!selectedPackage || !whatsappNumber.trim() || processing}
            size="lg"
            className="w-full md:w-auto px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Memproses Pesanan...
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Beli Voucher
                {selectedPackage && (
                  <span className="ml-2">
                    - {formatPrice(voucherPackages.find((p) => p.id === selectedPackage)?.price || 0)}
                  </span>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Informasi Penting:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Voucher akan aktif setelah pembayaran berhasil</li>
              <li>• Kode voucher dikirim via WhatsApp dalam 1-2 menit</li>
              <li>• Setelah pembayaran, Anda akan kembali ke halaman login hotspot</li>
              <li>• Gunakan kode voucher untuk login dan mulai browsing</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
