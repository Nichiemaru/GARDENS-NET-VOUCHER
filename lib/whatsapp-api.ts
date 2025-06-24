interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
}

interface VoucherMessage {
  code: string
  profile_name: string
  bandwidth: string
  duration: string
  expires_at: string
  customer_name: string
  hotspot_login_url: string
}

export class WhatsAppAPI {
  private config: WhatsAppConfig
  private baseUrl = "https://graph.facebook.com/v18.0"

  constructor(config: WhatsAppConfig) {
    this.config = config
  }

  // Test WhatsApp Business API connection
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config.accessToken || !this.config.phoneNumberId) {
        console.error("❌ Missing WhatsApp API credentials")
        return false
      }

      console.log("🔍 Testing WhatsApp Business API connection...")

      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ WhatsApp API connection failed:", errorData)
        return false
      }

      const data = await response.json()
      console.log("✅ WhatsApp API connection successful:", data.display_phone_number)
      return true
    } catch (error) {
      console.error("❌ WhatsApp API connection error:", error)
      return false
    }
  }

  // Send text message via WhatsApp Business API
  async sendTextMessage(whatsapp: string, message: string): Promise<boolean> {
    try {
      if (!this.config.accessToken || !this.config.phoneNumberId) {
        console.error("❌ Missing WhatsApp API credentials")
        return false
      }

      const phoneNumber = this.formatPhoneNumber(whatsapp)
      console.log(`📱 Sending WhatsApp message to ${phoneNumber}`)

      const payload = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: message,
        },
      }

      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ WhatsApp message send failed:", errorData)
        return false
      }

      const result = await response.json()
      console.log("✅ WhatsApp message sent successfully:", result.messages?.[0]?.id)
      return true
    } catch (error) {
      console.error("❌ WhatsApp send error:", error)
      return false
    }
  }

  // Send voucher notification with complete instructions
  async sendVoucherNotification(whatsapp: string, voucher: VoucherMessage): Promise<boolean> {
    try {
      const message = this.formatVoucherMessage(voucher)
      return await this.sendTextMessage(whatsapp, message)
    } catch (error) {
      console.error("❌ Failed to send voucher notification:", error)
      return false
    }
  }

  // Format phone number for WhatsApp API (international format)
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "")

    // Convert Indonesian format to international
    if (cleaned.startsWith("08")) {
      cleaned = "628" + cleaned.substring(2)
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned
    } else if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned
    }

    return cleaned
  }

  // Format comprehensive voucher message
  private formatVoucherMessage(voucher: VoucherMessage): string {
    const expiryDate = new Date(voucher.expires_at).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    return `🎉 *VOUCHER WIFI GARDENS-NET* 🎉

Halo ${voucher.customer_name}! 👋
Voucher WiFi Anda telah berhasil dibuat:

🎫 *KODE VOUCHER:* 
\`${voucher.code}\`

📦 *DETAIL PAKET:*
• Nama: ${voucher.profile_name}
• Bandwidth: ${voucher.bandwidth}
• Durasi: ${voucher.duration}
• Berlaku hingga: ${expiryDate}

📋 *CARA MENGGUNAKAN:*

1️⃣ *Buka halaman login hotspot*
   ${voucher.hotspot_login_url}

2️⃣ *Masukkan kode voucher*
   Ketik: \`${voucher.code}\`

3️⃣ *Klik "Connect" atau "Login"*
   Voucher akan langsung aktif

4️⃣ *Mulai browsing!* 🌐
   Selamat menikmati internet cepat

⚠️ *PENTING:*
• Kode voucher hanya bisa digunakan SEKALI
• Simpan pesan ini untuk referensi
• Jangan bagikan kode ke orang lain
• Hubungi admin jika ada kendala

💡 *TIPS:*
• Gunakan WiFi "GARDENS-NET" 
• Pastikan sinyal kuat untuk koneksi optimal
• Logout dengan benar setelah selesai

Terima kasih telah menggunakan GARDENS-NET WiFi! 🙏

_Powered by MikPos Integration_
_Support: wa.me/628123456789_`
  }

  // Verify webhook signature for security
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require("crypto")
      const expectedSignature = crypto
        .createHmac("sha256", this.config.webhookVerifyToken)
        .update(payload)
        .digest("hex")

      return signature === `sha256=${expectedSignature}`
    } catch (error) {
      console.error("❌ WhatsApp webhook signature verification failed:", error)
      return false
    }
  }
}

// Export singleton instance
export const whatsappAPI = new WhatsAppAPI({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
})
