import { type NextRequest, NextResponse } from "next/server"
import { mikposIntegration } from "@/lib/mikpos-integration"

interface MikPosWebhookPayload {
  action: "voucher_purchase_request" | "customer_redirect" | "payment_notification"
  customer: {
    name?: string
    mac_address: string
    ip_address: string
    user_agent?: string
    session_id?: string
  }
  hotspot: {
    interface: string
    server_name: string
    login_url: string
  }
  requested_profile?: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get("x-mikpos-signature") || ""

    // Verify webhook signature
    if (!mikposIntegration.verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data: MikPosWebhookPayload = JSON.parse(payload)

    console.log("MikPos webhook received:", data.action, data.customer.ip_address)

    switch (data.action) {
      case "voucher_purchase_request":
        return await handleVoucherPurchaseRequest(data)

      case "customer_redirect":
        return await handleCustomerRedirect(data)

      case "payment_notification":
        return await handlePaymentNotification(data)

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("MikPos webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleVoucherPurchaseRequest(data: MikPosWebhookPayload) {
  try {
    // Generate redirect URL for customer
    const redirectUrl = await mikposIntegration.generateRedirectUrl({
      name: data.customer.name || `Customer-${data.customer.ip_address}`,
      mac_address: data.customer.mac_address,
      ip_address: data.customer.ip_address,
      requested_profile: data.requested_profile,
      hotspot_info: data.hotspot,
      user_agent: data.customer.user_agent,
    })

    // Store session for tracking
    const sessionId = redirectUrl.split("session=")[1]

    // Log the request
    console.log(`Voucher purchase request from ${data.customer.ip_address} (${data.customer.mac_address})`)
    console.log(`Generated redirect URL: ${redirectUrl}`)

    return NextResponse.json({
      success: true,
      redirect_url: redirectUrl,
      session_id: sessionId,
      message: "Redirect URL generated successfully",
      expires_in: 1800, // 30 minutes
    })
  } catch (error) {
    console.error("Error handling voucher purchase request:", error)
    return NextResponse.json({ error: "Failed to generate redirect URL" }, { status: 500 })
  }
}

async function handleCustomerRedirect(data: MikPosWebhookPayload) {
  // Handle direct customer redirect from MikPos interface
  try {
    const redirectUrl = await mikposIntegration.generateRedirectUrl({
      name: data.customer.name,
      mac_address: data.customer.mac_address,
      ip_address: data.customer.ip_address,
      hotspot_info: data.hotspot,
    })

    return NextResponse.json({
      success: true,
      redirect_url: redirectUrl,
      message: "Customer redirect processed",
    })
  } catch (error) {
    console.error("Error handling customer redirect:", error)
    return NextResponse.json({ error: "Failed to process redirect" }, { status: 500 })
  }
}

async function handlePaymentNotification(data: MikPosWebhookPayload) {
  // Handle payment status updates
  return NextResponse.json({
    success: true,
    message: "Payment notification received",
  })
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "GARDENS-NET MikPos Webhook",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
}
