import { type NextRequest, NextResponse } from "next/server"
import { whatsappAPI } from "@/lib/whatsapp-api"
import { mikrotikAPI } from "@/lib/mikrotik-api"

export async function POST(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const { type } = params

    if (type === "whatsapp") {
      // Test WhatsApp API connection
      const success = await whatsappAPI.testConnection()

      return NextResponse.json({
        success,
        message: success ? "WhatsApp API connection successful" : "WhatsApp API connection failed",
        timestamp: new Date().toISOString(),
      })
    } else if (type === "mikrotik") {
      // Test MikroTik connection
      const success = await mikrotikAPI.testConnection()

      return NextResponse.json({
        success,
        message: success ? "MikroTik connection successful" : "MikroTik connection failed",
        timestamp: new Date().toISOString(),
      })
    } else if (type === "mikpos") {
      // Test MikPos API connection
      const baseUrl = process.env.MIKPOS_BASE_URL
      const apiKey = process.env.MIKPOS_API_KEY

      if (!baseUrl || !apiKey) {
        return NextResponse.json({
          success: false,
          message: "MikPos configuration incomplete",
          timestamp: new Date().toISOString(),
        })
      }

      try {
        const response = await fetch(`${baseUrl}/api/health`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        })

        const success = response.ok

        return NextResponse.json({
          success,
          message: success ? "MikPos API connection successful" : "MikPos API connection failed",
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: "MikPos API connection failed",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ error: "Invalid test type" }, { status: 400 })
  } catch (error) {
    console.error(`Failed to test ${params.type}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
