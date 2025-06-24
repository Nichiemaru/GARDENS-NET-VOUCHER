import { type NextRequest, NextResponse } from "next/server"

// Mock database reference
const routers: any[] = []

// POST - Test router connection
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const routerIndex = routers.findIndex((r) => r.id === params.id)

    if (routerIndex === -1) {
      return NextResponse.json({ error: "Router not found" }, { status: 404 })
    }

    const router = routers[routerIndex]

    // Update status to testing
    routers[routerIndex].status = "testing"

    // Simulate connection test
    console.log(`Testing connection to ${router.host}:${router.port}`)
    console.log(`Username: ${router.username}`)
    console.log(`SSL: ${router.ssl_enabled ? "Enabled" : "Disabled"}`)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate connection result (70% success rate)
    const isConnected = Math.random() > 0.3

    if (isConnected) {
      // Update router status on success
      routers[routerIndex] = {
        ...routers[routerIndex],
        status: "connected",
        last_check: new Date().toISOString(),
        active_users: Math.floor(Math.random() * 25),
        uptime: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
        version: "7.10.2",
        model: "RB4011iGS+",
      }

      return NextResponse.json({
        success: true,
        message: "Connection successful",
        data: {
          status: "connected",
          response_time: Math.floor(Math.random() * 100) + 50, // 50-150ms
          version: "7.10.2",
          model: "RB4011iGS+",
          uptime: routers[routerIndex].uptime,
          active_users: routers[routerIndex].active_users,
        },
      })
    } else {
      // Update router status on failure
      routers[routerIndex] = {
        ...routers[routerIndex],
        status: "error",
        last_check: new Date().toISOString(),
      }

      return NextResponse.json({
        success: false,
        error: "Connection failed - Check credentials and network connectivity",
        data: {
          status: "error",
          error_code: "CONNECTION_TIMEOUT",
          last_attempt: new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    console.error("Test connection error:", error)

    // Update router status on error
    const routerIndex = routers.findIndex((r) => r.id === params.id)
    if (routerIndex !== -1) {
      routers[routerIndex] = {
        ...routers[routerIndex],
        status: "error",
        last_check: new Date().toISOString(),
      }
    }

    return NextResponse.json({
      success: false,
      error: "Test connection failed",
      data: {
        status: "error",
        error_code: "INTERNAL_ERROR",
        last_attempt: new Date().toISOString(),
      },
    })
  }
}
