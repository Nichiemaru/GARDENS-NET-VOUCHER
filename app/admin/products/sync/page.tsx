"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  RefreshCw,
  FolderSyncIcon as Sync,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  ArrowRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  description: string
  category: string
  image?: string
  lastUpdated: string
  source: "mikpos" | "gardens-net"
}

interface ProductComparison {
  id: string
  mikposProduct?: Product
  gardensNetProduct?: Product
  status: "added" | "updated" | "deleted" | "conflict" | "synced"
  differences: string[]
}

interface SyncStats {
  totalProducts: number
  syncedProducts: number
  pendingSync: number
  syncErrors: number
  lastSyncTime: string
  isAutoSyncEnabled: boolean
}

export default function ProductSyncPage() {
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalProducts: 0,
    syncedProducts: 0,
    pendingSync: 0,
    syncErrors: 0,
    lastSyncTime: "",
    isAutoSyncEnabled: true,
  })

  const [productComparisons, setProductComparisons] = useState<ProductComparison[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { toast } = useToast()

  // Load sync data
  const loadSyncData = async () => {
    setIsLoading(true)
    try {
      // Get sync status
      const statusResponse = await fetch("/api/mikpos/products/sync/status")
      const statusData = await statusResponse.json()
      setSyncStats(statusData)

      // Get product comparisons
      const compareResponse = await fetch("/api/mikpos/products/compare")
      const compareData = await compareResponse.json()
      setProductComparisons(compareData.comparisons || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sync data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Full sync all products
  const handleFullSync = async () => {
    setIsSyncing(true)
    setSyncProgress(0)

    try {
      const response = await fetch("/api/mikpos/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "full_sync" }),
      })

      const data = await response.json()

      if (data.success) {
        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          setSyncProgress(i)
          await new Promise((resolve) => setTimeout(resolve, 200))
        }

        toast({
          title: "Sync Complete",
          description: `Successfully synced ${data.syncedCount} products`,
        })

        await loadSyncData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
      setSyncProgress(0)
    }
  }

  // Sync single product
  const handleSingleSync = async (productId: string) => {
    try {
      const response = await fetch("/api/mikpos/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "single_product",
          productId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Product Synced",
          description: "Product synchronized successfully",
        })
        await loadSyncData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      added: { color: "bg-green-500", icon: CheckCircle, text: "Added" },
      updated: { color: "bg-blue-500", icon: RefreshCw, text: "Updated" },
      deleted: { color: "bg-red-500", icon: XCircle, text: "Deleted" },
      conflict: { color: "bg-yellow-500", icon: AlertTriangle, text: "Conflict" },
      synced: { color: "bg-gray-500", icon: CheckCircle, text: "Synced" },
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

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price)
  }

  // Auto refresh
  useEffect(() => {
    loadSyncData()

    if (autoRefresh) {
      const interval = setInterval(loadSyncData, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Synchronization</h1>
          <p className="text-muted-foreground">Manage product synchronization between MikPos and GARDENS-NET</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSyncData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleFullSync} disabled={isSyncing}>
            <Sync className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            Full Sync
          </Button>
        </div>
      </div>

      {/* Sync Progress */}
      {isSyncing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Synchronizing products...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synced Products</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{syncStats.syncedProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{syncStats.pendingSync}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{syncStats.syncErrors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Last Sync Info */}
      {syncStats.lastSyncTime && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Last synchronization: {new Date(syncStats.lastSyncTime).toLocaleString("id-ID")}
            {syncStats.isAutoSyncEnabled && " • Auto-sync enabled"}
          </AlertDescription>
        </Alert>
      )}

      {/* Product Comparisons */}
      <Card>
        <CardHeader>
          <CardTitle>Product Differences</CardTitle>
          <CardDescription>Compare products between MikPos and GARDENS-NET systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>MikPos</TableHead>
                  <TableHead className="text-center">
                    <ArrowRight className="w-4 h-4 mx-auto" />
                  </TableHead>
                  <TableHead>GARDENS-NET</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productComparisons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {isLoading ? "Loading products..." : "All products are synchronized"}
                    </TableCell>
                  </TableRow>
                ) : (
                  productComparisons.map((comparison) => (
                    <TableRow key={comparison.id}>
                      <TableCell className="font-medium">
                        {comparison.mikposProduct?.name || comparison.gardensNetProduct?.name}
                      </TableCell>

                      {/* MikPos Product */}
                      <TableCell>
                        {comparison.mikposProduct ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{formatPrice(comparison.mikposProduct.price)}</div>
                            <div className="text-xs text-muted-foreground">Stock: {comparison.mikposProduct.stock}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not found</span>
                        )}
                      </TableCell>

                      {/* Arrow */}
                      <TableCell className="text-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>

                      {/* GARDENS-NET Product */}
                      <TableCell>
                        {comparison.gardensNetProduct ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{formatPrice(comparison.gardensNetProduct.price)}</div>
                            <div className="text-xs text-muted-foreground">
                              Stock: {comparison.gardensNetProduct.stock}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not found</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(comparison.status)}</TableCell>

                      {/* Actions */}
                      <TableCell>
                        {comparison.status !== "synced" && (
                          <Button size="sm" variant="outline" onClick={() => handleSingleSync(comparison.id)}>
                            <Sync className="w-3 h-3 mr-1" />
                            Sync
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Auto Refresh Toggle */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Auto-refresh every 30 seconds</span>
        <Button variant="ghost" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
          {autoRefresh ? "Disable" : "Enable"} Auto-refresh
        </Button>
      </div>
    </div>
  )
}
