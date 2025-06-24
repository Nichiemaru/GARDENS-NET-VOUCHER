"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Phone, Send, CheckCircle, XCircle, AlertTriangle, Settings, MessageSquare } from "lucide-react"

interface TestResult {
  success: boolean
  test?: {
    type: string
    description: string
    result: string
    voucher_code?: string
  }
  environment?: {
    has_access_token: boolean
    has_phone_number_id: boolean
    has_webhook_token: boolean
  }
  error?: string
  missing?: string[]
}

export default function WhatsAppTestPage() {
  const [phoneNumber, setPhoneNumber] = useState("628123456789")
  const [testType, setTestType] = useState("connection")
  const [customMessage, setCustomMessage] = useState("")
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const runTest = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: customMessage,
          test_type: testType,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Network error or server unavailable",
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />
  }

  const getEnvironmentStatus = () => {
    if (!result?.environment) return null

    const { has_access_token, has_phone_number_id, has_webhook_token } = result.environment

    return (
      <div className="space-y-2">
        <h4 className="font-medium">Environment Variables Status:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span>WHATSAPP_ACCESS_TOKEN:</span>
            <Badge variant={has_access_token ? "default" : "destructive"}>
              {has_access_token ? "✅ Set" : "❌ Missing"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>WHATSAPP_PHONE_NUMBER_ID:</span>
            <Badge variant={has_phone_number_id ? "default" : "destructive"}>
              {has_phone_number_id ? "✅ Set" : "❌ Missing"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>WHATSAPP_WEBHOOK_VERIFY_TOKEN:</span>
            <Badge variant={has_webhook_token ? "default" : "destructive"}>
              {has_webhook_token ? "✅ Set" : "❌ Missing"}
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp API Test</h1>
          </div>
          <p className="text-gray-600">Test WhatsApp Business API integration untuk GARDENS-NET</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Test Configuration
              </CardTitle>
              <CardDescription>Configure dan jalankan test WhatsApp API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phone Number */}
              <div>
                <Label htmlFor="phone">Nomor WhatsApp Target</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="628123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Format: 628xxxxxxxxx (tanpa +)</p>
              </div>

              {/* Test Type */}
              <div>
                <Label htmlFor="testType">Jenis Test</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connection">Connection Test</SelectItem>
                    <SelectItem value="simple_message">Simple Message</SelectItem>
                    <SelectItem value="voucher_notification">Voucher Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Message */}
              {testType === "simple_message" && (
                <div>
                  <Label htmlFor="message">Custom Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Masukkan pesan custom..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Test Button */}
              <Button onClick={runTest} disabled={testing} className="w-full" size="lg">
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Run Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Test Results
              </CardTitle>
              <CardDescription>Hasil test WhatsApp API integration</CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Jalankan test untuk melihat hasil</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Overall Status */}
                  <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <div className="flex items-center">
                      {getStatusIcon(result.success)}
                      <AlertDescription className="ml-2">
                        <strong>{result.success ? "Test Berhasil" : "Test Gagal"}</strong>
                        {result.error && <p className="mt-1 text-sm">{result.error}</p>}
                      </AlertDescription>
                    </div>
                  </Alert>

                  {/* Missing Environment Variables */}
                  {result.missing && result.missing.length > 0 && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription>
                        <strong>Environment Variables Hilang:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {result.missing.map((env) => (
                            <li key={env} className="text-sm">
                              {env}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Test Details */}
                  {result.test && (
                    <div className="space-y-3">
                      <Separator />
                      <div>
                        <h4 className="font-medium">{result.test.type}</h4>
                        <p className="text-sm text-gray-600">{result.test.description}</p>
                        <p className="text-sm mt-1">{result.test.result}</p>
                        {result.test.voucher_code && (
                          <p className="text-xs text-gray-500 mt-1">Voucher Code: {result.test.voucher_code}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Environment Status */}
                  {result.environment && (
                    <>
                      <Separator />
                      {getEnvironmentStatus()}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Setup WhatsApp Business API</CardTitle>
            <CardDescription>Langkah-langkah untuk mengaktifkan WhatsApp integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Buat WhatsApp Business Account</h4>
                <p className="text-sm text-gray-600">
                  Daftar di{" "}
                  <a
                    href="https://business.whatsapp.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    WhatsApp Business Platform
                  </a>
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Setup Environment Variables</h4>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  <p>WHATSAPP_ACCESS_TOKEN=your_access_token_here</p>
                  <p>WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here</p>
                  <p>WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. Verifikasi Nomor WhatsApp</h4>
                <p className="text-sm text-gray-600">
                  Pastikan nomor WhatsApp bisnis Anda sudah diverifikasi dan approved untuk mengirim pesan.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">4. Test Integration</h4>
                <p className="text-sm text-gray-600">
                  Gunakan form di atas untuk test koneksi dan pengiriman pesan sebelum production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
