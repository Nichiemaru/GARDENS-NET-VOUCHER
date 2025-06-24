import { type NextRequest, NextResponse } from "next/server"
import { mikposIntegration } from "@/lib/mikpos-integration"
import { whatsappAPI } from "@/lib/whatsapp-api"

interface PaymentSuccessRequest {
  order_id: string
  payment_method: string
  transaction_id: string
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const data: PaymentSuccessRequest = await request.json()

    // Get order
    global.mikposOrders = global.mikposOrders || new Map()
    const order = global.mikposOrders.get(data.order_id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order already processed" }, { status: 400 })
    }

    // Generate voucher in MikroTik
    const voucher = await mikposIntegration.createVoucher(order.package_id, order.customer)

    // Update order status
    order.status = "completed"
    order.voucher_code = voucher.code
    order.voucher_expires_at = voucher.expires_at
    order.payment_method = data.payment_method
    order.transaction_id = data.transaction_id
    order.completed_at = new Date().toISOString()

    global.mikposOrders.set(data.order_id, order)

    // Store voucher
    global.mikposVouchers = global.mikposVouchers || new Map()
    global.mikposVouchers.set(voucher.code, {
      code: voucher.code,
      profile: order.package_id,
      mikrotik_profile: order.mikrotik_profile,
      customer: order.customer,
      order_id: data.order_id,
      status: "active",
      created_at: new Date().toISOString(),
      expires_at: voucher.expires_at,
    })

    // Send WhatsApp notification
    const whatsappSent = await whatsappAPI.sendVoucherNotification(order.customer.whatsapp, {
      code: voucher.code,
      profile: order.package_id,
      expires_at: voucher.expires_at,
    })

    console.log(`Payment success for order ${data.order_id}:`)
    console.log(`- Voucher: ${voucher.code}`)
    console.log(`- WhatsApp sent: ${whatsappSent}`)

    // Notify MikPos system (webhook)
    try {
      await fetch(`${process.env.MIKPOS_BASE_URL}/webhook/voucher-generated`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MIKPOS_API_KEY}`,
        },
        body: JSON.stringify({
          session_id: order.session_id,
          order_id: data.order_id,
          voucher_code: voucher.code,
          customer: order.customer,
          status: "completed",
        }),
      })
    } catch (error) {
      console.error("Failed to notify MikPos:", error)
      // Don't fail the whole process if webhook fails
    }

    return NextResponse.json({
      success: true,
      voucher_code: voucher.code,
      expires_at: voucher.expires_at,
      whatsapp_sent: whatsappSent,
      return_url: order.customer.hotspot_info.login_url,
      message: "Voucher generated and sent successfully",
    })
  } catch (error) {
    console.error("Payment success processing error:", error)
    return NextResponse.json({ error: "Failed to process payment success" }, { status: 500 })
  }
}
