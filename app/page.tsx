"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function RootPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Cek apakah ini request dari MikPos hotspot login
    const mac = searchParams.get("mac")
    const ip = searchParams.get("ip")
    const session = searchParams.get("session")

    if (mac || ip || session) {
      // Ini customer dari hotspot login - redirect ke customer landing
      const params = new URLSearchParams()
      if (mac) params.set("mac", mac)
      if (ip) params.set("ip", ip)
      if (session) params.set("session", session)

      router.replace(`/customer?${params.toString()}`)
    } else {
      // Ini admin yang akses langsung - redirect ke MikPos login
      router.replace("/mikpos/login")
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  )
}
