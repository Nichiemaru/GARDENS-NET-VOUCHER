"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import {
  Wifi,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Phone,
  Calendar,
  User,
  ExternalLink,
  QrCode,
  Activity,
} from "lucide-react"

interface VoucherData {
  code: string
  profile: string
  customer: {
    name: string
    whatsapp: string
    mac_address: string
    ip_address: string
    hotspot_info: {
      login_url: string
      server_name: string
    }
  }
  status: "active" | "used" | "expired" | "disabled"
  created_at: string
  expires_at: string
  order_id: string
  package_info: {
    name: string
    duration: string
    bandwidth: string
    price: number
  }
  usage_stats?: {
    bytes_in: number
    bytes_out: number
    session_time: string
    last_seen?: string
  }
}

export default function MikPosStatusPage() {
  const searchParams = useSearchParams()
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const voucherCode = searchParams.get("code")
  const orderId = searchParams.get("order")

  useEffect(() => {
    if (voucherCode || orderId) {
      fetchVoucherStatus()
    } else {
      setLoading(false)
    }
  }, [voucherCode, orderId])

  const fetchVoucherStatus = async () => {
    try {
      const params = new URLSearchParams()
      if (voucherCode) params.append("code", voucherCode)
      if (orderId) params.append("order_id", orderId)

      const response = await fetch(`/api/mikpos/voucher/status?${params}`)
      if (!response.ok) {
        throw new Error("Voucher tidak ditemukan")
      }

      const data = await response.json()
      setVoucherData(data.voucher)
    } catch (error) {
      console.error("Error fetching voucher:", error)
      toast({
        title: "Error",
        description: "Gagal memuat status voucher",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const copyVoucherCode = () => {
    if (voucherData?.code) {
      navigator.clipboard.writeText(voucherData.code)
      toast({
        title: "Berhasil!",
        description: "Kode voucher disalin ke clipboard",
      })
    }
  }

  const refreshStatus = () => {
    setRefreshing(true)
    fetchVoucherStatus()
  }

  const goToHotspotLogin = () => {
    if (voucherData?.customer.hotspot_info.login_url) {
      window.open(voucherData.customer.hotspot_info.login_url, "_blank")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aktif
          </Badge>
        )
      case "used":
        return (
          <Badge className="bg-blue-500">
            <Activity className="h-3 w-3 mr-1" />
            Sedang Digunakan
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Kadaluarsa
          </Badge>
        )
      case "disabled":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Nonaktif
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!voucherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <CardTitle>Voucher Tidak Ditemukan</CardTitle>
              <CardDescription>Voucher dengan kode atau order ID yang Anda cari tidak ditemukan</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => (window.location.href = "/")}>Kembali ke Beranda</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Wifi className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Status Voucher WiFi</h1>
          </div>
        </div>

        {/* Voucher Code Display - Prominent */}
        <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-blue-800">
                <Wifi className="h-5 w-5 mr-2" />
                Kode Voucher WiFi
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(voucherData.status)}
                <Button variant="outline" size="sm" onClick={refreshStatus} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Large Voucher Code */}
            <div className="bg-white rounded-lg p-6 mb-4 border-2 border-dashed border-blue-300">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">KODE VOUCHER</p>
                <div className="flex items-center justify-center gap-4">
                  <code className="text-3xl font-mono font-bold text-blue-600 tracking-wider">{voucherData.code}</code>
                  <Button variant="outline" onClick={copyVoucherCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Package Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600">Paket</p>
                <p className="font-bold text-blue-700">{voucherData.package_info.name}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600">Durasi</p>
                <p className="font-bold text-green-700">{voucherData.package_info.duration}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600">Bandwidth</p>
                <p className="font-bold text-purple-700">{voucherData.package_info.bandwidth}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-gray-600">Harga</p>
                <p className="font-bold text-orange-700">{formatPrice(voucherData.package_info.price)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        {voucherData.usage_stats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Statistik Penggunaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Data Download</p>
                  <p className="font-semibold text-green-600">{formatBytes(voucherData.usage_stats.bytes_in)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Data Upload</p>
                  <p className="font-semibold text-blue-600">{formatBytes(voucherData.usage_stats.bytes_out)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Waktu Sesi</p>
                  <p className="font-semibold text-purple-600">{voucherData.usage_stats.session_time}</p>
                </div>
                <div>
                  <p className="text-gray-600">Terakhir Aktif</p>
                  <p className="font-semibold text-orange-600">
                    {voucherData.usage_stats.last_seen ? formatDate(voucherData.usage_stats.last_seen) : "Belum pernah"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informasi Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span>{voucherData.customer.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{voucherData.customer.whatsapp}</span>
              </div>
            </div>
            <Separator />
            <div className="text-xs text-gray-500 space-y-1">
              <p>MAC Address: {voucherData.customer.mac_address}</p>
              <p>IP Address: {voucherData.customer.ip_address}</p>
              <p>Server: {voucherData.customer.hotspot_info.server_name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Time Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Informasi Waktu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Dibuat:</span>
              <span className="font-semibold">{formatDate(voucherData.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Berlaku hingga:</span>
              <span className="font-semibold">{formatDate(voucherData.expires_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-xs">{voucherData.order_id}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Action - Go to Hotspot Login */}
          <Button onClick={goToHotspotLogin} className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700" size="lg">
            <ExternalLink className="h-5 w-5 mr-2" />
            Buka Halaman Login Hotspot
          </Button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => window.print()}>
              <QrCode className="h-4 w-4 mr-2" />
              Print Voucher
            </Button>
            <Button variant="outline" onClick={refreshStatus} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cara Menggunakan Voucher</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Klik tombol <strong>"Buka Halaman Login Hotspot"</strong> di atas
              </li>
              <li>
                Masukkan kode voucher:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-blue-600 font-mono">{voucherData.code}</code>
              </li>
              <li>Klik "Connect" atau "Login" untuk mulai browsing</li>
              <li>Voucher akan aktif sesuai durasi paket yang dipilih</li>
            </ol>

            <Alert className="mt-4">
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                <strong>Catatan:</strong> Simpan kode voucher ini dengan baik. Jika mengalami masalah, hubungi customer
                service dengan menyertakan Order ID: <code className="font-mono">{voucherData.order_id}</code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
