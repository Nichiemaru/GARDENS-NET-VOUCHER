import { type NextRequest, NextResponse } from "next/server"

interface MikPosWebhookData {
  action: "redirect_purchase" | "voucher_request" | "payment_status"
  customer: {
    name?: string
    phone?: string
    mac_address?: string
    ip_address?: string
  }
  voucher: {
    profile?: string
    duration?: string
    price?: number
  }
  session_id?: string
  redirect_url?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: MikPosWebhookData = await request.json()

    // Verify webhook authenticity (add your secret key validation here)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    switch (data.action) {
      case "redirect_purchase":
        return handleRedirectPurchase(data)

      case "voucher_request":
        return handleVoucherRequest(data)

      case "payment_status":
        return handlePaymentStatus(data)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("MikPos webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleRedirectPurchase(data: MikPosWebhookData) {
  // Generate session for MikPos customer
  const sessionId = `mikpos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Store customer data temporarily
  const customerData = {
    name: data.customer.name || "Customer MikPos",
    whatsapp: data.customer.phone || "",
    mac_address: data.customer.mac_address,
    ip_address: data.customer.ip_address,
    session_id: sessionId,
    source: "mikpos",
    voucher_profile: data.voucher.profile,
    created_at: new Date().toISOString(),
  }

  // In production, store this in your database
  // For demo, we'll use a simple in-memory store
  global.mikposCustomers = global.mikposCustomers || new Map()
  global.mikposCustomers.set(sessionId, customerData)

  // Create redirect URL to our website
  const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/mikpos/redirect?session=${sessionId}`

  return NextResponse.json({
    success: true,
    redirect_url: redirectUrl,
    session_id: sessionId,
    message: "Redirect URL generated successfully",
  })
}

async function handleVoucherRequest(data: MikPosWebhookData) {
  // Handle voucher generation request from MikPos
  const sessionId = data.session_id

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 })
  }

  // Get customer data
  global.mikposCustomers = global.mikposCustomers || new Map()
  const customerData = global.mikposCustomers.get(sessionId)

  if (!customerData) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }

  // Generate voucher code
  const voucherCode = `WIFI-${Math.random().toString(36).substr(2, 8).toUpperCase()}`

  // In production, you would:
  // 1. Validate payment status
  // 2. Generate actual voucher in MikroTik
  // 3. Store voucher in database
  // 4. Send to customer via WhatsApp

  return NextResponse.json({
    success: true,
    voucher_code: voucherCode,
    customer: customerData,
    message: "Voucher generated successfully",
  })
}

async function handlePaymentStatus(data: MikPosWebhookData) {
  // Handle payment status updates from payment gateway
  return NextResponse.json({
    success: true,
    message: "Payment status updated",
  })
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: "ok",
    service: "GARDENS-NET MikPos Integration",
    timestamp: new Date().toISOString(),
  })
}
