import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const voucherCode = searchParams.get("code")
    const orderId = searchParams.get("order_id")

    if (!voucherCode && !orderId) {
      return NextResponse.json({ error: "Voucher code or order ID required" }, { status: 400 })
    }

    // Get voucher data from storage
    global.mikposVouchers = global.mikposVouchers || new Map()
    global.mikposOrders = global.mikposOrders || new Map()

    let voucherData = null

    if (voucherCode) {
      voucherData = global.mikposVouchers.get(voucherCode)
    } else if (orderId) {
      // Find voucher by order ID
      for (const [code, voucher] of global.mikposVouchers.entries()) {
        if (voucher.order_id === orderId) {
          voucherData = voucher
          break
        }
      }
    }

    if (!voucherData) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 })
    }

    // Check if voucher is expired
    const now = new Date()
    const expiresAt = new Date(voucherData.expires_at)

    if (now > expiresAt && voucherData.status === "active") {
      voucherData.status = "expired"
      global.mikposVouchers.set(voucherData.code, voucherData)
    }

    return NextResponse.json({
      success: true,
      voucher: voucherData,
    })
  } catch (error) {
    console.error("Error fetching voucher status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
