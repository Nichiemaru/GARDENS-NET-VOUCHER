"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Wifi, Shield, Database } from "lucide-react"

const MIKPOS_ADMIN_CREDENTIALS = [
  { username: "admin", password: "mikpos123", role: "administrator", name: "Administrator" },
  { username: "operator", password: "operator123", role: "operator", name: "Operator" },
  { username: "viewer", password: "viewer123", role: "viewer", name: "Viewer" },
]

export default function MikPosLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const admin = MIKPOS_ADMIN_CREDENTIALS.find((cred) => cred.username === username && cred.password === password)

    if (admin) {
      // Store MikPos admin session
      sessionStorage.setItem(
        "mikposSession",
        JSON.stringify({
          username: admin.username,
          role: admin.role,
          name: admin.name,
          loginTime: new Date().toISOString(),
        }),
      )

      // Redirect ke dashboard utama MikPos
      router.push("/mikpos/dashboard")
    } else {
      setError("Username atau password salah")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* MikPos Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Wifi className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MikPos</h1>
          <p className="text-blue-200">Hotspot Management System</p>
          <div className="flex justify-center items-center mt-2 text-blue-300 text-sm">
            <Shield className="h-4 w-4 mr-1" />
            <span>Powered by GARDENS-NET</span>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl text-gray-800">Administrator Login</CardTitle>
            <CardDescription>Masuk ke sistem manajemen hotspot</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    <span>Masuk ke Sistem</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-2">
                <p className="font-semibold text-gray-700">Demo Login:</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p>
                      <strong>Administrator:</strong> admin / mikpos123
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p>
                      <strong>Operator:</strong> operator / operator123
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <p>
                      <strong>Viewer:</strong> viewer / viewer123
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="mt-4 text-center">
              <div className="flex justify-center items-center text-xs text-gray-500">
                <Database className="h-3 w-3 mr-1" />
                <span>MikPos v2.1.0 | GARDENS-NET Integration</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-blue-200 text-sm">
          <p>© 2024 GARDENS-NET. All rights reserved.</p>
          <p className="mt-1">Hotspot Management & E-commerce Solution</p>
        </div>
      </div>
    </div>
  )
}
