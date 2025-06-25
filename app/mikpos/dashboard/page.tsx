"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  Plus,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  Server,
  Router,
  MessageCircle,
  Send,
  Phone,
  User,
  Copy,
  Eye,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SystemStatus {
  mikrotik: { status: "connected" | "disconnected" | "error"; lastCheck: string; version: string }
  database: { status: "connected" | "disconnected" | "error"; lastCheck: string; size: string }
  gardensnet: { status: "connected" | "disconnected" | "error"; lastSync: string; orders: number }
  hotspot: { status: "active" | "inactive" | "error"; activeUsers: number; totalBandwidth: string }
}

interface AdminSession {
  username: string
  role: string
  name: string
  loginTime: string
}

interface HotspotUser {
  id: string
  username: string
  ipAddress: string
  macAddress: string
  loginTime: string
  sessionTime: string
  bytesIn: number
  bytesOut: number
  status: "active" | "idle" | "blocked"
}

interface VoucherProfile {
  id: string
  name: string
  validity: string
  bandwidth: string
  price: number
  generated: number
  used: number
  active: boolean
}

export default function MikPosDashboard() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    mikrotik: { status: "connected", lastCheck: new Date().toISOString(), version: "RouterOS 7.10.1" },
    database: { status: "connected", lastCheck: new Date().toISOString(), size: "245 MB" },
    gardensnet: { status: "connected", lastSync: new Date().toISOString(), orders: 23 },
    hotspot: { status: "active", activeUsers: 45, totalBandwidth: "150 Mbps" },
  })

  const [stats, setStats] = useState({
    activeUsers: 45,
    totalUsers: 1250,
    vouchersToday: 89,
    revenue: 1250000,
    systemUptime: "15 days, 8 hours",
    cpuUsage: 35,
    memoryUsage: 68,
    diskUsage: 42,
  })

  const [activeUsers, setActiveUsers] = useState<HotspotUser[]>([
    {
      id: "1",
      username: "user001",
      ipAddress: "192.168.1.101",
      macAddress: "AA:BB:CC:DD:EE:01",
      loginTime: "2024-01-15T10:30:00Z",
      sessionTime: "02:15:30",
      bytesIn: 125000000,
      bytesOut: 45000000,
      status: "active",
    },
    {
      id: "2",
      username: "user002",
      ipAddress: "192.168.1.102",
      macAddress: "AA:BB:CC:DD:EE:02",
      loginTime: "2024-01-15T09:45:00Z",
      sessionTime: "03:00:15",
      bytesIn: 89000000,
      bytesOut: 32000000,
      status: "active",
    },
    {
      id: "3",
      username: "user003",
      ipAddress: "192.168.1.103",
      macAddress: "AA:BB:CC:DD:EE:03",
      loginTime: "2024-01-15T11:00:00Z",
      sessionTime: "01:45:00",
      bytesIn: 156000000,
      bytesOut: 78000000,
      status: "idle",
    },
  ])

  const [voucherProfiles, setVoucherProfiles] = useState<VoucherProfile[]>([
    {
      id: "1",
      name: "Express 1 Jam",
      validity: "1 hour",
      bandwidth: "10 Mbps",
      price: 5000,
      generated: 150,
      used: 142,
      active: true,
    },
    {
      id: "2",
      name: "Daily 1 Hari",
      validity: "24 hours",
      bandwidth: "20 Mbps",
      price: 15000,
      generated: 89,
      used: 76,
      active: true,
    },
    {
      id: "3",
      name: "Weekend 3 Hari",
      validity: "72 hours",
      bandwidth: "25 Mbps",
      price: 35000,
      generated: 45,
      used: 38,
      active: true,
    },
  ])

  const [generatedVouchers, setGeneratedVouchers] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    whatsapp: "",
    enabled: false,
  })
  const [whatsappMessage, setWhatsappMessage] = useState("")

  const router = useRouter()
  const { toast } = useToast()

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
      setCurrentTime(new Date())
      setStats((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        vouchersToday: prev.vouchersToday + Math.floor(Math.random() * 2),
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + Math.floor(Math.random() * 10) - 5)),
        memoryUsage: Math.max(40, Math.min(90, prev.memoryUsage + Math.floor(Math.random() * 6) - 3)),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem("mikposSession")
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem MikPos",
    })
    router.push("/mikpos/login")
  }

  const handleDisconnectUser = (userId: string) => {
    setActiveUsers((prev) => prev.filter((user) => user.id !== userId))
    toast({
      title: "User Disconnected",
      description: "User berhasil diputuskan dari hotspot",
    })
  }

  const formatWhatsAppNumber = (number: string) => {
    // Remove all non-digit characters
    let cleaned = number.replace(/\D/g, "")

    // Convert Indonesian format to international
    if (cleaned.startsWith("08")) {
      cleaned = "628" + cleaned.substring(2)
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned
    } else if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned
    }

    return cleaned
  }

  const generateWhatsAppMessage = (voucher: any, customer: any) => {
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 1) // 1 hour validity

    return `🎉 *VOUCHER WIFI GARDENS-NET* 🎉

Halo ${customer.name}! 👋
Voucher WiFi Anda telah berhasil dibuat:

🎫 *KODE VOUCHER:* 
\`${voucher.code}\`

📦 *DETAIL PAKET:*
• Nama: ${voucher.profile}
• Bandwidth: ${voucher.bandwidth}
• Durasi: ${voucher.validity}
• Berlaku hingga: ${expiryDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}

📋 *CARA MENGGUNAKAN:*

1️⃣ *Connect ke WiFi "GARDENS-NET"*
2️⃣ *Buka browser, akan redirect otomatis*
3️⃣ *Masukkan kode voucher: \`${voucher.code}\`*
4️⃣ *Klik "Login" dan mulai browsing!* 🌐

⚠️ *PENTING:*
• Kode voucher hanya bisa digunakan SEKALI
• Simpan pesan ini untuk referensi
• Jangan bagikan kode ke orang lain
• Hubungi admin jika ada kendala

💡 *TIPS:*
• Pastikan sinyal WiFi kuat
• Logout dengan benar setelah selesai
• Voucher berlaku ${voucher.validity}

Terima kasih telah menggunakan GARDENS-NET WiFi! 🙏

_Powered by MikPos Integration_
_Support: wa.me/628123456789_`
  }

  const handleGenerateVoucher = async (profileId: string, quantity: number) => {
    setIsGenerating(true)

    const profile = voucherProfiles.find((p) => p.id === profileId)
    if (profile) {
      // Generate voucher codes
      const newVouchers = Array.from({ length: quantity }, (_, i) => ({
        id: `voucher_${Date.now()}_${i}`,
        code: `EXPR-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        profile: profile.name,
        price: profile.price,
        validity: profile.validity,
        bandwidth: profile.bandwidth,
        status: "unused",
        createdAt: new Date().toISOString(),
        createdBy: adminSession?.username || "admin",
      }))

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update profiles
      setVoucherProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, generated: p.generated + quantity } : p)),
      )

      // Add to generated vouchers list
      setGeneratedVouchers((prev) => [...prev, ...newVouchers])

      // If customer info provided and WhatsApp enabled, send message
      if (customerInfo.enabled && customerInfo.name && customerInfo.whatsapp) {
        await handleSendWhatsApp(newVouchers[0], customerInfo)
      }

      // Simulate database save and sync
      setTimeout(() => {
        console.log("Vouchers saved to database:", newVouchers)

        fetch("/api/mikpos/products/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-MikPos-Signature": "sha256=sample-signature",
          },
          body: JSON.stringify({
            action: "voucher_generated",
            vouchers: newVouchers,
            timestamp: new Date().toISOString(),
          }),
        }).catch(console.error)
      }, 1000)

      toast({
        title: "Voucher Generated Successfully! 🎉",
        description: (
          <div className="space-y-2">
            <div>
              {quantity} voucher {profile.name} berhasil dibuat
            </div>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono">
              Voucher Code: <span className="font-bold">{newVouchers[0].code}</span>
            </div>
            <div className="text-xs text-gray-600">
              ✅ Added to database
              <br />✅ Synced to GARDENS-NET
              <br />📄 Ready for printing
              {customerInfo.enabled && (
                <>
                  <br />📱 Sent via WhatsApp
                </>
              )}
            </div>
          </div>
        ),
      })
    }

    setIsGenerating(false)
  }

  const handleSendWhatsApp = async (voucher: any, customer: any) => {
    setIsSendingWhatsApp(true)

    try {
      const formattedNumber = formatWhatsAppNumber(customer.whatsapp)
      const message = generateWhatsAppMessage(voucher, customer)

      // Simulate WhatsApp API call
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formattedNumber,
          message: message,
          voucher: voucher,
          customer: customer,
        }),
      })

      if (response.ok) {
        toast({
          title: "WhatsApp Sent Successfully! 📱",
          description: (
            <div className="space-y-2">
              <div>Voucher berhasil dikirim ke {customer.name}</div>
              <div className="text-xs text-gray-600">
                📱 WhatsApp: {customer.whatsapp}
                <br />🎫 Voucher: {voucher.code}
                <br />⏰ Sent: {new Date().toLocaleTimeString("id-ID")}
              </div>
            </div>
          ),
        })
      } else {
        throw new Error("Failed to send WhatsApp")
      }
    } catch (error) {
      toast({
        title: "WhatsApp Send Failed ❌",
        description: "Gagal mengirim voucher via WhatsApp. Silakan coba lagi.",
        variant: "destructive",
      })
    }

    setIsSendingWhatsApp(false)
  }

  const handlePreviewMessage = () => {
    const sampleVoucher = {
      code: "EXPR-240115-A7B9",
      profile: "Express 1 Jam",
      bandwidth: "10 Mbps",
      validity: "1 hour",
    }

    const message = generateWhatsAppMessage(sampleVoucher, customerInfo)
    setWhatsappMessage(message)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { color: "bg-green-500", icon: CheckCircle, text: "Connected" },
      active: { color: "bg-green-500", icon: CheckCircle, text: "Active" },
      disconnected: { color: "bg-red-500", icon: AlertTriangle, text: "Disconnected" },
      error: { color: "bg-red-500", icon: AlertTriangle, text: "Error" },
      inactive: { color: "bg-gray-500", icon: AlertTriangle, text: "Inactive" },
      idle: { color: "bg-yellow-500", icon: Clock, text: "Idle" },
      blocked: { color: "bg-red-500", icon: Shield, text: "Blocked" },
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

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID")
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
                <p className="text-sm text-gray-600">
                  {currentTime.toLocaleString("id-ID")} | Uptime: {stats.systemUptime}
                </p>
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open("/admin/products/sync", "_blank")}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  GARDENS-NET
                </Button>
              </div>
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
              <div className="mt-2">
                <Progress value={(stats.activeUsers / 100) * 100} className="h-2" />
              </div>
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
              <div className="flex items-center mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </div>
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
              <div className="flex items-center mt-2 text-xs text-purple-600">
                <Clock className="h-3 w-3 mr-1" />
                Last: 5 minutes ago
              </div>
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
              <div className="flex items-center mt-2 text-xs text-orange-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{stats.cpuUsage}%</span>
                <Server className="h-4 w-4 text-blue-500" />
              </div>
              <Progress value={stats.cpuUsage} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{stats.memoryUsage}%</span>
                <Database className="h-4 w-4 text-green-500" />
              </div>
              <Progress value={stats.memoryUsage} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Disk Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{stats.diskUsage}%</span>
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <Progress value={stats.diskUsage} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Active Users</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
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
                      <Router className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <span className="font-medium">MikroTik RouterOS</span>
                        <p className="text-xs text-gray-500">{systemStatus.mikrotik.version}</p>
                      </div>
                    </div>
                    {getStatusBadge(systemStatus.mikrotik.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 text-green-500 mr-2" />
                      <div>
                        <span className="font-medium">Database</span>
                        <p className="text-xs text-gray-500">{systemStatus.database.size}</p>
                      </div>
                    </div>
                    {getStatusBadge(systemStatus.database.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-purple-500 mr-2" />
                      <div>
                        <span className="font-medium">GARDENS-NET</span>
                        <p className="text-xs text-gray-500">{systemStatus.gardensnet.orders} orders today</p>
                      </div>
                    </div>
                    {getStatusBadge(systemStatus.gardensnet.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 text-orange-500 mr-2" />
                      <div>
                        <span className="font-medium">Hotspot Service</span>
                        <p className="text-xs text-gray-500">{systemStatus.hotspot.totalBandwidth}</p>
                      </div>
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start" variant="outline">
                        <Package className="h-4 w-4 mr-2" />
                        Generate Voucher
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <Package className="h-5 w-5 mr-2 text-blue-600" />
                          Generate Voucher & Send WhatsApp
                        </DialogTitle>
                        <DialogDescription>
                          Buat voucher baru dan kirim langsung ke customer via WhatsApp
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        {/* Profile Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="profile">Voucher Profile</Label>
                          <Select defaultValue="1">
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih profile voucher" />
                            </SelectTrigger>
                            <SelectContent>
                              {voucherProfiles.map((profile) => (
                                <SelectItem key={profile.id} value={profile.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <div className="font-medium">{profile.name}</div>
                                      <div className="text-xs text-gray-500">
                                        {profile.validity} • {profile.bandwidth}
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="font-medium text-green-600">{formatPrice(profile.price)}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantity */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              type="number"
                              placeholder="Jumlah voucher"
                              defaultValue="1"
                              min="1"
                              max="100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prefix">Prefix (Optional)</Label>
                            <Input id="prefix" placeholder="e.g. WIFI-" maxLength="10" />
                          </div>
                        </div>

                        {/* Customer Info & WhatsApp */}
                        <div className="space-y-4 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="h-4 w-4 text-green-600" />
                              <Label htmlFor="whatsapp-enabled" className="text-sm font-medium">
                                Send via WhatsApp
                              </Label>
                            </div>
                            <Switch
                              id="whatsapp-enabled"
                              checked={customerInfo.enabled}
                              onCheckedChange={(checked) => setCustomerInfo((prev) => ({ ...prev, enabled: checked }))}
                            />
                          </div>

                          {customerInfo.enabled && (
                            <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="customer-name">
                                    <User className="h-3 w-3 inline mr-1" />
                                    Customer Name
                                  </Label>
                                  <Input
                                    id="customer-name"
                                    placeholder="Nama customer"
                                    value={customerInfo.name}
                                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="customer-phone">
                                    <Phone className="h-3 w-3 inline mr-1" />
                                    WhatsApp Number
                                  </Label>
                                  <Input
                                    id="customer-phone"
                                    placeholder="08xxxxxxxxxx"
                                    value={customerInfo.whatsapp}
                                    onChange={(e) => setCustomerInfo((prev) => ({ ...prev, whatsapp: e.target.value }))}
                                  />
                                </div>
                              </div>

                              {/* WhatsApp Message Preview */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">WhatsApp Message Preview</Label>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviewMessage}
                                    disabled={!customerInfo.name}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Preview
                                  </Button>
                                </div>
                                <Textarea
                                  placeholder="Preview pesan WhatsApp akan muncul di sini..."
                                  value={whatsappMessage}
                                  readOnly
                                  className="h-32 text-xs"
                                />
                                {whatsappMessage && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      navigator.clipboard.writeText(whatsappMessage)
                                      toast({
                                        title: "Message Copied!",
                                        description: "WhatsApp message copied to clipboard",
                                      })
                                    }}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy Message
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Generation Options */}
                        <div className="space-y-4 border-t pt-4">
                          <Label className="text-sm font-medium">Generation Options</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="auto-print" className="rounded" defaultChecked />
                              <Label htmlFor="auto-print" className="text-sm">
                                Auto-print vouchers after generation
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="add-to-gardens" className="rounded" defaultChecked />
                              <Label htmlFor="add-to-gardens" className="text-sm">
                                Sync to GARDENS-NET inventory
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="text-sm font-medium mb-2">Preview:</div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>
                              Profile: <span className="font-medium">Express 1 Jam</span>
                            </div>
                            <div>
                              Quantity: <span className="font-medium">1 voucher</span>
                            </div>
                            <div>
                              Total Value: <span className="font-medium text-green-600">Rp 5,000</span>
                            </div>
                            <div>
                              Validity: <span className="font-medium">1 hour</span>
                            </div>
                            <div>
                              Bandwidth: <span className="font-medium">10 Mbps</span>
                            </div>
                            {customerInfo.enabled && customerInfo.name && (
                              <div>
                                WhatsApp:{" "}
                                <span className="font-medium text-green-600">
                                  ✅ Will be sent to {customerInfo.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button variant="outline">Cancel</Button>
                        <Button
                          onClick={() => handleGenerateVoucher("1", 1)}
                          disabled={isGenerating || isSendingWhatsApp}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : isSendingWhatsApp ? (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Sending WhatsApp...
                            </>
                          ) : (
                            <>
                              <Package className="h-4 w-4 mr-2" />
                              Generate & Send
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/mikpos/users")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/mikpos/settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/admin/routers")}
                  >
                    <Router className="h-4 w-4 mr-2" />
                    Router Management
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => router.push("/mikpos/settings/whatsapp")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Settings
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

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Active Users</CardTitle>
                    <CardDescription>User yang sedang terhubung ke hotspot</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>MAC Address</TableHead>
                        <TableHead>Login Time</TableHead>
                        <TableHead>Session Time</TableHead>
                        <TableHead>Data Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.ipAddress}</TableCell>
                          <TableCell className="font-mono text-xs">{user.macAddress}</TableCell>
                          <TableCell>{formatTime(user.loginTime)}</TableCell>
                          <TableCell>{user.sessionTime}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>↓ {formatBytes(user.bytesIn)}</div>
                              <div>↑ {formatBytes(user.bytesOut)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleDisconnectUser(user.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Voucher Profiles</CardTitle>
                    <CardDescription>Kelola profile dan paket voucher</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profile Name</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Bandwidth</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Used</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {voucherProfiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>{profile.validity}</TableCell>
                          <TableCell>{profile.bandwidth}</TableCell>
                          <TableCell>{formatPrice(profile.price)}</TableCell>
                          <TableCell>{profile.generated}</TableCell>
                          <TableCell>{profile.used}</TableCell>
                          <TableCell>{getStatusBadge(profile.active ? "active" : "inactive")}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Informasi sistem dan konfigurasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">System information features coming soon...</p>
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
