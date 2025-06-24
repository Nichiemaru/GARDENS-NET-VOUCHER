import { type NextRequest, NextResponse } from "next/server"
import { whatsappAPI } from "@/lib/whatsapp-api"

interface WhatsAppSendRequest {
  to: string
  message: string
  voucher: {
    code: string
    profile: string
    bandwidth: string
    validity: string
  }
  customer: {
    name: string
    whatsapp: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: WhatsAppSendRequest = await request.json()

    // Validate request data
    if (!data.to || !data.message || !data.voucher || !data.customer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("📱 Sending WhatsApp voucher to:", data.customer.name)
    console.log("📞 WhatsApp number:", data.to)
    console.log("🎫 Voucher code:", data.voucher.code)

    // Format voucher message for WhatsApp
    const voucherMessage = {
      code: data.voucher.code,
      profile_name: data.voucher.profile,
      bandwidth: data.voucher.bandwidth,
      duration: data.voucher.validity,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      customer_name: data.customer.name,
      hotspot_login_url: "http://192.168.1.1/login", // Default hotspot login URL
    }

    // Send WhatsApp message
    const success = await whatsappAPI.sendVoucherNotification(data.to, voucherMessage)

    if (success) {
      // Log successful delivery
      console.log("✅ WhatsApp voucher sent successfully")

      // Simulate database logging
      const deliveryLog = {
        id: `delivery_${Date.now()}`,
        voucher_code: data.voucher.code,
        customer_name: data.customer.name,
        whatsapp_number: data.to,
        sent_at: new Date().toISOString(),
        status: "delivered",
        message_length: data.message.length,
      }

      console.log("📝 Delivery logged:", deliveryLog)

      return NextResponse.json({
        success: true,
        message: "WhatsApp voucher sent successfully",
        delivery_id: deliveryLog.id,
        sent_to: data.customer.name,
        whatsapp_number: data.to,
        voucher_code: data.voucher.code,
        sent_at: deliveryLog.sent_at,
      })
    } else {
      throw new Error("Failed to send WhatsApp message")
    }
  } catch (error) {
    console.error("❌ WhatsApp send error:", error)

    return NextResponse.json(
      {
        error: "Failed to send WhatsApp message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GET endpoint for testing WhatsApp connection
export async function GET() {
  try {
    const isConnected = await whatsappAPI.testConnection()

    return NextResponse.json({
      status: isConnected ? "connected" : "disconnected",
      service: "WhatsApp Business API",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
