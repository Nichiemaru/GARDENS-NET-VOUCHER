import { mikrotikAPI } from "./mikrotik-api"
import { whatsappAPI } from "./whatsapp-api"

interface MikPosConfig {
  baseUrl: string
  apiKey: string
  webhookSecret: string
}

interface CustomerSession {
  name: string
  mac_address: string
  ip_address: string
  session_id: string
  hotspot_info?: {
    interface: string
    server_name: string
    login_url: string
  }
  user_agent?: string
  requested_profile?: string
  created_at: string
}

interface VoucherProfile {
  name: string
  duration: string
  price: number
  bandwidth: string
  concurrent_users: number
  uptime_limit: string
  mikrotik_profile: string
}

const VOUCHER_PROFILES: Record<string, VoucherProfile> = {
  "1hour": {
    name: "Express 1 Jam",
    duration: "1 Jam",
    price: 5000,
    bandwidth: "10 Mbps",
    concurrent_users: 1,
    uptime_limit: "1h",
    mikrotik_profile: "1hour-10M",
  },
  "1day": {
    name: "Daily 1 Hari",
    duration: "24 Jam",
    price: 15000,
    bandwidth: "20 Mbps",
    concurrent_users: 2,
    uptime_limit: "1d",
    mikrotik_profile: "1day-20M",
  },
  "3days": {
    name: "Weekend 3 Hari",
    duration: "72 Jam",
    price: 35000,
    bandwidth: "25 Mbps",
    concurrent_users: 3,
    uptime_limit: "3d",
    mikrotik_profile: "3days-25M",
  },
  "1week": {
    name: "Weekly 1 Minggu",
    duration: "7 Hari",
    price: 75000,
    bandwidth: "30 Mbps",
    concurrent_users: 5,
    uptime_limit: "1w",
    mikrotik_profile: "1week-30M",
  },
}

export class MikPosIntegration {
  private config: MikPosConfig

  constructor(config: MikPosConfig) {
    this.config = config
  }

