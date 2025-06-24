"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Shield,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  Wifi,
  Smartphone,
} from "lucide-react"

interface AdminSession {
  email: string
  role: "super" | "viewer"
  loginTime: string
}

interface Product {
  id: string
  name: string
  price: number
  category: "wifi" | "pulsa"
  provider?: string
  description: string
  stock: number
}

interface Order {
  id: string
  customer: { name: string; whatsapp: string }
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  status: string
  createdAt: string
}

interface PaymentSettings {
  apiKey: string
  merchantId: string
  serverKey: string
  webhookUrl: string
  qrisEnabled: boolean
  vaEnabled: boolean
  ewalletEnabled: boolean
}

export default function AdminDashboard() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [products, setProducts] = useState<Product[]>([
    {
      id: "wifi-1day",
      name: "Voucher WiFi Hotspot - 1 Hari",
      price: 5000,
      category: "wifi",
      description: "Akses internet unlimited selama 1 hari",
      stock: 50,
    },
    {
      id: "wifi-1month",
      name: "Voucher WiFi Hotspot - 1 Bulan",
      price: 50000,
      category: "wifi",
      description: "Akses internet unlimited selama 1 bulan",
      stock: 25,
    },
  ])

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORDER-1703123456",
      customer: { name: "John Doe", whatsapp: "628123456789" },
      items: [{ name: "Voucher WiFi Hotspot - 1 Hari", quantity: 2, price: 5000 }],
      total: 10000,
      status: "completed",
      createdAt: "2024-12-21T10:30:00Z",
    },
  ])

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    apiKey: "",
    merchantId: "",
    serverKey: "",
    webhookUrl: "",
    qrisEnabled: true,
    vaEnabled: true,
    ewalletEnabled: true,
  })

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({})
  const router = useRouter()

  useEffect(() => {
    const session = sessionStorage.getItem("adminSession")
    if (!session) {
      router.push("/admin/login")
      return
    }
    setAdminSession(JSON.parse(session))
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("adminSession")
    router.push("/admin/login")
  }

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)))
      setEditingProduct(null)
    } else if (newProduct.name && newProduct.price) {
      const product: Product = {
        id: `product-${Date.now()}`,
        name: newProduct.name,
        price: newProduct.price,
        category: newProduct.category || "wifi",
        provider: newProduct.provider,
        description: newProduct.description || "",
        stock: newProduct.stock || 0,
      }
      setProducts([...products, product])
      setNewProduct({})
    }
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID")
  }

  if (!adminSession) {
    return <div>Loading...</div>
  }

  const isViewer = adminSession.role === "viewer"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">GARDENS-NET</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant={adminSession.role === "super" ? "default" : "secondary"}>
                {adminSession.role === "super" ? "Super Admin" : "Viewer"}
              </Badge>
              <span className="text-sm text-gray-600">{adminSession.email}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Produk
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pesanan
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Manajemen Produk</h2>
              {!isViewer && (
                <Button onClick={() => router.push("/admin/dashboard/add-product")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk
                </Button>
              )}
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Produk</CardTitle>
                <CardDescription>Total {products.length} produk</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {product.category === "wifi" ? (
                              <Wifi className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Smartphone className="h-5 w-5 text-green-600" />
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.description}</p>
                              {product.provider && (
                                <Badge variant="outline" className="mt-1">
                                  {product.provider}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.category === "wifi" ? "default" : "secondary"}>
                            {product.category === "wifi" ? "WiFi" : "Pulsa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                          >
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                            {product.stock > 0 ? "Tersedia" : "Habis"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {!isViewer && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {isViewer && (
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Manajemen Pesanan</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Riwayat Transaksi</CardTitle>
                <CardDescription>Total {orders.length} transaksi</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pesanan</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer.name}</p>
                            <p className="text-sm text-gray-500">{order.customer.whatsapp}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.name} x{item.quantity}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {order.status === "completed"
                              ? "Berhasil"
                              : order.status === "pending"
                                ? "Pending"
                                : "Gagal"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Pengaturan Payment Gateway</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Konfigurasi API</CardTitle>
                <CardDescription>Pengaturan integrasi dengan payment gateway</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type={isViewer ? "password" : "text"}
                      value={paymentSettings.apiKey}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, apiKey: e.target.value })}
                      placeholder="Masukkan API Key"
                      disabled={isViewer}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="merchantId">Merchant ID / Client Key</Label>
                    <Input
                      id="merchantId"
                      type={isViewer ? "password" : "text"}
                      value={paymentSettings.merchantId}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, merchantId: e.target.value })}
                      placeholder="Masukkan Merchant ID"
                      disabled={isViewer}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serverKey">Server Key</Label>
                    <Input
                      id="serverKey"
                      type={isViewer ? "password" : "text"}
                      value={paymentSettings.serverKey}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, serverKey: e.target.value })}
                      placeholder="Masukkan Server Key"
                      disabled={isViewer}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">URL Webhook / Notifikasi</Label>
                    <Input
                      id="webhookUrl"
                      value={paymentSettings.webhookUrl}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, webhookUrl: e.target.value })}
                      placeholder="https://yourdomain.com/webhook"
                      disabled={isViewer}
                    />
                  </div>
                </div>

                {!isViewer && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Pengaturan
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metode Pembayaran</CardTitle>
                <CardDescription>Aktifkan atau nonaktifkan metode pembayaran</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>QRIS (Semua Bank & E-Wallet)</Label>
                    <p className="text-sm text-gray-500">Pembayaran menggunakan QR Code</p>
                  </div>
                  <Switch
                    checked={paymentSettings.qrisEnabled}
                    onCheckedChange={(checked) =>
                      !isViewer && setPaymentSettings({ ...paymentSettings, qrisEnabled: checked })
                    }
                    disabled={isViewer}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Virtual Account</Label>
                    <p className="text-sm text-gray-500">Transfer bank melalui virtual account</p>
                  </div>
                  <Switch
                    checked={paymentSettings.vaEnabled}
                    onCheckedChange={(checked) =>
                      !isViewer && setPaymentSettings({ ...paymentSettings, vaEnabled: checked })
                    }
                    disabled={isViewer}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-Wallet</Label>
                    <p className="text-sm text-gray-500">GoPay, OVO, DANA, dll</p>
                  </div>
                  <Switch
                    checked={paymentSettings.ewalletEnabled}
                    onCheckedChange={(checked) =>
                      !isViewer && setPaymentSettings({ ...paymentSettings, ewalletEnabled: checked })
                    }
                    disabled={isViewer}
                  />
                </div>
              </CardContent>
            </Card>

            {isViewer && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <Eye className="h-5 w-5" />
                    <p className="text-sm">Anda login sebagai viewer. Beberapa pengaturan tidak dapat diubah.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
