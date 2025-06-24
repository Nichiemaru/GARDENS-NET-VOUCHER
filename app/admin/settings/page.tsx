"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  MessageSquare,
  Wifi,
  Database,
  Shield,
  Save,
  TestTube,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
} from "lucide-react"

interface ConfigStatus {
  whatsapp: {
    configured: boolean
    tested: boolean
    last_test: string | null
  }
  mikrotik: {
    configured: boolean
    connected: boolean
    last_check: string | null
  }
  mikpos: {
    configured: boolean
    webhook_active: boolean
    last_webhook: string | null
  }
}

interface WhatsAppConfig {
  access_token: string
  phone_number_id: string
  webhook_verify_token: string
  business_account_id: string
  app_id: string
}

interface MikroTikConfig {
  host: string
  username: string
  password: string
  port: string
  ssl_enabled: boolean
}

interface MikPosConfig {
  base_url: string
  api_key: string
  webhook_secret: string
  webhook_url: string
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("whatsapp")
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)

  // WhatsApp Configuration
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({
    access_token: "",
    phone_number_id: "",
    webhook_verify_token: "",
    business_account_id: "",
    app_id: "",
  })

  // MikroTik Configuration
  const [mikrotikConfig, setMikrotikConfig] = useState<MikroTikConfig>({
    host: "192.168.1.1",
    username: "admin",
    password: "",
    port: "8728",
    ssl_enabled: false,
  })

  // MikPos Configuration
  const [mikposConfig, setMikposConfig] = useState<MikPosConfig>({
    base_url: "http://localhost:8080",
    api_key: "",
    webhook_secret: "",
    webhook_url: "",
  })

  // Load current configuration
  useEffect(() => {
    loadConfiguration()
    loadConfigStatus()
  }, [])

  const loadConfiguration = async () => {
    try {
      const response = await fetch("/api/admin/config")
      if (response.ok) {
        const data = await response.json()
        setWhatsappConfig(data.whatsapp || whatsappConfig)
        setMikrotikConfig(data.mikrotik || mikrotikConfig)
        setMikposConfig(data.mikpos || mikposConfig)
      }
    } catch (error) {
      console.error("Failed to load configuration:", error)
    }
  }

  const loadConfigStatus = async () => {
    try {
      const response = await fetch("/api/admin/config/status")
      if (response.ok) {
        const data = await response.json()
        setConfigStatus(data)
      }
    } catch (error) {
      console.error("Failed to load config status:", error)
    }
  }

  const saveConfiguration = async (configType: string, config: any) => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: configType,
          config: config,
        }),
      })

      if (response.ok) {
        alert("Konfigurasi berhasil disimpan!")
        loadConfigStatus()
      } else {
        alert("Gagal menyimpan konfigurasi!")
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("Error menyimpan konfigurasi!")
    } finally {
      setSaving(false)
    }
  }

  const testConfiguration = async (configType: string) => {
    setTesting(true)
    try {
      const response = await fetch(`/api/admin/config/test/${configType}`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        alert(`✅ Test ${configType} berhasil!`)
      } else {
        alert(`❌ Test ${configType} gagal: ${result.error}`)
      }

      loadConfigStatus()
    } catch (error) {
      console.error("Test error:", error)
      alert("Error testing configuration!")
    } finally {
      setTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const generateWebhookToken = () => {
    const token = `gardens-net-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setWhatsappConfig((prev) => ({ ...prev, webhook_verify_token: token }))
  }

  const generateWebhookSecret = () => {
    const secret = `mikpos-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`
    setMikposConfig((prev) => ({ ...prev, webhook_secret: secret }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Settings className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
              <p className="text-gray-600">Konfigurasi integrasi GARDENS-NET</p>
            </div>
          </div>

          {/* Status Overview */}
          {configStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium">WhatsApp</span>
                    </div>
                    <Badge variant={configStatus.whatsapp.configured ? "default" : "secondary"}>
                      {configStatus.whatsapp.configured ? "Configured" : "Not Set"}
                    </Badge>
                  </div>
                  {configStatus.whatsapp.last_test && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last test: {new Date(configStatus.whatsapp.last_test).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wifi className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium">MikroTik</span>
                    </div>
                    <Badge variant={configStatus.mikrotik.configured ? "default" : "secondary"}>
                      {configStatus.mikrotik.configured ? "Configured" : "Not Set"}
                    </Badge>
                  </div>
                  {configStatus.mikrotik.last_check && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last check: {new Date(configStatus.mikrotik.last_check).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="font-medium">MikPos</span>
                    </div>
                    <Badge variant={configStatus.mikpos.configured ? "default" : "secondary"}>
                      {configStatus.mikpos.configured ? "Configured" : "Not Set"}
                    </Badge>
                  </div>
                  {configStatus.mikpos.last_webhook && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last webhook: {new Date(configStatus.mikpos.last_webhook).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="whatsapp" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp API
            </TabsTrigger>
            <TabsTrigger value="mikrotik" className="flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              MikroTik
            </TabsTrigger>
            <TabsTrigger value="mikpos" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              MikPos
            </TabsTrigger>
          </TabsList>

          {/* WhatsApp Configuration */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  WhatsApp Business API Configuration
                </CardTitle>
                <CardDescription>Konfigurasi WhatsApp Business API untuk notifikasi voucher</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Setup Instructions */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Setup WhatsApp Business API:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>
                        Daftar di{" "}
                        <a
                          href="https://business.whatsapp.com/"
                          target="_blank"
                          className="text-blue-600 hover:underline"
                          rel="noreferrer"
                        >
                          WhatsApp Business Platform
                        </a>
                      </li>
                      <li>Buat WhatsApp Business App di Meta Developer Console</li>
                      <li>Dapatkan Phone Number ID dan Access Token</li>
                      <li>Setup webhook URL untuk receive message status</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Access Token */}
                  <div>
                    <Label htmlFor="access_token">Access Token *</Label>
                    <div className="flex mt-1">
                      <Input
                        id="access_token"
                        type={showPasswords ? "text" : "password"}
                        placeholder="EAAxxxxxxxxxxxxxxxxx"
                        value={whatsappConfig.access_token}
                        onChange={(e) => setWhatsappConfig((prev) => ({ ...prev, access_token: e.target.value }))}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Permanent access token dari Meta Developer Console</p>
                  </div>

                  {/* Phone Number ID */}
                  <div>
                    <Label htmlFor="phone_number_id">Phone Number ID *</Label>
                    <Input
                      id="phone_number_id"
                      placeholder="1234567890123456"
                      value={whatsappConfig.phone_number_id}
                      onChange={(e) => setWhatsappConfig((prev) => ({ ...prev, phone_number_id: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Phone Number ID dari WhatsApp Business Platform</p>
                  </div>

                  {/* Webhook Verify Token */}
                  <div>
                    <Label htmlFor="webhook_verify_token">Webhook Verify Token</Label>
                    <div className="flex mt-1">
                      <Input
                        id="webhook_verify_token"
                        placeholder="gardens-net-webhook-token"
                        value={whatsappConfig.webhook_verify_token}
                        onChange={(e) =>
                          setWhatsappConfig((prev) => ({ ...prev, webhook_verify_token: e.target.value }))
                        }
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm" className="ml-2" onClick={generateWebhookToken}>
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Token untuk verifikasi webhook</p>
                  </div>

                  {/* Business Account ID */}
                  <div>
                    <Label htmlFor="business_account_id">Business Account ID</Label>
                    <Input
                      id="business_account_id"
                      placeholder="1234567890123456"
                      value={whatsappConfig.business_account_id}
                      onChange={(e) => setWhatsappConfig((prev) => ({ ...prev, business_account_id: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">WhatsApp Business Account ID (optional)</p>
                  </div>
                </div>

                {/* Webhook URL */}
                <div>
                  <Label>Webhook URL</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      value={`${process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"}/api/whatsapp/webhook`}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() =>
                        copyToClipboard(
                          `${process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"}/api/whatsapp/webhook`,
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => window.open("https://developers.facebook.com/apps/", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Copy URL ini ke Meta Developer Console webhook settings</p>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button onClick={() => testConfiguration("whatsapp")} disabled={testing} variant="outline">
                    {testing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                        <span>Testing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <TestTube className="h-4 w-4 mr-2" />
                        <span>Test Connection</span>
                      </div>
                    )}
                  </Button>

                  <Button onClick={() => saveConfiguration("whatsapp", whatsappConfig)} disabled={saving}>
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        <span>Save Configuration</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MikroTik Configuration */}
          <TabsContent value="mikrotik">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  MikroTik RouterOS Configuration
                </CardTitle>
                <CardDescription>Konfigurasi koneksi ke MikroTik RouterOS untuk generate voucher</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Host */}
                  <div>
                    <Label htmlFor="mikrotik_host">Router IP Address *</Label>
                    <Input
                      id="mikrotik_host"
                      placeholder="192.168.1.1"
                      value={mikrotikConfig.host}
                      onChange={(e) => setMikrotikConfig((prev) => ({ ...prev, host: e.target.value }))}
                    />
                  </div>

                  {/* Port */}
                  <div>
                    <Label htmlFor="mikrotik_port">API Port</Label>
                    <Input
                      id="mikrotik_port"
                      placeholder="8728"
                      value={mikrotikConfig.port}
                      onChange={(e) => setMikrotikConfig((prev) => ({ ...prev, port: e.target.value }))}
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <Label htmlFor="mikrotik_username">Username *</Label>
                    <Input
                      id="mikrotik_username"
                      placeholder="admin"
                      value={mikrotikConfig.username}
                      onChange={(e) => setMikrotikConfig((prev) => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="mikrotik_password">Password *</Label>
                    <Input
                      id="mikrotik_password"
                      type={showPasswords ? "text" : "password"}
                      placeholder="router-password"
                      value={mikrotikConfig.password}
                      onChange={(e) => setMikrotikConfig((prev) => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>

                {/* SSL Option */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ssl_enabled"
                    checked={mikrotikConfig.ssl_enabled}
                    onCheckedChange={(checked) => setMikrotikConfig((prev) => ({ ...prev, ssl_enabled: checked }))}
                  />
                  <Label htmlFor="ssl_enabled">Enable SSL/TLS Connection</Label>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button onClick={() => testConfiguration("mikrotik")} disabled={testing} variant="outline">
                    {testing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                        <span>Testing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <TestTube className="h-4 w-4 mr-2" />
                        <span>Test Connection</span>
                      </div>
                    )}
                  </Button>

                  <Button onClick={() => saveConfiguration("mikrotik", mikrotikConfig)} disabled={saving}>
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        <span>Save Configuration</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MikPos Configuration */}
          <TabsContent value="mikpos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  MikPos Integration Configuration
                </CardTitle>
                <CardDescription>Konfigurasi integrasi dengan MikPos untuk webhook dan API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Base URL */}
                  <div>
                    <Label htmlFor="mikpos_base_url">MikPos Base URL *</Label>
                    <Input
                      id="mikpos_base_url"
                      placeholder="http://localhost:8080"
                      value={mikposConfig.base_url}
                      onChange={(e) => setMikposConfig((prev) => ({ ...prev, base_url: e.target.value }))}
                    />
                  </div>

                  {/* API Key */}
                  <div>
                    <Label htmlFor="mikpos_api_key">API Key *</Label>
                    <Input
                      id="mikpos_api_key"
                      type={showPasswords ? "text" : "password"}
                      placeholder="mikpos-api-key-here"
                      value={mikposConfig.api_key}
                      onChange={(e) => setMikposConfig((prev) => ({ ...prev, api_key: e.target.value }))}
                    />
                  </div>

                  {/* Webhook Secret */}
                  <div>
                    <Label htmlFor="mikpos_webhook_secret">Webhook Secret</Label>
                    <div className="flex mt-1">
                      <Input
                        id="mikpos_webhook_secret"
                        type={showPasswords ? "text" : "password"}
                        placeholder="webhook-secret-key"
                        value={mikposConfig.webhook_secret}
                        onChange={(e) => setMikposConfig((prev) => ({ ...prev, webhook_secret: e.target.value }))}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={generateWebhookSecret}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Token untuk verifikasi webhook</p>
                  </div>

                  {/* Webhook URL */}
                  <div>
                    <Label>Webhook URL (untuk MikPos)</Label>
                    <div className="flex items-center mt-1">
                      <Input
                        value={`${process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"}/api/mikpos/webhook`}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() =>
                          copyToClipboard(
                            `${process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"}/api/mikpos/webhook`,
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Copy URL ini ke konfigurasi webhook MikPos</p>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button onClick={() => testConfiguration("mikpos")} disabled={testing} variant="outline">
                    {testing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                        <span>Testing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <TestTube className="h-4 w-4 mr-2" />
                        <span>Test Connection</span>
                      </div>
                    )}
                  </Button>

                  <Button onClick={() => saveConfiguration("mikpos", mikposConfig)} disabled={saving}>
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        <span>Save Configuration</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
