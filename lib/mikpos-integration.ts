import { mikrotikAPI } from "./mikrotik-api"
import { whatsappAPI } from "./whatsapp-api"

interface MikPosConfig {
  baseUrl: string
  apiKey: string
  webhookSecret: string
}

interface VoucherProfile {
  name: string
  duration: string
  price: number
  bandwidth: string
  concurrent_users: number
  uptime_limit: string
}

const VOUCHER_PROFILES: Record<string, VoucherProfile> = {
  "1hour": {
    name: "1 Jam",
    duration: "1 Jam",
    price: 5000,
    bandwidth: "10 Mbps",
    concurrent_users: 1,
    uptime_limit: "1h",
  },
  "1day": {
    name: "1 Hari",
    duration: "24 Jam",
    price: 15000,
    bandwidth: "20 Mbps",
    concurrent_users: 2,
    uptime_limit: "1d",
  },
  "3days": {
    name: "3 Hari",
    duration: "72 Jam",
    price: 35000,
    bandwidth: "25 Mbps",
    concurrent_users: 3,
    uptime_limit: "3d",
  },
  "1week": {
    name: "1 Minggu",
    duration: "7 Hari",
    price: 75000,
    bandwidth: "30 Mbps",
    concurrent_users: 5,
    uptime_limit: "1w",
  },
}

export class MikPosIntegration {
  private config: MikPosConfig

  constructor(config: MikPosConfig) {
    this.config = config
  }

  // Generate redirect URL for MikPos customers
  async generateRedirectUrl(customerData: {
    name?: string
    mac_address: string
    ip_address: string
    requested_profile?: string
  }): Promise<string> {
    const sessionId = `mikpos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store customer session
    await this.storeCustomerSession(sessionId, {
      ...customerData,
      name: customerData.name || "Customer MikPos",
      created_at: new Date().toISOString(),
    })

    return `${process.env.NEXT_PUBLIC_BASE_URL}/mikpos/redirect?session=${sessionId}`
  }

  // Create voucher in MikroTik system
  async createVoucher(
    profile: string,
    customerData: any,
  ): Promise<{
    code: string
    expires_at: string
  }> {
    try {
      const voucherCode = this.generateVoucherCode(profile)
      const expiresAt = this.calculateExpiryDate(profile)
      const profileData = VOUCHER_PROFILES[profile]

      if (!profileData) {
        throw new Error(`Invalid profile: ${profile}`)
      }

      // Create user in MikroTik
      await mikrotikAPI.createHotspotUser({
        name: voucherCode,
        password: voucherCode,
        profile: profile,
        "limit-uptime": profileData.uptime_limit,
        comment: `Customer: ${customerData.name} | WhatsApp: ${customerData.whatsapp}`,
      })

      console.log(`Voucher created in MikroTik: ${voucherCode}`)

      return {
        code: voucherCode,
        expires_at: expiresAt,
      }
    } catch (error) {
      console.error("Failed to create voucher:", error)
      throw new Error("Voucher creation failed")
    }
  }

  // Send voucher to customer via WhatsApp
  async sendVoucherNotification(
    whatsapp: string,
    voucher: {
      code: string
      profile: string
      expires_at: string
    },
  ): Promise<boolean> {
    try {
      return await whatsappAPI.sendVoucherNotification(whatsapp, voucher)
    } catch (error) {
      console.error("Failed to send WhatsApp:", error)
      return false
    }
  }

  // Get voucher status from MikroTik
  async getVoucherStatus(voucherCode: string): Promise<any> {
    try {
      return await mikrotikAPI.getHotspotUser(voucherCode)
    } catch (error) {
      console.error("Failed to get voucher status:", error)
      return null
    }
  }

  // Remove expired vouchers
  async cleanupExpiredVouchers(): Promise<void> {
    try {
      // Get all vouchers from storage
      global.mikposVouchers = global.mikposVouchers || new Map()

      const now = new Date()
      const expiredVouchers: string[] = []

      for (const [code, voucher] of global.mikposVouchers.entries()) {
        const expiresAt = new Date(voucher.expires_at)
        if (now > expiresAt && voucher.status === "active") {
          expiredVouchers.push(code)
        }
      }

      // Remove expired vouchers from MikroTik
      for (const code of expiredVouchers) {
        await mikrotikAPI.removeHotspotUser(code)

        // Update status in storage
        const voucher = global.mikposVouchers.get(code)
        if (voucher) {
          voucher.status = "expired"
          global.mikposVouchers.set(code, voucher)
        }
      }

      console.log(`Cleaned up ${expiredVouchers.length} expired vouchers`)
    } catch (error) {
      console.error("Failed to cleanup expired vouchers:", error)
    }
  }

  // Verify webhook signature from MikPos
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // In production, implement proper signature verification
    // const crypto = require('crypto')
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.config.webhookSecret)
    //   .update(payload)
    //   .digest('hex')
    // return signature === `sha256=${expectedSignature}`

    return true // For demo purposes
  }

  // Get profile information
  getProfileInfo(profileId: string): VoucherProfile | null {
    return VOUCHER_PROFILES[profileId] || null
  }

  // Get all available profiles
  getAllProfiles(): Record<string, VoucherProfile> {
    return VOUCHER_PROFILES
  }

  private async storeCustomerSession(sessionId: string, customerData: any): Promise<void> {
    // In production, store in database
    // For demo, use in-memory storage
    global.mikposCustomers = global.mikposCustomers || new Map()
    global.mikposCustomers.set(sessionId, {
      ...customerData,
      session_id: sessionId,
    })
  }

  private generateVoucherCode(profile: string): string {
    const prefix = profile.toUpperCase().substring(0, 4)
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  private calculateExpiryDate(profile: string): string {
    const now = new Date()
    const profileData = VOUCHER_PROFILES[profile]

    if (!profileData) {
      // Default to 1 day
      now.setDate(now.getDate() + 1)
      return now.toISOString()
    }

    switch (profile) {
      case "1hour":
        now.setHours(now.getHours() + 1)
        break
      case "1day":
        now.setDate(now.getDate() + 1)
        break
      case "3days":
        now.setDate(now.getDate() + 3)
        break
      case "1week":
        now.setDate(now.getDate() + 7)
        break
      default:
        now.setDate(now.getDate() + 1)
    }

    return now.toISOString()
  }
}

// Export singleton instance
export const mikposIntegration = new MikPosIntegration({
  baseUrl: process.env.MIKPOS_BASE_URL || "http://localhost:8080",
  apiKey: process.env.MIKPOS_API_KEY || "your-api-key",
  webhookSecret: process.env.MIKPOS_WEBHOOK_SECRET || "your-webhook-secret",
})
