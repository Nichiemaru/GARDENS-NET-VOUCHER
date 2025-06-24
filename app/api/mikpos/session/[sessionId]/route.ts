import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // Get customer data from session storage
    global.mikposCustomers = global.mikposCustomers || new Map()
    const customerData = global.mikposCustomers.get(sessionId)

    if (!customerData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Check if session is expired (24 hours)
    const sessionAge = Date.now() - new Date(customerData.created_at).getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    if (sessionAge > maxAge) {
      global.mikposCustomers.delete(sessionId)
      return NextResponse.json({ error: "Session expired" }, { status: 410 })
    }

    return NextResponse.json({
      success: true,
      customer: customerData,
    })
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
