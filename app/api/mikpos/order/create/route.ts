import { type NextRequest, NextResponse } from "next/server"
import { mikposIntegration } from "@/lib/mikpos-integration"

interface CreateOrderRequest {
  session_id: string
  package_id: string
  mikrotik_profile: string
  customer: {
    name: string
    mac_address: string
    ip_address: string
    whatsapp: string
    hotspot_info: {
      interface: string
      server_name: string
      login_url: string
    }
  }
  amount: number
  source: string
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateOrderRequest = await request.json()

    // Validate session
    global.mikposCustomers = global.mikposCustomers || new Map()
    const session = global.mikposCustomers.get(data.session_id)

    if (!session) {
      return NextResponse.json({ error: "Session not found or expired" }, { status: 404 })
    }

    // Validate package
    const packageInfo = mikposIntegration.getProfileInfo(data.package_id)
    if (!packageInfo) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 })
    }

    // Generate order ID
    const orderId = `MIKPOS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create order object
    const order = {
      id: orderId,
      session_id: data.session_id,
      package_id: data.package_id,
      mikrotik_profile: data.mikrotik_profile,
      customer: data.customer,
      amount: data.amount,
      status: "pending",
      source: data.source,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    }

    // Store order (in production, use database)
    global.mikposOrders = global.mikposOrders || new Map()
    global.mikposOrders.set(orderId, order)

    console.log(`Order created: ${orderId} for customer ${data.customer.ip_address}`)

    return NextResponse.json({
      success: true,
      order_id: orderId,
      amount: data.amount,
      expires_at: order.expires_at,
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
