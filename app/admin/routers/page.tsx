"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Settings,
  Trash2,
  Edit,
  TestTube,
  Eye,
  EyeOff,
  MoreHorizontal,
  Router,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"

interface MikroTikRouter {
  id: string
  name: string
  host: string
  username: string
  password: string
  port: number
  ssl_enabled: boolean
  status: "connected" | "disconnected" | "error" | "testing"
  last_check: string | null
  active_users: number
  total_vouchers: number
  uptime: string
  version: string
  model: string
  location?: string
  description?: string
  is_primary: boolean
  created_at: string
}

export default function AdminRoutersPage() {
  const [routers, setRouters] = useState<MikroTikRouter[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedRouter, setSelectedRouter] = useState<MikroTikRouter | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state for add/edit router
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    username: "admin",
    password: "",
    port: 8728,
    ssl_enabled: false,
    location: "",
    description: "",
    is_primary: false,
  })

  useEffect(() => {
    loadRouters()
  }, [])

  const loadRouters = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/routers")
      if (response.ok) {
        const data = await response.json()
        setRouters(data.routers || [])
      }
    } catch (error) {
      console.error("Failed to load routers:", error)
    } finally {
      setLoading(false)
    }
  }

  const addRouter = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/routers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowAddDialog(false)
        resetForm()
        loadRouters()
        alert("Router berhasil ditambahkan!")
      } else {
        const error = await response.json()
        alert(`Gagal menambahkan router: ${error.message}`)
      }
    } catch (error) {
      console.error("Add router error:", error)
      alert("Error menambahkan router!")
    } finally {
      setSaving(false)
    }
  }

  const updateRouter = async () => {
    if (!selectedRouter) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/routers/${selectedRouter.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowEditDialog(false)
        setSelectedRouter(null)
        resetForm()
        loadRouters()
        alert("Router berhasil diupdate!")
      } else {
        const error = await response.json()
        alert(`Gagal mengupdate router: ${error.message}`)
      }
    } catch (error) {
      console.error("Update router error:", error)
      alert("Error mengupdate router!")
    } finally {
      setSaving(false)
    }
  }

  const deleteRouter = async (routerId: string) => {
    if (!confirm("Yakin ingin menghapus router ini?")) return

    try {
      const response = await fetch(`/api/admin/routers/${routerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadRouters()
        alert("Router berhasil dihapus!")
      } else {
        alert("Gagal menghapus router!")
      }
    } catch (error) {
      console.error("Delete router error:", error)
      alert("Error menghapus router!")
    }
  }

  const testConnection = async (routerId: string) => {
    setTesting(routerId)
    try {
      const response = await fetch(`/api/admin/routers/${routerId}/test`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        alert("✅ Koneksi berhasil!")
        loadRouters()
      } else {
        alert(`❌ Koneksi gagal: ${result.error}`)
      }
    } catch (error) {
      console.error("Test connection error:", error)
      alert("Error testing connection!")
    } finally {
      setTesting(null)
    }
  }

  const setPrimaryRouter = async (routerId: string) => {
    try {
      const response = await fetch(`/api/admin/routers/${routerId}/primary`, {
        method: "POST",
      })

      if (response.ok) {
        loadRouters()
        alert("Primary router berhasil diset!")
      } else {
        alert("Gagal set primary router!")
      }
    } catch (error) {
      console.error("Set primary error:", error)
      alert("Error set primary router!")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      host: "",
      username: "admin",
      password: "",
      port: 8728,
      ssl_enabled: false,
      location: "",
      description: "",
      is_primary: false,
    })
  }

  const openEditDialog = (router: MikroTikRouter) => {
    setSelectedRouter(router)
    setFormData({
      name: router.name,
      host: router.host,
      username: router.username,
      password: router.password,
      port: router.port,
      ssl_enabled: router.ssl_enabled,
      location: router.location || "",
      description: router.description || "",
      is_primary: router.is_primary,
    })
    setShowEditDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case "disconnected":
        return <Badge variant="secondary">Disconnected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "testing":
        return <Badge className="bg-yellow-100 text-yellow-800">Testing...</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-gray-400" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "testing":
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Router className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MikroTik Routers</h1>
                <p className="text-gray-600">Kelola router MikroTik untuk voucher WiFi</p>
              </div>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Router
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tambah Router MikroTik</DialogTitle>
                  <DialogDescription>Tambahkan router MikroTik baru untuk generate voucher</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Router Name */}
                  <div>
                    <Label htmlFor="name">Nama Router *</Label>
                    <Input
                      id="name"
                      placeholder="Router Utama"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  {/* Host/IP */}
                  <div>
                    <Label htmlFor="host">IP Address *</Label>
                    <Input
                      id="host"
                      placeholder="192.168.1.1"
                      value={formData.host}
                      onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="admin"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="flex">
                      <Input
                        id="password"
                        type={showPasswords ? "text" : "password"}
                        placeholder="router-password"
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
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
                  </div>

                  {/* Port */}
                  <div>
                    <Label htmlFor="port">API Port</Label>
                    <Input
                      id="port"
                      type="number"
                      placeholder="8728"
                      value={formData.port}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, port: Number.parseInt(e.target.value) || 8728 }))
                      }
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="location">Lokasi</Label>
                    <Input
                      id="location"
                      placeholder="Kantor Pusat"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Input
                      id="description"
                      placeholder="Router utama untuk area kantor"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ssl_enabled"
                      checked={formData.ssl_enabled}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, ssl_enabled: checked }))}
                    />
                    <Label htmlFor="ssl_enabled">Enable SSL/TLS</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_primary"
                      checked={formData.is_primary}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_primary: checked }))}
                    />
                    <Label htmlFor="is_primary">Set as Primary Router</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addRouter} disabled={saving}>
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      "Add Router"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Router className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Routers</p>
                    <p className="text-2xl font-bold">{routers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Connected</p>
                    <p className="text-2xl font-bold">{routers.filter((r) => r.status === "connected").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{routers.reduce((sum, r) => sum + r.active_users, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Vouchers</p>
                    <p className="text-2xl font-bold">{routers.reduce((sum, r) => sum + r.total_vouchers, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Routers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Router List</CardTitle>
            <CardDescription>Daftar semua router MikroTik yang terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-2">Loading routers...</span>
              </div>
            ) : routers.length === 0 ? (
              <div className="text-center py-8">
                <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada router yang ditambahkan</p>
                <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Router
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Router</TableHead>
                    <TableHead>Connection</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Vouchers</TableHead>
                    <TableHead>Last Check</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routers.map((router) => (
                    <TableRow key={router.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(router.status)}
                          <div className="ml-3">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">{router.name}</p>
                              {router.is_primary && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  PRIMARY
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{router.host}</p>
                            {router.location && <p className="text-xs text-gray-400">{router.location}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {router.host}:{router.port}
                          </p>
                          <p className="text-gray-500">{router.ssl_enabled ? "SSL" : "No SSL"}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(router.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{router.active_users}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{router.total_vouchers}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {router.last_check ? new Date(router.last_check).toLocaleString() : "Never"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => testConnection(router.id)}
                              disabled={testing === router.id}
                            >
                              <TestTube className="h-4 w-4 mr-2" />
                              {testing === router.id ? "Testing..." : "Test Connection"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(router)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Router
                            </DropdownMenuItem>
                            {!router.is_primary && (
                              <DropdownMenuItem onClick={() => setPrimaryRouter(router.id)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Set as Primary
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteRouter(router.id)}
                              className="text-red-600"
                              disabled={router.is_primary}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Router
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Router MikroTik</DialogTitle>
              <DialogDescription>Update konfigurasi router {selectedRouter?.name}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Same form fields as add dialog */}
              <div>
                <Label htmlFor="edit_name">Nama Router *</Label>
                <Input
                  id="edit_name"
                  placeholder="Router Utama"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit_host">IP Address *</Label>
                <Input
                  id="edit_host"
                  placeholder="192.168.1.1"
                  value={formData.host}
                  onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit_username">Username *</Label>
                <Input
                  id="edit_username"
                  placeholder="admin"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit_password">Password *</Label>
                <div className="flex">
                  <Input
                    id="edit_password"
                    type={showPasswords ? "text" : "password"}
                    placeholder="router-password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
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
              </div>

              <div>
                <Label htmlFor="edit_port">API Port</Label>
                <Input
                  id="edit_port"
                  type="number"
                  placeholder="8728"
                  value={formData.port}
                  onChange={(e) => setFormData((prev) => ({ ...prev, port: Number.parseInt(e.target.value) || 8728 }))}
                />
              </div>

              <div>
                <Label htmlFor="edit_location">Lokasi</Label>
                <Input
                  id="edit_location"
                  placeholder="Kantor Pusat"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit_description">Deskripsi</Label>
                <Input
                  id="edit_description"
                  placeholder="Router utama untuk area kantor"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_ssl_enabled"
                  checked={formData.ssl_enabled}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, ssl_enabled: checked }))}
                />
                <Label htmlFor="edit_ssl_enabled">Enable SSL/TLS</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_primary: checked }))}
                />
                <Label htmlFor="edit_is_primary">Set as Primary Router</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={updateRouter} disabled={saving}>
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Router"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
