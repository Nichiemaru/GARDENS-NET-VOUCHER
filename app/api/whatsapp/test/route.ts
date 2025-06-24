import { type NextRequest, NextResponse } from "next/server"
import { whatsappAPI } from "@/lib/whatsapp-api"

export async function POST(request: NextRequest) {
  try {
    const { phone, message, test_type } = await request.json()

    console.log("🧪 Testing WhatsApp API...")
    console.log("Phone:", phone)
    console.log("Test Type:", test_type)

    // Check environment variables
    const requiredEnvs = {
      WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    }

    const missingEnvs = Object.entries(requiredEnvs)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingEnvs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          missing: missingEnvs,
          status: "configuration_error",
        },
        { status: 400 },
      )
    }

    let result = false
    let testResult: any = {}

    switch (test_type) {
      case "connection":
        result = await whatsappAPI.testConnection()
        testResult = {
          type: "Connection Test",
          description: "Test WhatsApp Business API connection",
          result: result ? "✅ Connected" : "❌ Failed to connect",
        }
        break

      case "simple_message":
        result = await whatsappAPI.sendTextMessage(phone, message || "Test message from GARDENS-NET")
        testResult = {
          type: "Simple Message Test",
          description: "Send basic text message",
          result: result ? "✅ Message sent" : "❌ Failed to send",
        }
        break

      case "voucher_notification":
        const mockVoucher = {
          code: "WIFI-TEST-123456",
          profile_name: "Daily 1 Hari",
          bandwidth: "20 Mbps",
          duration: "24 Jam",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          customer_name: "Test Customer",
          hotspot_login_url: "http://192.168.1.1/login",
        }
        result = await whatsappAPI.sendVoucherNotification(phone, mockVoucher)
        testResult = {
          type: "Voucher Notification Test",
          description: "Send complete voucher message with instructions",
          result: result ? "✅ Voucher notification sent" : "❌ Failed to send voucher",
          voucher_code: mockVoucher.code,
        }
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid test type",
            available_types: ["connection", "simple_message", "voucher_notification"],
          },
          { status: 400 },
        )
    }

    return NextResponse.json({
      success: result,
      test: testResult,
      timestamp: new Date().toISOString(),
      environment: {
        has_access_token: !!process.env.WHATSAPP_ACCESS_TOKEN,
        has_phone_number_id: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
        has_webhook_token: !!process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
      },
    })
  } catch (error) {
    console.error("WhatsApp test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "WhatsApp API Test Endpoint",
    available_methods: ["POST"],
    test_types: ["connection", "simple_message", "voucher_notification"],
    required_env_vars: ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_WEBHOOK_VERIFY_TOKEN"],
  })
}
