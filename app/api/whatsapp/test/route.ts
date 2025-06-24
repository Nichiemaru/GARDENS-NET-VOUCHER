import { type NextRequest, NextResponse } from "next/server"

interface TestRequest {
  accessToken: string
  phoneNumberId: string
  businessAccountId?: string
  appId?: string
}

export async function POST(request: NextRequest) {
  try {
    const config: TestRequest = await request.json()

    if (!config.accessToken || !config.phoneNumberId) {
      return NextResponse.json({ error: "Access token and phone number ID are required" }, { status: 400 })
    }

    console.log("🧪 Testing WhatsApp connection...")

    // Test WhatsApp Business API connection
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ WhatsApp API test failed:", errorData)
      return NextResponse.json(
        {
          success: false,
          error: errorData.error?.message || "Connection test failed",
        },
        { status: 400 },
      )
    }

    const data = await response.json()
    console.log("✅ WhatsApp API test successful:", data)

    return NextResponse.json({
      success: true,
      phoneNumber: data.display_phone_number || "Unknown",
      businessName: data.verified_name || "GARDENS-NET WiFi",
      status: "verified",
      capabilities: data.code_verification_status,
    })
  } catch (error) {
    console.error("❌ WhatsApp test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
