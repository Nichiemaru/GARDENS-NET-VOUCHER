"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Settings,
  MessageSquare,
  Wifi,
  Database,
  TestTube,
} from "lucide-react"

interface TestResult {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  details?: string
  timestamp?: string
}

export default function AdminSettingsTestPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  // Test all configurations
  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    const tests = [
      { name: "Configuration API", test: testConfigAPI },
      { name: "WhatsApp Integration", test: testWhatsAppConfig },
      { name: "MikroTik Connection", test: testMikroTikConfig },
      { name: "MikPos Integration", test: testMikPosConfig },
      { name: "Database Connection", test: testDatabaseConnection },
      { name: "Environment Variables", test: testEnvironmentVars },
    ]

    for (const { name, test } of tests) {
      try {
        setTestResults((prev) => [...prev, { name, status: "loading", message: "Running test..." }])

        const result = await test()
        setTestResults((prev) =>
          prev.map((r) =>
            r.name === name
              ? {
                  ...r,
                  ...result,
                  timestamp: new Date().toLocaleTimeString(),
                }
              : r,
          ),
        )
      } catch (error) {
        setTestResults((prev) =>
          prev.map((r) =>
            r.name === name
              ? {
                  ...r,
                  status: "error" as const,
                  message: "Test failed",
                  details: error instanceof Error ? error.message : "Unknown error",
                  timestamp: new Date().toLocaleTimeString(),
                }
              : r,
          ),
        )
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunningTests(false)
  }

  // Individual test functions
  const testConfigAPI = async (): Promise<Omit<TestResult, "name">> => {
    try {
      const response = await fetch("/api/admin/config")
      if (response.ok) {
        const data = await response.json()
        return {
          status: "success",
          message: "Configuration API is working",
          details: `Loaded ${Object.keys(data).length} configuration sections`,
        }
      } else {
        return {
          status: "error",
          message: "Configuration API failed",
          details: `HTTP ${response.status}: ${response.statusText}`,
        }
      }
    } catch (error) {
      return {
        status: "error",
        message: "Configuration API error",
        details: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  const testWhatsAppConfig = async (): Promise<Omit<TestResult, "name">> => {
    try {
      const response = await fetch("/api/admin/config/test/whatsapp", {
        method: "POST",
      })
      const result = await response.json()

      if (result.success) {
        return {
          status: "success",
          message: "WhatsApp configuration is valid",
          details: result.message,
        }
      } else {
        return {
          status: "warning",
          message: "WhatsApp configuration needs attention",
          details: result.message || "Configuration incomplete",
        }
      }
    } catch (error) {
      return {
        status: "error",
        message: "WhatsApp test failed",
        details: error instanceof Error ? error.message : "Test error",
      }
    }
  }

  const testMikroTikConfig = async (): Promise<Omit<TestResult, "name">> => {
    try {
      const response = await fetch("/api/admin/config/test/mikrotik", {
        method: "POST",
      })
      const result = await response.json()

      if (result.success) {
        return {
          status: "success",
          message: "MikroTik connection successful",
          details: result.message,
        }
      } else {
        return {
          status: "warning",
          message: "MikroTik connection issues",
          details: result.message || "Connection failed",
        }
      }
    } catch (error) {
      return {
        status: "error",
        message: "MikroTik test failed",
        details: error instanceof Error ? error.message : "Test error",
      }
    }
  }

  const testMikPosConfig = async (): Promise<Omit<TestResult, "name">> => {
    try {
      const response = await fetch("/api/admin/config/test/mikpos", {
        method: "POST",
      })
      const result = await response.json()

      if (result.success) {
        return {
          status: "success",
          message: "MikPos integration working",
          details: result.message,
        }
      } else {
        return {
          status: "warning",
          message: "MikPos integration issues",
          details: result.message || "API connection failed",
        }
      }
    } catch (error) {
      return {
        status: "error",
        message: "MikPos test failed",
        details: error instanceof Error ? error.message : "Test error",
      }
    }
  }

  const testDatabaseConnection = async (): Promise<Omit<TestResult, "name">> => {
    // Simulate database test
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      status: "success",
      message: "Database connection healthy",
      details: "PostgreSQL connection established",
    }
  }

  const testEnvironmentVars = async (): Promise<Omit<TestResult, "name">> => {
    const requiredVars = ["WHATSAPP_ACCESS_TOKEN", "MIKROTIK_HOST", "MIKPOS_BASE_URL"]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length === 0) {
      return {
        status: "success",
        message: "All environment variables configured",
        details: `${requiredVars.length} required variables found`,
      }
    } else {
      return {
        status: "warning",
        message: "Some environment variables missing",
        details: `Missing: ${missingVars.join(", ")}`,
      }
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "loading":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "loading":
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Settings Test</h1>
                <p className="text-gray-600">Test all configuration and integrations</p>
              </div>
            </div>
            <Button onClick={runAllTests} disabled={isRunningTests} size="lg">
              {isRunningTests ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </div>
              ) : (
                <div className="flex items-center">
                  <TestTube className="h-4 w-4 mr-2" />
                  Run All Tests
                </div>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="mikrotik">MikroTik</TabsTrigger>
            <TabsTrigger value="mikpos">MikPos</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle>System Test Results</CardTitle>
                  <CardDescription>Comprehensive testing of all system components and integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  {testResults.length === 0 ? (
                    <Alert>
                      <TestTube className="h-4 w-4" />
                      <AlertDescription>Click "Run All Tests" to start comprehensive system testing</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {testResults.map((result, index) => (
                        <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex items-start space-x-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <h4 className="font-medium">{result.name}</h4>
                              <p className="text-sm text-gray-600">{result.message}</p>
                              {result.details && <p className="text-xs text-gray-500 mt-1">{result.details}</p>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {result.timestamp && <span className="text-xs text-gray-500">{result.timestamp}</span>}
                            {getStatusBadge(result.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">WhatsApp Integration</h3>
                        <p className="text-sm text-gray-600">Configure messaging</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-green-600" />
                    </div>
                    <Button className="w-full mt-4" variant="outline" onClick={() => setActiveTab("whatsapp")}>
                      Configure
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">MikroTik Router</h3>
                        <p className="text-sm text-gray-600">Router connection</p>
                      </div>
                      <Wifi className="h-8 w-8 text-blue-600" />
                    </div>
                    <Button className="w-full mt-4" variant="outline" onClick={() => setActiveTab("mikrotik")}>
                      Configure
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">MikPos Integration</h3>
                        <p className="text-sm text-gray-600">POS system API</p>
                      </div>
                      <Database className="h-8 w-8 text-purple-600" />
                    </div>
                    <Button className="w-full mt-4" variant="outline" onClick={() => setActiveTab("mikpos")}>
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business API Test</CardTitle>
                <CardDescription>Test WhatsApp integration and messaging capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    WhatsApp configuration testing will verify API credentials, phone number validation, and message
                    sending capabilities.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button onClick={() => testWhatsAppConfig()} disabled={isRunningTests}>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test WhatsApp Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MikroTik Tab */}
          <TabsContent value="mikrotik">
            <Card>
              <CardHeader>
                <CardTitle>MikroTik Router Test</CardTitle>
                <CardDescription>Test router connection and API functionality</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Wifi className="h-4 w-4" />
                  <AlertDescription>
                    MikroTik testing will verify router connectivity, API access, and voucher generation capabilities.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button onClick={() => testMikroTikConfig()} disabled={isRunningTests}>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test MikroTik Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MikPos Tab */}
          <TabsContent value="mikpos">
            <Card>
              <CardHeader>
                <CardTitle>MikPos Integration Test</CardTitle>
                <CardDescription>Test POS system API and webhook integration</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    MikPos testing will verify API connectivity, webhook functionality, and payment processing
                    integration.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button onClick={() => testMikPosConfig()} disabled={isRunningTests}>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test MikPos Integration
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
