import { type NextRequest, NextResponse } from "next/server"

interface CreateOrderRequest {
  session_id: string
  package_id: string
  customer: {
    name: string
    whatsapp: string
    mac_address: string
    ip_address: string
  }
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateOrderRequest = await request.json()

    // Validate request data
    if (!data.session_id || !data.package_id || !data.customer.whatsapp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify session exists
    global.mikposCustomers = global.mikposCustomers || new Map()
    const sessionData = global.mikposCustomers.get(data.session_id)

    if (!sessionData) {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 })
    }

    // Generate order ID
    const orderId = `MIKPOS_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create order data
    const orderData = {
      order_id: orderId,
      session_id: data.session_id,
      package_id: data.package_id,
      customer: data.customer,
      amount: data.amount,
      status: "pending",
      source: "mikpos",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    }

    // Store order (in production, use database)
    global.mikposOrders = global.mikposOrders || new Map()
    global.mikposOrders.set(orderId, orderData)

    // Update session with order info
    sessionData.order_id = orderId
    sessionData.whatsapp = data.customer.whatsapp
    global.mikposCustomers.set(data.session_id, sessionData)

    return NextResponse.json({
      success: true,
      order_id: orderId,
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
