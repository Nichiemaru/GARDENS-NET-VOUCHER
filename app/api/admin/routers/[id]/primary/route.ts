import { type NextRequest, NextResponse } from "next/server"

// Mock database reference
let routers: any[] = []

// POST - Set router as primary
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const routerIndex = routers.findIndex((r) => r.id === params.id)

    if (routerIndex === -1) {
      return NextResponse.json({ error: "Router not found" }, { status: 404 })
    }

    // Check if router is connected
    if (routers[routerIndex].status !== "connected") {
      return NextResponse.json({ error: "Cannot set disconnected router as primary" }, { status: 400 })
    }

    // Remove primary status from all routers
    routers = routers.map((r) => ({ ...r, is_primary: false }))

    // Set this router as primary
    routers[routerIndex].is_primary = true

    console.log(`Router ${routers[routerIndex].name} set as primary`)

    return NextResponse.json({
      success: true,
      message: "Primary router updated successfully",
      router: routers[routerIndex],
    })
  } catch (error) {
    console.error("Failed to set primary router:", error)
    return NextResponse.json({ error: "Failed to set primary router" }, { status: 500 })
  }
}
