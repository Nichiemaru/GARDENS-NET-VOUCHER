import { type NextRequest, NextResponse } from "next/server"

// Mock database - same as above
let routers: any[] = [
  // ... same mock data
]

// GET - Get specific router
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const router = routers.find((r) => r.id === params.id)
    if (!router) {
      return NextResponse.json({ error: "Router not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      router: router,
    })
  } catch (error) {
    console.error("Failed to get router:", error)
    return NextResponse.json({ error: "Failed to get router" }, { status: 500 })
  }
}

// PUT - Update router
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const routerIndex = routers.findIndex((r) => r.id === params.id)

    if (routerIndex === -1) {
      return NextResponse.json({ error: "Router not found" }, { status: 404 })
    }

    // If this is set as primary, remove primary from others
    if (data.is_primary) {
      routers = routers.map((r) => ({ ...r, is_primary: r.id === params.id }))
    }

    // Update router
    routers[routerIndex] = {
      ...routers[routerIndex],
      name: data.name,
      host: data.host,
      username: data.username,
      password: data.password,
      port: data.port || 8728,
      ssl_enabled: data.ssl_enabled || false,
      location: data.location || "",
      description: data.description || "",
      is_primary: data.is_primary || false,
    }

    return NextResponse.json({
      success: true,
      message: "Router updated successfully",
      router: routers[routerIndex],
    })
  } catch (error) {
    console.error("Failed to update router:", error)
    return NextResponse.json({ error: "Failed to update router" }, { status: 500 })
  }
}

// DELETE - Delete router
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const routerIndex = routers.findIndex((r) => r.id === params.id)

    if (routerIndex === -1) {
      return NextResponse.json({ error: "Router not found" }, { status: 404 })
    }

    // Don't allow deleting primary router
    if (routers[routerIndex].is_primary) {
      return NextResponse.json({ error: "Cannot delete primary router" }, { status: 400 })
    }

    // Remove router
    routers.splice(routerIndex, 1)

    return NextResponse.json({
      success: true,
      message: "Router deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete router:", error)
    return NextResponse.json({ error: "Failed to delete router" }, { status: 500 })
  }
}
