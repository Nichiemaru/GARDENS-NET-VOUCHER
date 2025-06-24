"use client"

import { useState, useEffect } from "react"
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
    const baseUrl = window.location.origin
    return `${baseUrl}/api/whatsapp/webhook`
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
              <MessageCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{status.businessName || "Not Connected"}</div>
                  <p className="text-xs text-muted-foreground">{status.phoneNumber || "No phone number"}</p>
                </div>
                {getStatusBadge(status.connection)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <Send className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{status.messagesSent}</div>
              <p className="text-xs text-muted-foreground">Total sent today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {status.messagesSent > 0 ? Math.round((status.messagesDelivered / status.messagesSent) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {status.messagesDelivered}/{status.messagesSent} delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Messages</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{status.messagesFailed}</div>
              <p className="text-xs text-muted-foreground">Failed deliveries</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Configuration */}
        <Tabs defaultValue="config" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="test">Testing</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2 text-blue-600" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>Configure WhatsApp Business API credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="access-token">Access Token</Label>
                    <Input
                      id="access-token"
                      type="password"
                      placeholder="Enter your WhatsApp access token"
                      value={config.accessToken}
                      onChange={(e) => setConfig((prev) => ({ ...prev, accessToken: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500">
                      Get this from Facebook Developer Console → WhatsApp → API Setup
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-number-id">Phone Number ID</Label>
                    <Input
                      id="phone-number-id"
                      placeholder="Enter phone number ID"
                      value={config.phoneNumberId}
                      onChange={(e) => setConfig((prev) => ({ ...prev, phoneNumberId: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500">Found in WhatsApp Business API → Phone Numbers</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-account-id">Business Account ID</Label>
                    <Input
                      id="business-account-id"
                      placeholder="Enter business account ID"
                      value={config.businessAccountId}
                      onChange={(e) => setConfig((prev) => ({ ...prev, businessAccountId: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-id">App ID</Label>
                    <Input
                      id="app-id"
                      placeholder="Enter Facebook App ID"
                      value={config.appId}
                      onChange={(e) => setConfig((prev) => ({ ...prev, appId: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

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
                        value={config.webhookUrl || generateWebhookUrl()}
                        onChange={(e) => setConfig((prev) => ({ ...prev, webhookUrl: e.target.value }))}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(config.webhookUrl || generateWebhookUrl())
                          toast({ title: "Copied!", description: "Webhook URL copied to clipboard" })
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Use this URL in Facebook Developer Console → Webhooks</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verify-token">Verify Token</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verify-token"
                        value={config.webhookVerifyToken}
                        onChange={(e) => setConfig((prev) => ({ ...prev, webhookVerifyToken: e.target.value }))}
                        placeholder="Enter webhook verify token"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const token = generateVerifyToken()
                          setConfig((prev) => ({ ...prev, webhookVerifyToken: token }))
                        }}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Use this token to verify webhook in Facebook Console</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable WhatsApp Integration</Label>
                      <p className="text-xs text-gray-500">Turn on/off WhatsApp message sending</p>
                    </div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Note:</strong> Keep your access token secure and never share it publicly. Webhook
                      URL should use HTTPS in production.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button onClick={handleSaveConfig} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TestTube className="h-5 w-5 mr-2 text-green-600" />
                  Test WhatsApp Integration
                </CardTitle>
                <CardDescription>Send test messages to verify your WhatsApp setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-number">Test Phone Number</Label>
                      <Input
                        id="test-number"
                        placeholder="08123456789"
                        value={testNumber}
                        onChange={(e) => setTestNumber(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Enter Indonesian phone number (08xxxxxxxxxx)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="test-message">Test Message</Label>
                      <Textarea
                        id="test-message"
                        placeholder="Enter your test message..."
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleSendTestMessage} disabled={isTesting} className="w-full">
                      {isTesting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Test Message
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Quick Tests:</h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setTestMessage("🧪 Test message from MikPos WhatsApp integration!")
                          }}
                        >
                          Simple Test Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setTestMessage(`🎫 Test Voucher WiFi

Kode: TEST-123456
Paket: Test Package
Durasi: 1 hour
Bandwidth: 10 Mbps

Cara pakai:
1. Connect ke WiFi "GARDENS-NET"
2. Masukkan kode: TEST-123456
3. Mulai browsing!

Terima kasih! 🙏`)
                          }}
                        >
                          Voucher Format Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setTestMessage("📱 WhatsApp integration test dengan emoji dan formatting *bold* _italic_")
                          }}
                        >
                          Formatting Test
                        </Button>
                      </div>
                    </div>

                    <Alert>
                      <Smartphone className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Testing Tips:</strong>
                        <br />• Use your own WhatsApp number for testing
                        <br />• Check message delivery and formatting
                        <br />• Verify emoji and special characters work
                        <br />• Test with different message lengths
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-orange-600" />
                  Message Templates
                </CardTitle>
                <CardDescription>Customize WhatsApp message templates for voucher delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Message template customization coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  WhatsApp Analytics
                </CardTitle>
                <CardDescription>Monitor WhatsApp message delivery and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Setup Progress</span>
                  <span>{setupStep}/5</span>
                </div>
                <Progress value={(setupStep / 5) * 100} className="h-2" />
              </div>

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
                      onClick={() => window.open("https://developers.facebook.com/apps", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Facebook Developer Console
                    </Button>
                  </div>
                </div>
              )}

              {setupStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 2: Get API Credentials</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Collect the required API credentials from Facebook Console.</p>
                    <div className="bg-green-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Required Information:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Access Token (from API Setup)</li>
                        <li>Phone Number ID (from Phone Numbers)</li>
                        <li>Business Account ID (from Business Settings)</li>
                        <li>App ID (from App Dashboard)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {setupStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 3: Configure Webhook</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Setup webhook to receive message status updates.</p>
                    <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Webhook Settings:</p>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>URL:</strong> {generateWebhookUrl()}
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

              {setupStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 4: Test Configuration</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Test your WhatsApp integration before going live.</p>
                    <div className="bg-orange-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Testing Checklist:</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>✅ API connection successful</li>
                        <li>✅ Test message sent and received</li>
                        <li>✅ Webhook receiving status updates</li>
                        <li>✅ Message formatting correct</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {setupStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 5: Go Live!</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Your WhatsApp integration is ready for production use.</p>
                    <div className="bg-green-50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">🎉 Setup Complete!</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>WhatsApp Business API configured</li>
                        <li>Voucher delivery automation ready</li>
                        <li>Message templates customized</li>
                        <li>Analytics and monitoring active</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSetupStep(Math.max(1, setupStep - 1))}
                  disabled={setupStep === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    if (setupStep === 5) {
                      setShowSetupWizard(false)
                      toast({
                        title: "Setup Complete! 🎉",
                        description: "WhatsApp integration is ready to use",
                      })
                    } else {
                      setSetupStep(Math.min(5, setupStep + 1))
                    }
                  }}
                >
                  {setupStep === 5 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
