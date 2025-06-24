"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, Play, RefreshCw } from "lucide-react"

interface TestResult {
  test: string
  success: boolean
  status?: number
  webhook_response?: any
  test_data?: any
  results?: any[]
  session_id?: string
  redirect_url?: string
  error?: string
}

export default function MikPosTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState("voucher_purchase_request")
  const [customData, setCustomData] = useState("")

  const testTypes = [
    {
      value: "voucher_purchase_request",
      label: "Voucher Purchase Request",
      description: "Test customer requesting voucher from hotspot",
    },
    { value: "customer_redirect", label: "Customer Redirect", description: "Test customer redirect to website" },
    { value: "payment_notification", label: "Payment Notification", description: "Test payment status webhook" },
    { value: "full_flow", label: "Full Flow Test", description: "Test complete integration flow" },
  ]

  const runTest = async (testType: string) => {
    setIsLoading(true)
    try {
      let testData = {}

      if (customData.trim()) {
        try {
          testData = JSON.parse(customData)
        } catch (e) {
          alert("Invalid JSON in custom data")
          setIsLoading(false)
          return
        }
      }

      const response = await fetch("/api/mikpos/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testType,
          customData: testData,
        }),
      })

      const result = await response.json()

      setTestResults((prev) => [
        {
          ...result,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ])
    } catch (error) {
      setTestResults((prev) => [
        {
          test: testType,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (success: boolean) => {
    return <Badge variant={success ? "default" : "destructive"}>{success ? "SUCCESS" : "FAILED"}</Badge>
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MikPos Webhook Testing</h1>
        <p className="text-muted-foreground">Test MikPos integration webhooks with sample data and monitor responses</p>
      </div>

      <Tabs defaultValue="test" className="space-y-6">
        <TabsList>
          <TabsTrigger value="test">Run Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Select test type and configure custom data if needed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Test Type</label>
                <Select value={selectedTest} onValueChange={setSelectedTest}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map((test) => (
                      <SelectItem key={test.value} value={test.value}>
                        <div>
                          <div className="font-medium">{test.label}</div>
                          <div className="text-xs text-muted-foreground">{test.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Custom Test Data (Optional JSON)</label>
                <Textarea
                  placeholder={`{
  "customer": {
    "name": "Custom Customer",
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "ip_address": "192.168.1.100"
  },
  "requested_profile": "1day"
}`}
                  value={customData}
                  onChange={(e) => setCustomData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => runTest(selectedTest)} disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Run Test
                </Button>

                <Button variant="outline" onClick={() => runTest("full_flow")} disabled={isLoading}>
                  <Clock className="h-4 w-4 mr-2" />
                  Run Full Flow
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tests</CardTitle>
              <CardDescription>Run common test scenarios with predefined data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testTypes.map((test) => (
                  <Button
                    key={test.value}
                    variant="outline"
                    onClick={() => runTest(test.value)}
                    disabled={isLoading}
                    className="h-auto p-4 text-left justify-start"
                  >
                    <div>
                      <div className="font-medium">{test.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{test.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Test Results</h2>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>

          {testResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No test results yet. Run some tests to see results here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.success)}
                        <CardTitle className="text-lg">{result.test}</CardTitle>
                        {getStatusBadge(result.success)}
                      </div>
                      <div className="text-sm text-muted-foreground">{new Date(result.timestamp).toLocaleString()}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-red-800 font-medium">Error:</p>
                        <p className="text-red-700">{result.error}</p>
                      </div>
                    )}

                    {result.webhook_response && (
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium mb-2">Webhook Response:</p>
                          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                            {JSON.stringify(result.webhook_response, null, 2)}
                          </pre>
                        </div>

                        {result.redirect_url && (
                          <div>
                            <p className="font-medium mb-2">Generated Redirect URL:</p>
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                              <a
                                href={result.redirect_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                              >
                                {result.redirect_url}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {result.results && (
                      <div>
                        <p className="font-medium mb-2">Flow Steps:</p>
                        <div className="space-y-2">
                          {result.results.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              {getStatusIcon(step.success)}
                              <span className="font-medium">Step {step.step}:</span>
                              <span>{step.name}</span>
                              {getStatusBadge(step.success)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.test_data && (
                      <details className="mt-4">
                        <summary className="font-medium cursor-pointer">Test Data Used</summary>
                        <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto mt-2">
                          {JSON.stringify(result.test_data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MikPos Integration Documentation</CardTitle>
              <CardDescription>Understanding the webhook integration flow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Integration Flow</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Customer accesses MikroTik hotspot login page</li>
                  <li>Customer clicks "Buy Voucher" menu → MikPos detects</li>
                  <li>MikPos sends webhook to GARDENS-NET</li>
                  <li>GARDENS-NET generates session → Redirects customer to website</li>
                  <li>Customer selects package → Inputs WhatsApp → Checkout</li>
                  <li>Payment success → Generate voucher in MikroTik</li>
                  <li>Send voucher via WhatsApp → Update status</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Webhook Endpoints</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <code>POST /api/mikpos/webhook</code> - Main webhook receiver
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <code>GET /api/mikpos/session/[sessionId]</code> - Get session data
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <code>POST /api/mikpos/order/create</code> - Create voucher order
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <code>POST /api/mikpos/payment/success</code> - Process payment
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Test Types</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Voucher Purchase Request:</strong> Tests initial webhook from MikPos
                  </div>
                  <div>
                    <strong>Customer Redirect:</strong> Tests redirect URL generation
                  </div>
                  <div>
                    <strong>Payment Notification:</strong> Tests payment webhook handling
                  </div>
                  <div>
                    <strong>Full Flow:</strong> Tests complete integration from start to finish
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
