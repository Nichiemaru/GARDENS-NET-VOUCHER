import { NextResponse } from "next/server"
import { whatsappAPI } from "@/lib/whatsapp-api"

export async function GET() {
  try {
    // Test WhatsApp connection
    const isConnected = await whatsappAPI.testConnection()

    // Simulate status data (in production, get from database)
    const status = {
      connection: isConnected ? "connected" : "disconnected",
      phoneNumber: process.env.WHATSAPP_PHONE_NUMBER_ID ? "+62 812-3456-7890" : "",
      businessName: isConnected ? "GARDENS-NET WiFi" : "",
      lastCheck: new Date().toISOString(),
      messagesSent: Math.floor(Math.random() * 100) + 50,
      messagesDelivered: Math.floor(Math.random() * 90) + 45,
      messagesRead: Math.floor(Math.random() * 80) + 40,
      messagesFailed: Math.floor(Math.random() * 5),
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Failed to get WhatsApp status:", error)
    return NextResponse.json(
      {
        connection: "error",
        phoneNumber: "",
        businessName: "",
        lastCheck: new Date().toISOString(),
        messagesSent: 0,
        messagesDelivered: 0,
        messagesRead: 0,
        messagesFailed: 0,
      },
      { status: 500 },
    )
  }
}
