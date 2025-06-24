import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check WhatsApp configuration status
    const whatsappConfigured = !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)

    // Check MikroTik configuration status
    const mikrotikConfigured = !!(
      process.env.MIKROTIK_HOST &&
      process.env.MIKROTIK_USERNAME &&
      process.env.MIKROTIK_PASSWORD
    )

    // Check MikPos configuration status
    const mikposConfigured = !!(process.env.MIKPOS_BASE_URL && process.env.MIKPOS_API_KEY)

    const status = {
      whatsapp: {
        configured: whatsappConfigured,
        tested: false, // This would be updated after actual tests
        last_test: null,
      },
      mikrotik: {
        configured: mikrotikConfigured,
        connected: false, // This would be updated after connection tests
        last_check: null,
      },
      mikpos: {
        configured: mikposConfigured,
        webhook_active: false, // This would be updated after webhook tests
        last_webhook: null,
      },
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Failed to get config status:", error)
    return NextResponse.json({ error: "Failed to get config status" }, { status: 500 })
  }
}
