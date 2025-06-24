import { type NextRequest, NextResponse } from "next/server"

interface VoucherGenerationRequest {
  session_id: string
  profile: string
  customer: {
    name: string
    whatsapp: string
    mac_address?: string
    ip_address?: string
  }
  payment_status: "success" | "pending" | "failed"
}

export async function POST(request: NextRequest) {
  try {
    const data: VoucherGenerationRequest = await request.json()

    // Verify request authenticity
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (data.payment_status !== "success") {
      return NextResponse.json(
        {
          error: "Payment not completed",
          status: data.payment_status,
        },
        { status: 400 },
      )
    }

    // Generate voucher code
    const voucherCode = generateVoucherCode(data.profile)

    // In production, you would:
    // 1. Create voucher in MikroTik RouterOS
    // 2. Store voucher in database
    // 3. Send WhatsApp notification
    // 4. Update MikPos system

    const voucher = {
      code: voucherCode,
      profile: data.profile,
      customer: data.customer,
      created_at: new Date().toISOString(),
      expires_at: calculateExpiryDate(data.profile),
      status: "active",
    }

    // Simulate sending to MikPos webhook
    await notifyMikPos(data.session_id, voucher)

    // Simulate WhatsApp notification
    await sendWhatsAppNotification(data.customer.whatsapp, voucher)

    return NextResponse.json({
      success: true,
      voucher: voucher,
      message: "Voucher generated and sent successfully",
    })
  } catch (error) {
    console.error("Voucher generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate voucher",
      },
      { status: 500 },
    )
  }
}

function generateVoucherCode(profile: string): string {
  const prefix = profile.toUpperCase().substring(0, 4)
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

function calculateExpiryDate(profile: string): string {
  const now = new Date()

  switch (profile) {
    case "1hour":
      now.setHours(now.getHours() + 1)
      break
    case "1day":
      now.setDate(now.getDate() + 1)
      break
    case "3days":
      now.setDate(now.getDate() + 3)
      break
    case "1week":
      now.setDate(now.getDate() + 7)
      break
    default:
      now.setDate(now.getDate() + 1)
  }

  return now.toISOString()
}

async function notifyMikPos(sessionId: string, voucher: any) {
  // In production, send webhook to MikPos system
  console.log(`Notifying MikPos for session ${sessionId}:`, voucher)

  // Example webhook call to MikPos
  // await fetch('http://mikpos-server/webhook/voucher-generated', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer YOUR_MIKPOS_SECRET'
  //   },
  //   body: JSON.stringify({
  //     session_id: sessionId,
  //     voucher: voucher
  //   })
  // })
}

async function sendWhatsAppNotification(whatsapp: string, voucher: any) {
  // In production, integrate with WhatsApp Business API
  console.log(`Sending WhatsApp to ${whatsapp}:`)
  console.log(`Kode Voucher WiFi Anda: ${voucher.code}`)
  console.log(`Profil: ${voucher.profile}`)
  console.log(`Berlaku hingga: ${new Date(voucher.expires_at).toLocaleString("id-ID")}`)

  // Example WhatsApp API call
  // await fetch('https://api.whatsapp.com/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': 'Bearer YOUR_WHATSAPP_TOKEN',
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     to: whatsapp,
  //     message: `Kode Voucher WiFi Anda: ${voucher.code}\nProfil: ${voucher.profile}\nBerlaku hingga: ${new Date(voucher.expires_at).toLocaleString('id-ID')}`
  //   })
  // })
}