  // Generate redirect URL for customers from MikroTik hotspot login page
  async generateRedirectUrl(customerData: {
    name?: string
    mac_address: string
    ip_address: string
    requested_profile?: string
    hotspot_info?: any
    user_agent?: string
  }): Promise<string> {
    const sessionId = `mikpos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create customer session
    const session: CustomerSession = {
      name: customerData.name || `Customer-${customerData.ip_address}`,
      mac_address: customerData.mac_address,
      ip_address: customerData.ip_address,
      session_id: sessionId,
      hotspot_info: customerData.hotspot_info || {
        interface: "ether1",
        server_name: "GARDENS-NET Hotspot",
        login_url: `http://${customerData.ip_address.split(".").slice(0, 3).join(".")}.1/login`,
      },
      user_agent: customerData.user_agent,
      requested_profile: customerData.requested_profile,
      created_at: new Date().toISOString(),
    }

    // Store session (in production, use database)
    await this.storeCustomerSession(sessionId, session)

    console.log(`Generated session for customer ${customerData.ip_address}: ${sessionId}`)

    return `${process.env.NEXT_PUBLIC_BASE_URL}/mikpos/redirect?session=${sessionId}`
  }

  // Create voucher in MikroTik system
  async createVoucher(
    profileId: string,
    customerData: any,
  ): Promise<{
    code: string
    expires_at: string
  }> {
    try {
      const profile = VOUCHER_PROFILES[profileId]
      if (!profile) {
        throw new Error(`Invalid profile: ${profileId}`)
      }

      const voucherCode = this.generateVoucherCode(profileId)
      const expiresAt = this.calculateExpiryDate(profileId)

      // Create user in MikroTik RouterOS
      await mikrotikAPI.createHotspotUser({
        name: voucherCode,
        password: voucherCode,
        profile: profile.mikrotik_profile,
        "limit-uptime": profile.uptime_limit,
        comment: `Customer: ${customerData.name} | WhatsApp: ${customerData.whatsapp} | IP: ${customerData.ip_address}`,
      })

      console.log(`Voucher created in MikroTik: ${voucherCode} (Profile: ${profile.mikrotik_profile})`)

      return {
        code: voucherCode,
        expires_at: expiresAt,
      }
    } catch (error) {
      console.error("Failed to create voucher:", error)
      throw new Error("Voucher creation failed")
    }
  }

  // Send voucher notification via WhatsApp
  async sendVoucherNotification(
    whatsapp: string,
    voucher: {
      code: string
      profile: string
      expires_at: string
    },
  ): Promise<boolean> {
    try {
      const profile = VOUCHER_PROFILES[voucher.profile]
      const message = this.formatVoucherMessage({
        ...voucher,
        profile_name: profile?.name || voucher.profile,
        bandwidth: profile?.bandwidth || "N/A",
        duration: profile?.duration || "N/A",
      })

      return await whatsappAPI.sendTextMessage(whatsapp, message)
    } catch (error) {
      console.error("Failed to send WhatsApp notification:", error)
      return false
    }
  }

  // Get customer session
  async getCustomerSession(sessionId: string): Promise<CustomerSession | null> {
    try {
      // In production, fetch from database
      global.mikposCustomers = global.mikposCustomers || new Map()
      return global.mikposCustomers.get(sessionId) || null
    } catch (error) {
      console.error("Failed to get customer session:", error)
      return null
    }
  }

  // Store customer session
  private async storeCustomerSession(sessionId: string, session: CustomerSession): Promise<void> {
    try {
      // In production, store in database
      global.mikposCustomers = global.mikposCustomers || new Map()
      global.mikposCustomers.set(sessionId, session)

      // Set expiry (30 minutes)
      setTimeout(
        () => {
          global.mikposCustomers?.delete(sessionId)
          console.log(`Session expired and removed: ${sessionId}`)
        },
        30 * 60 * 1000,
      )
    } catch (error) {
      console.error("Failed to store customer session:", error)
      throw error
    }
  }

  // Generate unique voucher code
  private generateVoucherCode(profileId: string): string {
    const prefix = profileId.toUpperCase().substring(0, 2)
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  // Calculate voucher expiry date
  private calculateExpiryDate(profileId: string): string {
    const profile = VOUCHER_PROFILES[profileId]
    if (!profile) {
      throw new Error(`Invalid profile: ${profileId}`)
    }

    const now = new Date()
    let expiryDate: Date

    switch (profileId) {
      case "1hour":
        expiryDate = new Date(now.getTime() + 1 * 60 * 60 * 1000) // 1 hour
        break
      case "1day":
        expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day
        break
      case "3days":
        expiryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
        break
      case "1week":
        expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 1 week
        break
      default:
        expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Default 1 day
    }

    return expiryDate.toISOString()
  }

  // Format WhatsApp message
  private formatVoucherMessage(data: {
    code: string
    profile_name: string
    bandwidth: string
    duration: string
    expires_at: string
  }): string {
    const expiryDate = new Date(data.expires_at).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    return `🎉 *VOUCHER WIFI GARDENS-NET* 🎉

✅ *Kode Voucher:* \`${data.code}\`
📦 *Paket:* ${data.profile_name}
⚡ *Bandwidth:* ${data.bandwidth}
⏰ *Durasi:* ${data.duration}
📅 *Berlaku hingga:* ${expiryDate}

*CARA PENGGUNAAN:*
1️⃣ Buka browser dan akses halaman login WiFi
2️⃣ Masukkan kode voucher: \`${data.code}\`
3️⃣ Klik "Connect" atau "Login"
4️⃣ Selamat browsing! 🌐

⚠️ *PENTING:*
• Simpan kode voucher ini dengan baik
• Voucher hanya bisa digunakan sekali
• Hubungi admin jika ada kendala

Terima kasih telah menggunakan GARDENS-NET WiFi! 🙏

_Powered by MikPos Integration_`
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require("crypto")
      const expectedSignature = crypto.createHmac("sha256", this.config.webhookSecret).update(payload).digest("hex")

      return signature === `sha256=${expectedSignature}`
    } catch (error) {
      console.error("Webhook signature verification failed:", error)
      return false
    }
  }

  // Get profile information
  getProfileInfo(profileId: string): VoucherProfile | null {
    return VOUCHER_PROFILES[profileId] || null
  }

  // Get all available profiles
  getAllProfiles(): Record<string, VoucherProfile> {
    return VOUCHER_PROFILES
  }
}

// Export singleton instance
export const mikposIntegration = new MikPosIntegration({
  baseUrl: process.env.MIKPOS_BASE_URL || "http://localhost:8080",
  apiKey: process.env.MIKPOS_API_KEY || "",
  webhookSecret: process.env.MIKPOS_WEBHOOK_SECRET || "default-secret",
})
