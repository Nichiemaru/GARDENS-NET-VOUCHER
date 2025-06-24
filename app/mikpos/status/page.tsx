"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { Wifi, Copy, CheckCircle, Clock, AlertCircle, RefreshCw, Phone, Calendar, User } from "lucide-react"

interface VoucherData {
  code: string
  profile: string
  customer: {
    name: string
    whatsapp: string
    mac_address: string
    ip_address: string
  }
  status: "active" | "used" | "expired"
  created_at: string
  expires_at: string
  order_id: string
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
        title: "Berhasil",
        description: "Kode voucher disalin ke clipboard",
      })
    }
  }

  const refreshStatus = () => {
    setRefreshing(true)
    fetchVoucherStatus()
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
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Terpakai
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Kadaluarsa
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

        {/* Voucher Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Wifi className="h-5 w-5 mr-2" />
                Kode Voucher
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
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
              <code className="text-2xl font-mono font-bold text-blue-600">{voucherData.code}</code>
              <Button variant="outline" size="sm" onClick={copyVoucherCode}>
                <Copy className="h-4 w-4 mr-1" />
                Salin
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Paket</p>
                <p className="font-semibold">{voucherData.profile}</p>
              </div>
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="font-mono text-xs">{voucherData.order_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informasi Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span>{voucherData.customer.name}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span>{voucherData.customer.whatsapp}</span>
            </div>
            <div className="text-xs text-gray-500">
              <p>MAC: {voucherData.customer.mac_address}</p>
              <p>IP: {voucherData.customer.ip_address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Time Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Waktu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-gray-500 text-sm">Dibuat</p>
              <p className="font-semibold">{formatDate(voucherData.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Berlaku hingga</p>
              <p className="font-semibold">{formatDate(voucherData.expires_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Cara Penggunaan</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Hubungkan perangkat Anda ke WiFi <strong>"GARDENS-NET"</strong>
              </li>
              <li>Buka browser dan akan muncul halaman login</li>
              <li>
                Masukkan kode voucher: <code className="bg-gray-100 px-2 py-1 rounded">{voucherData.code}</code>
              </li>
              <li>Klik "Connect" untuk mulai browsing</li>
              <li>Voucher akan aktif sesuai durasi paket yang dipilih</li>
            </ol>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong> Simpan kode voucher ini dengan baik. Jika mengalami masalah, hubungi customer
                service dengan menyertakan Order ID.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
