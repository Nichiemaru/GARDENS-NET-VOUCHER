"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { Wifi, Clock, Users, Zap, Phone, ShoppingCart } from "lucide-react"

interface CustomerData {
  name: string
  mac_address: string
  ip_address: string
  session_id: string
  voucher_profile?: string
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
}

const voucherPackages: VoucherPackage[] = [
  {
    id: "1hour",
    name: "1 Jam",
    duration: "1 Jam",
    price: 5000,
    bandwidth: "10 Mbps",
    concurrent_users: 1,
    description: "Cocok untuk browsing ringan",
  },
  {
    id: "1day",
    name: "1 Hari",
    duration: "24 Jam",
    price: 15000,
    bandwidth: "20 Mbps",
    concurrent_users: 2,
    description: "Paket harian untuk kebutuhan sehari-hari",
    popular: true,
  },
  {
    id: "3days",
    name: "3 Hari",
    duration: "72 Jam",
    price: 35000,
    bandwidth: "25 Mbps",
    concurrent_users: 3,
    description: "Hemat untuk penggunaan beberapa hari",
  },
  {
    id: "1week",
    name: "1 Minggu",
    duration: "7 Hari",
    price: 75000,
    bandwidth: "30 Mbps",
    concurrent_users: 5,
    description: "Paket mingguan dengan bandwidth tinggi",
  },
]

export default function MikPosRedirectPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const sessionId = searchParams.get("session")

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session tidak valid",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    fetchCustomerData()
  }, [sessionId])

  const fetchCustomerData = async () => {
    try {
      const response = await fetch(`/api/mikpos/session/${sessionId}`)
      if (!response.ok) {
        throw new Error("Session tidak ditemukan")
      }

      const data = await response.json()
      setCustomerData(data.customer)

      // Pre-select package if specified
      if (data.customer.voucher_profile) {
        setSelectedPackage(data.customer.voucher_profile)
      }
    } catch (error) {
      console.error("Error fetching customer data:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data customer",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!selectedPackage || !whatsappNumber) {
      toast({
        title: "Error",
        description: "Pilih paket dan masukkan nomor WhatsApp",
        variant: "destructive",
      })
      return
    }

    // Validate WhatsApp number
    const cleanNumber = whatsappNumber.replace(/\D/g, "")
    if (cleanNumber.length < 10) {
      toast({
        title: "Error",
        description: "Nomor WhatsApp tidak valid",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      const selectedPkg = voucherPackages.find((pkg) => pkg.id === selectedPackage)

      // Create order in our system
      const orderResponse = await fetch("/api/mikpos/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          package_id: selectedPackage,
          customer: {
            ...customerData,
            whatsapp: cleanNumber,
          },
          amount: selectedPkg?.price,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Gagal membuat pesanan")
      }

      const orderData = await orderResponse.json()

      // Redirect to payment
      router.push(`/checkout?order_id=${orderData.order_id}&source=mikpos`)
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "Gagal memproses pesanan",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Wifi className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">GARDENS-NET WiFi</h1>
          </div>
          <p className="text-gray-600">
            Selamat datang {customerData?.name || "Customer"}! Pilih paket voucher WiFi Anda
          </p>
          <div className="mt-2 text-sm text-gray-500">
            IP: {customerData?.ip_address} | MAC: {customerData?.mac_address}
          </div>
        </div>

        {/* Voucher Packages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {voucherPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPackage === pkg.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
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
                <CardDescription className="text-2xl font-bold text-blue-600">
                  Rp {pkg.price.toLocaleString("id-ID")}
                </CardDescription>
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
            <CardDescription>Voucher akan dikirim ke nomor WhatsApp ini setelah pembayaran berhasil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="08123456789"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-gray-500">Format: 08123456789 (tanpa +62 atau spasi)</p>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Button */}
        <div className="text-center">
          <Button
            onClick={handlePurchase}
            disabled={!selectedPackage || !whatsappNumber || processing}
            size="lg"
            className="w-full md:w-auto px-8 py-3 text-lg"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Memproses...
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Beli Voucher
                {selectedPackage && (
                  <span className="ml-2">
                    - Rp {voucherPackages.find((p) => p.id === selectedPackage)?.price.toLocaleString("id-ID")}
                  </span>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Voucher akan aktif setelah pembayaran berhasil</p>
          <p>Kode voucher akan dikirim via WhatsApp dalam 1-2 menit</p>
        </div>
      </div>
    </div>
  )
}
