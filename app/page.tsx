"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wifi, Phone, Shield } from "lucide-react"

export default function EntryGate() {
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateWhatsApp = (number: string) => {
    // Remove all non-digits
    const cleaned = number.replace(/\D/g, "")
    // Check if starts with 62 or 08 and has appropriate length
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

    // Store user data in session
    sessionStorage.setItem(
      "userData",
      JSON.stringify({
        name: name.trim(),
        whatsapp: whatsapp.replace(/\D/g, ""),
      }),
    )

    // Redirect to market
    router.push("/market")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-600 p-4 rounded-full">
              <Wifi className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Selamat Datang di GARDENS-NET</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Silakan masukkan nama dan nomor WhatsApp Anda untuk melanjutkan. Kode voucher akan dikirimkan langsung ke
            nomor Anda setelah pembayaran berhasil.
          </p>
        </div>

        {/* Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Data Pembeli</CardTitle>
            <CardDescription className="text-center">Isi data Anda untuk melanjutkan berbelanja</CardDescription>
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
                <p className="text-xs text-gray-500">Format: 62xxx atau 08xxx</p>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Lanjut Berbelanja"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin Login Link */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/login")}
            className="text-gray-500 hover:text-gray-700"
          >
            <Shield className="h-4 w-4 mr-2" />
            Login Admin
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-2">
            <Wifi className="h-6 w-6 mx-auto text-blue-600" />
            <p className="text-sm text-gray-600">Voucher WiFi</p>
          </div>
          <div className="space-y-2">
            <Phone className="h-6 w-6 mx-auto text-green-600" />
            <p className="text-sm text-gray-600">Pulsa & Kuota</p>
          </div>
        </div>
      </div>
    </div>
  )
}
