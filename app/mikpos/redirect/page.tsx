"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, Smartphone, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface MikPosCustomer {
  name: string
  whatsapp: string
  mac_address?: string
  ip_address?: string
  session_id: string
  source: string
  voucher_profile?: string
  created_at: string
}

interface VoucherProfile {
  id: string
  name: string
  duration: string
  price: number
  description: string
  bandwidth: string
}

const availableProfiles: VoucherProfile[] = [
  {
    id: "1hour",
    name: "Voucher WiFi 1 Jam",
    duration: "1 Jam",
    price: 2000,
    description: "Akses internet selama 1 jam",
    bandwidth: "2 Mbps",
  },
  {
    id: "1day",
    name: "Voucher WiFi 1 Hari",
    duration: "1 Hari",
    price: 5000,
    description: "Akses internet selama 1 hari penuh",
    bandwidth: "5 Mbps",
  },
  {
    id: "3days",
    name: "Voucher WiFi 3 Hari",
    duration: "3 Hari",
    price: 12000,
    description: "Akses internet selama 3 hari",
    bandwidth: "5 Mbps",
  },
  {
    id: "1week",
    name: "Voucher WiFi 1 Minggu",
    duration: "1 Minggu",
    price: 25000,
    description: "Akses internet selama 1 minggu",
    bandwidth: "10 Mbps",
  },
]

export default function MikPosRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")

  const [customerData, setCustomerData] = useState<MikPosCustomer | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<string>("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID tidak ditemukan")
      setIsLoading(false)
      return
    }

    // Load customer data from MikPos session
    loadCustomerData()
  }, [sessionId])

  const loadCustomerData = async () => {
    try {
      // In production, this would fetch from your database
      // For demo, we'll simulate the data
      const mockCustomerData: MikPosCustomer = {
        name: "Customer MikPos",
        whatsapp: "",
        mac_address: "AA:BB:CC:DD:EE:FF",
        ip_address: "192.168.1.100",
        session_id: sessionId!,
        source: "mikpos",
        voucher_profile: "1day",
        created_at: new Date().toISOString(),
      }

      setCustomerData(mockCustomerData)
      setSelectedProfile(mockCustomerData.voucher_profile || "1day")
      setWhatsappNumber(mockCustomerData.whatsapp || "")
    } catch (error) {
      setError("Gagal memuat data customer")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!selectedProfile) {
      setError("Silakan pilih paket voucher")
      return
    }

    if (!whatsappNumber.trim()) {
      setError("Nomor WhatsApp wajib diisi")
      return
    }

    // Validate WhatsApp number format
    const cleanNumber = whatsappNumber.replace(/\D/g, "")
    if (!cleanNumber.match(/^(62|08)/)) {
      setError("Format nomor WhatsApp tidak valid (gunakan 62xxx atau 08xxx)")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const selectedVoucher = availableProfiles.find((p) => p.id === selectedProfile)
      if (!selectedVoucher) {
        throw new Error("Paket voucher tidak ditemukan")
      }

      // Create order for MikPos customer
      const orderData = {
        id: `MIKPOS-${Date.now()}`,
        customer: {
          name: customerData?.name || "Customer MikPos",
          whatsapp: whatsappNumber,
          mac_address: customerData?.mac_address,
          ip_address: customerData?.ip_address,
        },
        items: [
          {
            id: selectedVoucher.id,
            name: selectedVoucher.name,
            price: selectedVoucher.price,
            category: "wifi" as const,
            quantity: 1,
          },
        ],
        total: selectedVoucher.price,
        paymentMethod: "mikpos_integration",
        status: "pending",
        source: "mikpos",
        session_id: sessionId,
        createdAt: new Date().toISOString(),
      }

      // Store order data
      sessionStorage.setItem("currentOrder", JSON.stringify(orderData))
      sessionStorage.setItem(
        "userData",
        JSON.stringify({
          name: customerData?.name || "Customer MikPos",
          whatsapp: whatsappNumber,
        }),
      )

      // Redirect to checkout
      router.push("/checkout")
    } catch (error) {
      console.error("Purchase error:", error)
      setError("Terjadi kesalahan saat memproses pembelian")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data customer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Wifi className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">GARDENS-NET</h1>
                <p className="text-sm text-gray-500">Powered by MikPos Integration</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Smartphone className="h-4 w-4 mr-1" />
              MikPos Customer
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Customer Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Informasi Customer</span>
            </CardTitle>
            <CardDescription>Data customer dari sistem MikPos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama:</span>
                <span className="font-medium">{customerData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session ID:</span>
                <span className="font-mono text-xs">{customerData?.session_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MAC Address:</span>
                <span className="font-mono">{customerData?.mac_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IP Address:</span>
                <span className="font-mono">{customerData?.ip_address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nomor WhatsApp</CardTitle>
            <CardDescription>Kode voucher akan dikirimkan ke nomor ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="628123456789 atau 08123456789"
                className="max-w-md"
              />
              <p className="text-sm text-gray-500">Format: 62xxx atau 08xxx</p>
            </div>
          </CardContent>
        </Card>

        {/* Voucher Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pilih Paket Voucher WiFi</CardTitle>
            <CardDescription>Pilih paket yang sesuai dengan kebutuhan Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedProfile === profile.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedProfile(profile.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Wifi className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium">{profile.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{profile.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Durasi: {profile.duration}</span>
                        <span>Speed: {profile.bandwidth}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{formatPrice(profile.price)}</div>
                      {selectedProfile === profile.id && <Badge className="mt-1">Dipilih</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Purchase Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Total Pembayaran</h3>
                <p className="text-2xl font-bold text-green-600">
                  {selectedProfile
                    ? formatPrice(availableProfiles.find((p) => p.id === selectedProfile)?.price || 0)
                    : "Rp 0"}
                </p>
              </div>
              <Button
                onClick={handlePurchase}
                disabled={!selectedProfile || !whatsappNumber.trim() || isProcessing}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Beli Voucher
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integration Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Terintegrasi dengan sistem MikPos untuk kemudahan pembelian voucher WiFi
          </p>
        </div>
      </div>
    </div>
  )
}
