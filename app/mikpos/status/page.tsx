"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Copy, Wifi, ArrowLeft } from "lucide-react"

interface VoucherStatus {
  code: string
  profile: string
  status: "active" | "used" | "expired"
  created_at: string
  expires_at: string
  customer: {
    name: string
    whatsapp: string
  }
}

export default function MikPosStatus() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")
  const [voucherStatus, setVoucherStatus] = useState<VoucherStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      loadVoucherStatus()
    }
  }, [sessionId])

  const loadVoucherStatus = async () => {
    try {
      // In production, fetch from your API
      // For demo, simulate voucher status
      const mockStatus: VoucherStatus = {
        code: `WIFI-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        profile: "1day",
        status: "active",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        customer: {
          name: "Customer MikPos",
          whatsapp: "628123456789",
        },
      }

      setVoucherStatus(mockStatus)
    } catch (error) {
      console.error("Failed to load voucher status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyVoucherCode = () => {
    if (voucherStatus) {
      navigator.clipboard.writeText(voucherStatus.code)
      alert("Kode voucher berhasil disalin!")
    }
  }

  const getStatusIcon = () => {
    if (!voucherStatus) return <Clock className="h-8 w-8 text-gray-400" />

    switch (voucherStatus.status) {
      case "active":
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case "used":
        return <CheckCircle className="h-8 w-8 text-blue-500" />
      case "expired":
        return <XCircle className="h-8 w-8 text-red-500" />
      default:
        return <Clock className="h-8 w-8 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    if (!voucherStatus) return null

    switch (voucherStatus.status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case "used":
        return <Badge className="bg-blue-100 text-blue-800">Terpakai</Badge>
      case "expired":
        return <Badge variant="destructive">Kadaluarsa</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat status voucher...</p>
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
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div className="flex items-center space-x-2">
                <Wifi className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">Status Voucher</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <CardTitle className="text-2xl">Status Voucher WiFi</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {voucherStatus && (
              <>
                {/* Voucher Code */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Kode Voucher</p>
                      <p className="text-2xl font-mono font-bold">{voucherStatus.code}</p>
                    </div>
                    <Button variant="outline" onClick={copyVoucherCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status and Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge()}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Profil:</span>
                    <span className="font-medium">{voucherStatus.profile}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Dibuat:</span>
                    <span className="font-medium">{new Date(voucherStatus.created_at).toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Berlaku hingga:</span>
                    <span className="font-medium">{new Date(voucherStatus.expires_at).toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Informasi Customer</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama:</span>
                      <span>{voucherStatus.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">WhatsApp:</span>
                      <span>{voucherStatus.customer.whatsapp}</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Cara Penggunaan:</h3>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Hubungkan ke WiFi hotspot</li>
                    <li>2. Buka browser dan masukkan kode voucher</li>
                    <li>3. Klik "Connect" untuk mulai browsing</li>
                  </ol>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
