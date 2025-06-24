import { type NextRequest, NextResponse } from "next/server"

interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
  appId: string
  webhookVerifyToken: string
  webhookUrl: string
  enabled: boolean
}

// In-memory storage for demo (use database in production)
let whatsappConfig: WhatsAppConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
  appId: process.env.WHATSAPP_APP_ID || "",
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
  webhookUrl: process.env.WHATSAPP_WEBHOOK_URL || "",
  enabled: process.env.WHATSAPP_ENABLED === "true",
}

export async function GET() {
  try {
    // Return config without sensitive data for frontend
    const safeConfig = {
      ...whatsappConfig,
      accessToken: whatsappConfig.accessToken ? "***" + whatsappConfig.accessToken.slice(-4) : "",
    }

    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error("Failed to get WhatsApp config:", error)
    return NextResponse.json({ error: "Failed to get configuration" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: WhatsAppConfig = await request.json()

    // Validate required fields
    if (!config.accessToken || !config.phoneNumberId) {
      return NextResponse.json({ error: "Access token and phone number ID are required" }, { status: 400 })
    }

    // Update configuration
    whatsappConfig = {
      ...whatsappConfig,
      ...config,
    }

    console.log("✅ WhatsApp configuration updated")

    // In production, save to database
    // await saveWhatsAppConfig(whatsappConfig)

    return NextResponse.json({
      success: true,
      message: "WhatsApp configuration saved successfully",
    })
  } catch (error) {
    console.error("Failed to save WhatsApp config:", error)
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 })
  }
}
