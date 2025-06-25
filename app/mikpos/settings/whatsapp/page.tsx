"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  MessageCircle,
  Settings,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Copy,
  Send,
  Loader2,
  ExternalLink,
  Shield,
  Key,
  Globe,
  Zap,
  BarChart3,
  FileText,
  Smartphone,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  appId: string
  webhookVerifyToken: string
  webhookUrl: string
  enabled: boolean
}

interface WhatsAppStatus {
  connection: "connected" | "disconnected" | "error"
  phoneNumber: string
  businessName: string
  lastCheck: string
  messagesSent: number
  messagesDelivered: number
  messagesRead: number
  messagesFailed: number
}

export default function WhatsAppSettings() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    accessToken: "",
    phoneNumberId: "",
    businessAccountId: "",
    appId: "",
    webhookVerifyToken: "",
    webhookUrl: "",
    enabled: false,
  })

  const [status, setStatus] = useState<WhatsAppStatus>({
    connection: "disconnected",
    phoneNumber: "",
    businessName: "",
    lastCheck: "",
    messagesSent: 0,
    messagesDelivered: 0,
    messagesRead: 0,
    messagesFailed: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testNumber, setTestNumber] = useState("")
  const [testMessage, setTestMessage] = useState("")
  const [setupStep, setSetupStep] = useState(1)
  const [showSetupWizard, setShowSetupWizard] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Generate webhook URL safely on client only
  const webhookUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/whatsapp/webhook`
    }
    return ""
  }, [])

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration()
    checkStatus()
  }, [])

  const loadConfiguration = async () => {
    try {
      const response = await fetch("/api/admin/config/whatsapp")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Failed to load WhatsApp config:", error)
    }
  }

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/whatsapp/status")
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Failed to check WhatsApp status:", error)
    }
  }

  const handleSaveConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/config/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Configuration Saved! ✅",
          description: "WhatsApp settings have been updated successfully",
        })
        await checkStatus()
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (error) {
      toast({
        title: "Save Failed ❌",
        description: "Failed to save WhatsApp configuration",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Connection Test Successful! 🎉",
          description: `Connected to ${result.businessName} (${result.phoneNumber})`,
        })
        setStatus((prev) => ({
          ...prev,
          connection: "connected",
          phoneNumber: result.phoneNumber,
          businessName: result.businessName,
          lastCheck: new Date().toISOString(),
        }))
      } else {
        throw new Error(result.error || "Connection test failed")
      }
    } catch (error) {
      toast({
        title: "Connection Test Failed ❌",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
    setIsTesting(false)
  }

  const handleSendTestMessage = async () => {
    if (!testNumber || !testMessage) {
      toast({
        title: "Missing Information",
        description: "Please enter both phone number and message",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testNumber,
          message: testMessage,
          voucher: {
            code: "TEST-" + Date.now().toString().slice(-6),
            profile: "Test Message",
            bandwidth: "Test",
            validity: "Test",
          },
          customer: {
            name: "Test User",
            whatsapp: testNumber,
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Test Message Sent! 📱",
          description: `Message sent successfully to ${testNumber}`,
        })
        setStatus((prev) => ({
          ...prev,
          messagesSent: prev.messagesSent + 1,
        }))
      } else {
        throw new Error("Failed to send test message")
      }
    } catch (error) {
      toast({
        title: "Send Failed ❌",
        description: "Failed to send test message",
        variant: "destructive",
      })
    }
    setIsTesting(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { color: "bg-green-500", icon: CheckCircle, text: "Connected" },
      disconnected: { color: "bg-red-500", icon: AlertTriangle, text: "Disconnected" },
      error: { color: "bg-red-500", icon: AlertTriangle, text: "Error" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  const generateWebhookUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/whatsapp/webhook`
    }
    return ""
  }

  const generateVerifyToken = () => {
    return `whatsapp_verify_${Math.random().toString(36).substring(2, 15)}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-600 p-2 rounded-lg mr-3">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Integration</h1>
              <p className="text-sm text-gray-600">Configure WhatsApp Business API for voucher delivery</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowSetupWizard(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Setup Wizard
            </Button>
            <Button onClick={() => router.push("/mikpos/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>

        {/* Status Overview */}
        {/* ... (tidak berubah) ... */}

        {/* Main Configuration */}
        <Tabs defaultValue="config" className="space-y-4">
          {/* ... (tidak berubah) ... */}
          <TabsContent value="config">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API Configuration */}
              {/* ... (tidak berubah) ... */}

              {/* Webhook Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-purple-600" />
                    Webhook Configuration
                  </CardTitle>
                  <CardDescription>Setup webhook for message status updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="webhook-url"
                        value={config.webhookUrl || webhookUrl}
                        onChange={(e) => setConfig((prev) => ({ ...prev, webhookUrl: e.target.value }))}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(config.webhookUrl || webhookUrl)
                            toast({ title: "Copied!", description: "Webhook URL copied to clipboard" })
                          } else {
                            toast({ title: "Copy Failed", description: "Clipboard API not available", variant: "destructive" })
                          }
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Use this URL in Facebook Developer Console → Webhooks</p>
                  </div>
                  {/* ... (tidak berubah) ... */}
                </CardContent>
              </Card>
            </div>
            {/* ... (tidak berubah) ... */}
          </TabsContent>
          {/* ... (tidak berubah) ... */}
        </Tabs>

        {/* Setup Wizard Dialog */}
        <Dialog open={showSetupWizard} onOpenChange={setShowSetupWizard}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-600" />
                WhatsApp Setup Wizard
              </DialogTitle>
              <DialogDescription>Step-by-step guide to configure WhatsApp Business API</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Progress */}
              {/* ... (tidak berubah) ... */}

              {/* Step Content */}
              {setupStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 1: Create Facebook App</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      First, you need to create a Facebook App with WhatsApp Business API access.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Instructions:</p>
                      <ol className="text-sm space-y-1 list-decimal list-inside">
                        <li>Go to Facebook Developer Console</li>
                        <li>Create a new app → Business type</li>
                        <li>Add WhatsApp product to your app</li>
                        <li>Complete business verification</li>
                      </ol>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.open("https://developers.facebook.com/apps", "_blank")
                        }
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Facebook Developer Console
                    </Button>
                  </div>
                </div>
              )}
              {/* ... (langkah-langkah wizard lain tidak berubah, gunakan generateWebhookUrl() yang sudah aman) ... */}
              {setupStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 3: Configure Webhook</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Setup webhook to receive message status updates.</p>
                    <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Webhook Settings:</p>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>URL:</strong> {webhookUrl}
                        </div>
                        <div>
                          <strong>Verify Token:</strong> {config.webhookVerifyToken || "Generate token first"}
                        </div>
                        <div>
                          <strong>Fields:</strong> messages, message_deliveries, message_reads
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* ... (navigasi wizard tidak berubah) ... */}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
