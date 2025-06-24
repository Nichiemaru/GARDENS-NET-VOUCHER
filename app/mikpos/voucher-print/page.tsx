"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Printer,
  Download,
  Share2,
  Copy,
  QrCode,
  Wifi,
  Clock,
  Zap,
  CheckCircle,
  Package,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GeneratedVoucher {
  id: string
  code: string
  profile: string
  price: number
  validity: string
  bandwidth: string
  status: string
  createdAt: string
  createdBy: string
}

export default function VoucherPrintPage() {
  const [vouchers] = useState<GeneratedVoucher[]>([
    {
      id: "voucher_1705312800_0",
      code: "EXPR-240115-A7B9",
      profile: "Express 1 Jam",
      price: 5000,
      validity: "1 hour",
      bandwidth: "10 Mbps",
      status: "unused",
      createdAt: new Date().toISOString(),
      createdBy: "admin",
    },
  ])

  const { toast } = useToast()

  const handlePrint = () => {
    window.print()
    toast({
      title: "Printing Started",
      description: "Voucher sedang dicetak...",
    })
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code Copied!",
      description: `Voucher code ${code} copied to clipboard`,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Generated Vouchers</h1>
            <p className="text-gray-600">Voucher berhasil dibuat dan siap digunakan</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium text-green-800">Voucher Generation Successful!</div>
                <div className="text-sm text-green-600">
                  {vouchers.length} voucher berhasil dibuat dan disimpan ke database
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voucher Cards */}
        <div className="grid gap-6">
          {vouchers.map((voucher) => (
            <Card key={voucher.id} className="print:break-inside-avoid">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center text-blue-600">
                      <Wifi className="h-5 w-5 mr-2" />
                      WiFi Voucher
                    </CardTitle>
                    <CardDescription>
                      Generated on {new Date(voucher.createdAt).toLocaleString("id-ID")}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {voucher.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Voucher Code */}
                <div className="text-center bg-gray-50 p-6 rounded-lg border-2 border-dashed">
                  <div className="text-sm text-gray-600 mb-2">Voucher Code</div>
                  <div className="text-3xl font-bold font-mono text-blue-600 tracking-wider mb-4">{voucher.code}</div>
                  <Button variant="outline" size="sm" onClick={() => handleCopyCode(voucher.code)}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Code
                  </Button>
                </div>

                {/* Voucher Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Profile</div>
                    <div className="font-medium">{voucher.profile}</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="font-medium">{formatPrice(voucher.price)}</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Validity</div>
                    <div className="font-medium">{voucher.validity}</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Bandwidth</div>
                    <div className="font-medium">{voucher.bandwidth}</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-800 mb-2">Cara Menggunakan Voucher:</div>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Connect ke WiFi hotspot</li>
                    <li>Buka browser, akan redirect ke halaman login</li>
                    <li>Masukkan voucher code di atas</li>
                    <li>Klik login dan mulai browsing</li>
                  </ol>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Created by: {voucher.createdBy} • ID: {voucher.id}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <QrCode className="h-3 w-3 mr-1" />
                      QR Code
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Printer className="h-3 w-3 mr-1" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body { margin: 0; }
            .print\\:break-inside-avoid { break-inside: avoid; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  )
}
