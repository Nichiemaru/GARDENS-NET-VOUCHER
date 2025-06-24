import { type NextRequest, NextResponse } from "next/server"
import { mikposIntegration } from "@/lib/mikpos-integration"

interface PaymentWebhookData {
  order_id: string
  status: "success" | "failed" | "pending"
  payment_method: string
  amount: number
  transaction_id: string
  paid_at?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: PaymentWebhookData = await request.json()

    // Verify webhook signature (implement based on your payment gateway)
    const signature = request.headers.get("x-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    // Get order data
    global.mikposOrders = global.mikposOrders || new Map()
    const orderData = global.mikposOrders.get(data.order_id)

    if (!orderData) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update order status
    orderData.status = data.status
    orderData.payment_method = data.payment_method
    orderData.transaction_id = data.transaction_id
    orderData.paid_at = data.paid_at || new Date().toISOString()

    global.mikposOrders.set(data.order_id, orderData)

    // If payment successful, generate voucher
    if (data.status === "success") {
      try {
        const voucher = await mikposIntegration.createVoucher(orderData.package_id, orderData.customer)

        // Send voucher via WhatsApp
        await mikposIntegration.sendVoucherNotification(orderData.customer.whatsapp, {
          code: voucher.code,
          profile: orderData.package_id,
          expires_at: voucher.expires_at,
        })

        // Store voucher data
        global.mikposVouchers = global.mikposVouchers || new Map()
        global.mikposVouchers.set(voucher.code, {
          ...voucher,
          order_id: data.order_id,
          customer: orderData.customer,
          status: "active",
        })

        // Notify MikPos system
        await notifyMikPosSystem(orderData.session_id, voucher)

        console.log(`Voucher ${voucher.code} generated for order ${data.order_id}`)
      } catch (error) {
        console.error("Error generating voucher:", error)
        // Don't fail the webhook, but log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment webhook processed",
    })
  } catch (error) {
    console.error("Payment webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function notifyMikPosSystem(sessionId: string, voucher: any) {
  try {
    // In production, send webhook to MikPos system
    const mikposWebhookUrl = process.env.MIKPOS_WEBHOOK_URL

    if (mikposWebhookUrl) {
      await fetch(mikposWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MIKPOS_WEBHOOK_SECRET}`,
        },
        body: JSON.stringify({
          action: "voucher_generated",
          session_id: sessionId,
          voucher: voucher,
          timestamp: new Date().toISOString(),
        }),
      })
    }
  } catch (error) {
    console.error("Failed to notify MikPos:", error)
  }
}
