import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId

    // Check session validity
    global.mikposCustomers = global.mikposCustomers || new Map()
    const session = global.mikposCustomers.get(sessionId)

    if (!session) {
      return NextResponse.json({ valid: false, reason: "Session not found" }, { status: 404 })
    }

    // Check expiry
    const createdAt = new Date(session.created_at)
    const now = new Date()
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

    if (diffMinutes > 30) {
      global.mikposCustomers.delete(sessionId)
      return NextResponse.json({ valid: false, reason: "Session expired" }, { status: 410 })
    }

    return NextResponse.json({
      valid: true,
      expires_in: Math.max(0, 30 - Math.floor(diffMinutes)),
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ valid: false, reason: "Internal error" }, { status: 500 })
  }
}
