import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId

    // Get session from storage (in production, use database)
    global.mikposCustomers = global.mikposCustomers || new Map()
    const session = global.mikposCustomers.get(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Session not found or expired" }, { status: 404 })
    }

    // Check if session is expired (30 minutes)
    const createdAt = new Date(session.created_at)
    const now = new Date()
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

    if (diffMinutes > 30) {
      // Remove expired session
      global.mikposCustomers.delete(sessionId)
      return NextResponse.json({ error: "Session expired" }, { status: 410 })
    }

    return NextResponse.json({
      success: true,
      session: session,
      expires_in: Math.max(0, 30 - Math.floor(diffMinutes)),
    })
  } catch (error) {
    console.error("Session fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
