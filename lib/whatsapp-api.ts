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

  constructor(config: WhatsAppConfig) {
    this.config = config
  }

  // Send voucher notification with detailed instructions
  async sendVoucherNotification(whatsapp: string, voucher: VoucherMessage): Promise<boolean> {
    try {
      const message = this.formatVoucherMessage(voucher)
      return await this.sendTextMessage(whatsapp, message)
    } catch (error) {
      console.error("Failed to send voucher notification:", error)
      return false
    }
  }

  // Send text message via WhatsApp Business API
  async sendTextMessage(whatsapp: string, message: string): Promise<boolean> {
    try {
      console.log(`Sending WhatsApp to ${whatsapp}:`, message)

      // In production, use actual WhatsApp Business API
      // const response = await fetch(`https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.accessToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     messaging_product: 'whatsapp',
      //     to: whatsapp,
      //     type: 'text',
      //     text: { body: message }
      //   })
      // })

      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("✅ WhatsApp message sent successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to send WhatsApp message:", error)
      return false
    }
  }

  // Format voucher message with complete instructions
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

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require("crypto")
      const expectedSignature = crypto
        .createHmac("sha256", this.config.webhookVerifyToken)
        .update(payload)
        .digest("hex")

      return signature === `sha256=${expectedSignature}`
    } catch (error) {
      console.error("WhatsApp webhook signature verification failed:", error)
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
