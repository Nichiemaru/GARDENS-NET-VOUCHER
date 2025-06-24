interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  webhookVerifyToken: string
}

interface WhatsAppMessage {
  to: string
  type: "text" | "template"
  text?: {
    body: string
  }
  template?: {
    name: string
    language: {
      code: string
    }
    components?: any[]
  }
}

export class WhatsAppAPI {
  private config: WhatsAppConfig
  private baseUrl = "https://graph.facebook.com/v18.0"

  constructor(config: WhatsAppConfig) {
    this.config = config
  }

  // Send text message
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      const cleanNumber = this.cleanPhoneNumber(to)

      const payload: WhatsAppMessage = {
        to: cleanNumber,
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
        const error = await response.json()
        console.error("WhatsApp API error:", error)
        return false
      }

      const result = await response.json()
      console.log("WhatsApp message sent:", result.messages[0].id)
      return true
    } catch (error) {
      console.error("WhatsApp send error:", error)
      return false
    }
  }

  // Send voucher notification
  async sendVoucherNotification(
    to: string,
    voucher: {
      code: string
      profile: string
      expires_at: string
    },
  ): Promise<boolean> {
    const message = this.formatVoucherMessage(voucher)
    return await this.sendTextMessage(to, message)
  }

  // Send template message
  async sendTemplateMessage(to: string, templateName: string, parameters: string[]): Promise<boolean> {
    try {
      const cleanNumber = this.cleanPhoneNumber(to)

      const payload: WhatsAppMessage = {
        to: cleanNumber,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "id",
          },
          components: [
            {
              type: "body",
              parameters: parameters.map((param) => ({
                type: "text",
                text: param,
              })),
            },
          ],
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
        const error = await response.json()
        console.error("WhatsApp template error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("WhatsApp template send error:", error)
      return false
    }
  }

  // Verify webhook
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === "subscribe" && token === this.config.webhookVerifyToken) {
      return challenge
    }
    return null
  }

  // Clean phone number format
  private cleanPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
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

  // Format voucher message
  private formatVoucherMessage(voucher: {
    code: string
    profile: string
    expires_at: string
  }): string {
    const expiryDate = new Date(voucher.expires_at).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    return `🎫 *Voucher WiFi GARDENS-NET*

✅ Kode Voucher: *${voucher.code}*
📦 Paket: ${voucher.profile}
⏰ Berlaku hingga: ${expiryDate}

📋 *Cara Penggunaan:*
1. Hubungkan ke WiFi "GARDENS-NET"
2. Buka browser, masukkan kode voucher
3. Klik "Connect" untuk mulai browsing

💡 *Tips:*
- Simpan kode voucher ini dengan baik
- Voucher akan aktif setelah digunakan pertama kali
- Hubungi CS jika ada kendala

Terima kasih telah menggunakan layanan GARDENS-NET! 🙏

_Powered by MikPos Integration_`
  }
}

// Export singleton instance
export const whatsappAPI = new WhatsAppAPI({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "gardens-net-verify",
})
