"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Wifi,
  Users,
  DollarSign,
  Activity,
  Settings,
  FolderSyncIcon as Sync,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MikPosProduct {
  id: string
  name: string
  price: number
  stock: number
  description: string
  category: "voucher" | "hardware" | "service"
  isActive: boolean
  syncWithGardensNet: boolean
  gardensNetId?: string
  lastSynced?: string
  syncStatus: "synced" | "pending" | "error" | "disabled"
}

interface HotspotStats {
  activeUsers: number
  totalUsers: number
  vouchersGenerated: number
  revenue: number
}

export default function MikPosDashboard() {
  const [products, setProducts] = useState<MikPosProduct[]>([
    {
      id: "mp_001",
      name: "Express 1 Jam",
      price: 5000,
      stock: 100,
      description: "Voucher WiFi 1 jam dengan bandwidth 10 Mbps",
      category: "voucher",
      isActive: true,
      syncWithGardensNet: true,
      gardensNetId: "gn_001",
      lastSynced: "2024-01-15T10:30:00Z",
      syncStatus: "synced",
    },
    {
      id: "mp_002",
      name: "Daily 1 Hari",
      price: 15000,
      stock: 50,
      description: "Voucher WiFi 24 jam dengan bandwidth 20 Mbps",
      category: "voucher",
      isActive: true,
      syncWithGardensNet: true,
      gardensNetId: "gn_002",
      lastSynced: "2024-01-15T10:30:00Z",
      syncStatus: "synced",
    },
    {
      id: "mp_003",
      name: "Weekend 3 Hari",
      price: 35000,
      stock: 25,
      description: "Voucher WiFi 72 jam dengan bandwidth 25 Mbps",
      category: "voucher",
      isActive: true,
      syncWithGardensNet: true,
      gardensNetId: "gn_003",
      lastSynced: "2024-01-15T09:45:00Z",
      syncStatus: "pending",
    },
    {
      id: "mp_004",
      name: "Weekly 1 Minggu",
      price: 75000,
      stock: 10,
      description: "Voucher WiFi 7 hari dengan bandwidth 30 Mbps",
      category: "voucher",
      isActive: true,
      syncWithGardensNet: false,
      syncStatus: "disabled",
    },
  ])

  const [hotspotStats, setHotspotStats] = useState<HotspotStats>({
    activeUsers: 45,
    totalUsers: 1250,
    vouchersGenerated: 89,
    revenue: 1250000,
  })

  const [editingProduct, setEditingProduct] = useState<MikPosProduct | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHotspotStats((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        vouchersGenerated: prev.vouchersGenerated + Math.floor(Math.random() * 2),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleEditProduct = (product: MikPosProduct) => {
    setEditingProduct({ ...product })
    setIsEditDialogOpen(true)
  }

  const handleSaveProduct = async () => {
    if (!editingProduct) return

    try {
      // Update product in MikPos
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)))

      // If sync is enabled, sync to GARDENS-NET
      if (editingProduct.syncWithGardensNet) {
        setIsSyncing(true)

        // Simulate API call to GARDENS-NET
        await fetch("/api/mikpos/products/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-MikPos-Signature": "sha256=sample-signature",
          },
          body: JSON.stringify({
            action: "product_updated",
            product: editingProduct,
            timestamp: new Date().toISOString(),
          }),
        })

        // Update sync status
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, syncStatus: "synced", lastSynced: new Date().toISOString() } : p,
          ),
        )

        toast({
          title: "Product Updated & Synced",
          description: "Product berhasil diupdate dan disinkronisasi ke GARDENS-NET",
        })
      } else {
        toast({
          title: "Product Updated",
          description: "Product berhasil diupdate di MikPos",
        })
      }

      setIsEditDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengupdate product",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleToggleSync = async (productId: string, enabled: boolean) => {
    try {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                syncWithGardensNet: enabled,
                syncStatus: enabled ? "pending" : "disabled",
              }
            : p,
        ),
      )

      if (enabled) {
        // Sync to GARDENS-NET
        const product = products.find((p) => p.id === productId)
        if (product) {
          await fetch("/api/mikpos/products/webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-MikPos-Signature": "sha256=sample-signature",
            },
            body: JSON.stringify({
              action: "product_sync_enabled",
              product: product,
              timestamp: new Date().toISOString(),
            }),
          })

          setProducts((prev) =>
            prev.map((p) =>
              p.id === productId ? { ...p, syncStatus: "synced", lastSynced: new Date().toISOString() } : p,
            ),
          )
        }
      }

      toast({
        title: enabled ? "Sync Enabled" : "Sync Disabled",
        description: `Sinkronisasi ${enabled ? "diaktifkan" : "dinonaktifkan"} untuk produk ini`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah pengaturan sync",
        variant: "destructive",
      })
    }
  }

  const getSyncStatusBadge = (status: string) => {
    const statusConfig = {
      synced: { color: "bg-green-500", icon: CheckCircle, text: "Synced" },
      pending: { color: "bg-yellow-500", icon: Activity, text: "Pending" },
      error: { color: "bg-red-500", icon: AlertTriangle, text: "Error" },
      disabled: { color: "bg-gray-500", icon: Settings, text: "Disabled" },
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString("id-ID")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MikPos Dashboard</h1>
            <p className="text-gray-600">Hotspot Management & Product Synchronization</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Wifi className="w-3 h-3 mr-1" />
              Connected to GARDENS-NET
            </Badge>
            <Button variant="outline" onClick={() => window.open("/admin/products/sync", "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              GARDENS-NET Admin
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{hotspotStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{hotspotStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vouchers Generated</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{hotspotStats.vouchersGenerated}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatPrice(hotspotStats.revenue)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* GARDENS-NET Sync Status */}
        <Alert>
          <Sync className="h-4 w-4" />
          <AlertDescription>
            <strong>GARDENS-NET Integration Active:</strong> Products are automatically synchronized with GARDENS-NET
            e-commerce platform. Changes made here will be reflected on the customer website in real-time.
          </AlertDescription>
        </Alert>

        {/* Product Management */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Product Management</TabsTrigger>
            <TabsTrigger value="sync">Sync Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Product Catalog</CardTitle>
                    <CardDescription>Manage voucher products and sync with GARDENS-NET</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>GARDENS-NET Sync</TableHead>
                        <TableHead>Sync Status</TableHead>
                        <TableHead>Last Synced</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{formatPrice(product.price)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={product.syncWithGardensNet}
                              onCheckedChange={(checked) => handleToggleSync(product.id, checked)}
                            />
                          </TableCell>
                          <TableCell>{getSyncStatusBadge(product.syncStatus)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(product.lastSynced)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
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

          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <CardTitle>GARDENS-NET Synchronization Settings</CardTitle>
                <CardDescription>Configure how products sync with GARDENS-NET e-commerce platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>GARDENS-NET Webhook URL</Label>
                    <Input value="https://gardens-net.com/api/mikpos/products/webhook" readOnly className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Webhook endpoint for product synchronization</p>
                  </div>

                  <div>
                    <Label>Sync Interval</Label>
                    <Input value="5 minutes" readOnly className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Automatic sync frequency</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-sync New Products</Label>
                      <p className="text-sm text-muted-foreground">Automatically sync new products to GARDENS-NET</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real-time Price Updates</Label>
                      <p className="text-sm text-muted-foreground">Sync price changes immediately</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Stock Level Sync</Label>
                      <p className="text-sm text-muted-foreground">Keep stock levels synchronized</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button className="w-full">
                  <Sync className="w-4 h-4 mr-2" />
                  Force Full Synchronization
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Make changes to your product. Changes will be synced to GARDENS-NET if enabled.
              </DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct((prev) => (prev ? { ...prev, price: Number(e.target.value) } : null))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct((prev) => (prev ? { ...prev, stock: Number(e.target.value) } : null))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct((prev) => (prev ? { ...prev, description: e.target.value } : null))
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sync" className="text-right">
                    Sync to GARDENS-NET
                  </Label>
                  <Switch
                    id="sync"
                    checked={editingProduct.syncWithGardensNet}
                    onCheckedChange={(checked) =>
                      setEditingProduct((prev) => (prev ? { ...prev, syncWithGardensNet: checked } : null))
                    }
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct} disabled={isSyncing}>
                {isSyncing ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Sync className="w-4 h-4 mr-2" />
                    Save & Sync
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
