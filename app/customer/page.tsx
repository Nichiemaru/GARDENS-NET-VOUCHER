"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Wifi, Phone, Shield, Clock, Zap } from "lucide-react"

// Halaman ini menggantikan landing page bawaan MikPos
export default function CustomerLandingPage() {
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parameter dari MikPos hotspot login
  const macAddress = searchParams.get("mac") || ""
  const ipAddress = searchParams.get("ip") || ""
  const sessionId = searchParams.get("session") || ""

  const validateWhatsApp = (number: string) => {
    const cleaned = number.replace(/\D/g, "")
    return /^(62|08)\d{8,12}$/.test(cleaned)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert("Nama lengkap harus diisi")
      return
    }

    if (!validateWhatsApp(whatsapp)) {
      alert("Format nomor WhatsApp tidak valid. Gunakan format 62xxx atau 08xxx")
      return
    }

    setIsLoading(true)

    // Store customer data dengan info dari MikPos
    sessionStorage.setItem(
      "customerData",
      JSON.stringify({
        name: name.trim(),
        whatsapp: whatsapp.replace(/\D/g, ""),
        macAddress,
        ipAddress,
        sessionId,
        timestamp: new Date().toISOString(),
      }),
    )

    // Redirect ke halaman pembelian voucher
    router.push("/market")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header - Branding GARDENS-NET */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-600 p-4 rounded-full">
              <Wifi className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">GARDENS-NET WiFi</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Selamat datang di hotspot GARDENS-NET! Silakan isi data Anda untuk membeli voucher WiFi. Kode voucher akan
            dikirim langsung ke WhatsApp Anda.
          </p>

          {/* Info dari MikPos */}
          {(macAddress || ipAddress) && (
            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
              <p>
                <strong>Device:</strong> {macAddress}
              </p>
              <p>
                <strong>IP:</strong> {ipAddress}
              </p>
            </div>
          )}
        </div>

        {/* Form Customer Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Data Pembeli</CardTitle>
            <CardDescription className="text-center">
              Isi data Anda untuk melanjutkan pembelian voucher WiFi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="62812345678 atau 08123456789"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">Voucher akan dikirim ke nomor WhatsApp ini</p>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Lanjut Beli Voucher WiFi"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Voucher Packages Preview */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <CardContent className="p-4">
              <Clock className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium">Express 1 Jam</p>
              <p className="text-xs text-gray-500">Rp 5.000</p>
              <Badge variant="outline" className="text-xs mt-1">
                10 Mbps
              </Badge>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <Zap className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <p className="text-sm font-medium">Daily 1 Hari</p>
              <p className="text-xs text-gray-500">Rp 15.000</p>
              <Badge variant="outline" className="text-xs mt-1">
                20 Mbps
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <Wifi className="h-5 w-5 mx-auto text-blue-600" />
            <p className="text-xs text-gray-600">WiFi Cepat</p>
          </div>
          <div className="space-y-2">
            <Phone className="h-5 w-5 mx-auto text-green-600" />
            <p className="text-xs text-gray-600">Via WhatsApp</p>
          </div>
          <div className="space-y-2">
            <Shield className="h-5 w-5 mx-auto text-purple-600" />
            <p className="text-xs text-gray-600">Aman & Mudah</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 GARDENS-NET. Powered by MikPos</p>
        </div>
      </div>
    </div>
  )
}
