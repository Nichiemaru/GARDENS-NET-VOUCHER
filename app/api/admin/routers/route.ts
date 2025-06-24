import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Mock database - in production, use real database
let routers: any[] = [
  {
    id: "router-1",
    name: "Router Utama",
    host: "192.168.1.1",
    username: "admin",
    password: "admin123",
    port: 8728,
    ssl_enabled: false,
    status: "connected",
    last_check: new Date().toISOString(),
    active_users: 15,
    total_vouchers: 127,
    uptime: "7d 12h 30m",
    version: "7.10.2",
    model: "RB4011iGS+",
    location: "Kantor Pusat",
    description: "Router utama untuk area kantor",
    is_primary: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "router-2",
    name: "Router Cabang A",
    host: "192.168.2.1",
    username: "admin",
    password: "admin456",
    port: 8728,
    ssl_enabled: true,
    status: "connected",
    last_check: new Date().toISOString(),
    active_users: 8,
    total_vouchers: 45,
    uptime: "3d 8h 15m",
    version: "7.9.1",
    model: "hEX S",
    location: "Cabang Jakarta",
    description: "Router untuk cabang Jakarta",
    is_primary: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "router-3",
    name: "Router Backup",
    host: "192.168.1.2",
    username: "admin",
    password: "backup789",
    port: 8728,
    ssl_enabled: false,
    status: "disconnected",
    last_check: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    active_users: 0,
    total_vouchers: 12,
    uptime: "0s",
    version: "7.8.3",
    model: "RB951Ui-2HnD",
    location: "Kantor Pusat",
    description: "Router backup untuk failover",
    is_primary: false,
    created_at: new Date().toISOString(),
  },
]

// GET - List all routers
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      routers: routers,
      total: routers.length,
      connected: routers.filter((r) => r.status === "connected").length,
      active_users: routers.reduce((sum, r) => sum + r.active_users, 0),
      total_vouchers: routers.reduce((sum, r) => sum + r.total_vouchers, 0),
    })
  } catch (error) {
    console.error("Failed to get routers:", error)
    return NextResponse.json({ error: "Failed to get routers" }, { status: 500 })
  }
}

// POST - Add new router
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.host || !data.username || !data.password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if host already exists
    const existingRouter = routers.find((r) => r.host === data.host)
    if (existingRouter) {
      return NextResponse.json({ error: "Router with this IP already exists" }, { status: 400 })
    }

    // If this is set as primary, remove primary from others
    if (data.is_primary) {
      routers = routers.map((r) => ({ ...r, is_primary: false }))
    }

    // Create new router
    const newRouter = {
      id: uuidv4(),
      name: data.name,
      host: data.host,
      username: data.username,
      password: data.password,
      port: data.port || 8728,
      ssl_enabled: data.ssl_enabled || false,
      status: "disconnected",
      last_check: null,
      active_users: 0,
      total_vouchers: 0,
      uptime: "0s",
      version: "Unknown",
      model: "Unknown",
      location: data.location || "",
      description: data.description || "",
      is_primary: data.is_primary || false,
      created_at: new Date().toISOString(),
    }

    routers.push(newRouter)

    // Test connection immediately
    setTimeout(() => {
      testRouterConnection(newRouter.id)
    }, 1000)

    return NextResponse.json({
      success: true,
      message: "Router added successfully",
      router: newRouter,
    })
  } catch (error) {
    console.error("Failed to add router:", error)
    return NextResponse.json({ error: "Failed to add router" }, { status: 500 })
  }
}

// Helper function to test router connection
async function testRouterConnection(routerId: string) {
  const routerIndex = routers.findIndex((r) => r.id === routerId)
  if (routerIndex === -1) return

  try {
    // Update status to testing
    routers[routerIndex].status = "testing"

    // Simulate connection test (in production, use real MikroTik API)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate random success/failure
    const isConnected = Math.random() > 0.3 // 70% success rate

    if (isConnected) {
      routers[routerIndex] = {
        ...routers[routerIndex],
        status: "connected",
        last_check: new Date().toISOString(),
        active_users: Math.floor(Math.random() * 20),
        uptime: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
        version: "7.10.2",
        model: "RB4011iGS+",
      }
    } else {
      routers[routerIndex] = {
        ...routers[routerIndex],
        status: "error",
        last_check: new Date().toISOString(),
      }
    }
  } catch (error) {
    routers[routerIndex] = {
      ...routers[routerIndex],
      status: "error",
      last_check: new Date().toISOString(),
    }
  }
}
