"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wifi,
  Users,
  DollarSign,
  Activity,
  Settings,
  Package,
  Database,
  Shield,
  ExternalLink,
  LogOut,
  Bell,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Globe,
} from "lucide-react"

interface SystemStatus {
  mikrotik: { status: "connected" | "disconnected" | "error"; lastCheck: string }
  database: { status: "connected" | "disconnected" | "error"; lastCheck: string }
  gardensnet: { status: "connected" | "disconnected" | "error"; lastSync: string }
  hotspot: { status: "active" | "inactive" | "error"; activeUsers: number }
}

interface AdminSession {
  username: string
  role: string
  name: string
  loginTime: string
}

export default function MikPosDashboard() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    mikrotik: { status: "connected", lastCheck: new Date().toISOString() },
    database: { status: "connected", lastCheck: new Date().toISOString() },
    gardensnet: { status: "connected", lastSync: new Date().toISOString() },
    hotspot: { status: "active", activeUsers: 45 },
  })
  const [stats, setStats] = useState({
    activeUsers: 45,
    totalUsers: 1250,
    vouchersToday: 89,
    revenue: 1250000,
    systemUptime: "15 days, 8 hours",
  })
  const router = useRouter()

  // Check admin session
  useEffect(() => {
    const session = sessionStorage.getItem("mikposSession")
    if (!session) {
      router.push("/mikpos/login")
      return
    }
    setAdminSession(JSON.parse(session))
  }, [router])

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        vouchersToday: prev.vouchersToday + Math.floor(Math.random() * 2),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem("mikposSession")
    router.push("/mikpos/login")
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { color: "bg-green-500", icon: CheckCircle, text: "Connected" },
      active: { color: "bg-green-500", icon: CheckCircle, text: "Active" },
      disconnected: { color: "bg-red-500", icon: AlertTriangle, text: "Disconnected" },
      error: { color: "bg-red-500", icon: AlertTriangle, text: "Error" },
      inactive: { color: "bg-gray-500", icon: AlertTriangle, text: "Inactive" },
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price)
  }

  if (!adminSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading MikPos Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <Wifi className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MikPos Dashboard</h1>
                <p className="text-sm text-gray-600">Hotspot Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminSession.name}</p>
                <p className="text-xs text-gray-500 capitalize">{adminSession.role}</p>
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* System Status Alert */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>System Status:</strong> All services running normally. GARDENS-NET integration active.
              </span>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vouchers Today</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.vouchersToday}</div>
              <p className="text-xs text-muted-foreground">Generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatPrice(stats.revenue)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hotspot">Hotspot</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Status koneksi dan integrasi sistem</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 text-blue-500 mr-2" />
                      <span>MikroTik RouterOS</span>
                    </div>
                    {getStatusBadge(systemStatus.mikrotik.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 text-green-500 mr-2" />
                      <span>Database</span>
                    </div>
                    {getStatusBadge(systemStatus.database.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-purple-500 mr-2" />
                      <span>GARDENS-NET</span>
                    </div>
                    {getStatusBadge(systemStatus.gardensnet.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 text-orange-500 mr-2" />
                      <span>Hotspot Service</span>
                    </div>
                    {getStatusBadge(systemStatus.hotspot.status)}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Aksi cepat untuk manajemen sistem</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Generate Voucher
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => window.open("/admin/products/sync", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    GARDENS-NET Admin
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hotspot">
            <Card>
              <CardHeader>
                <CardTitle>Hotspot Management</CardTitle>
                <CardDescription>Kelola pengaturan hotspot dan user aktif</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Hotspot management features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers">
            <Card>
              <CardHeader>
                <CardTitle>Voucher Management</CardTitle>
                <CardDescription>Generate dan kelola voucher internet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Voucher management features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Kelola user dan akses sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">User management features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Konfigurasi sistem dan integrasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">System settings features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
