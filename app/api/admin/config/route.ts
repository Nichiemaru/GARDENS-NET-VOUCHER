import { type NextRequest, NextResponse } from "next/server"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"

const CONFIG_FILE = join(process.cwd(), ".env.local")

// Get current configuration
export async function GET() {
  try {
    const config = {
      whatsapp: {
        access_token: process.env.WHATSAPP_ACCESS_TOKEN || "",
        phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
        webhook_verify_token: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
        business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
        app_id: process.env.WHATSAPP_APP_ID || "",
      },
      mikrotik: {
        host: process.env.MIKROTIK_HOST || "192.168.1.1",
        username: process.env.MIKROTIK_USERNAME || "admin",
        password: process.env.MIKROTIK_PASSWORD || "",
        port: process.env.MIKROTIK_PORT || "8728",
        ssl_enabled: process.env.MIKROTIK_SSL_ENABLED === "true",
      },
      mikpos: {
        base_url: process.env.MIKPOS_BASE_URL || "http://localhost:8080",
        api_key: process.env.MIKPOS_API_KEY || "",
        webhook_secret: process.env.MIKPOS_WEBHOOK_SECRET || "",
        webhook_url: process.env.MIKPOS_WEBHOOK_URL || "",
      },
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Failed to get configuration:", error)
    return NextResponse.json({ error: "Failed to get configuration" }, { status: 500 })
  }
}

// Save configuration
export async function POST(request: NextRequest) {
  try {
    const { type, config } = await request.json()

    // Read current .env.local file
    let envContent = ""
    if (existsSync(CONFIG_FILE)) {
      envContent = readFileSync(CONFIG_FILE, "utf8")
    }

    // Update environment variables based on type
    if (type === "whatsapp") {
      envContent = updateEnvVar(envContent, "WHATSAPP_ACCESS_TOKEN", config.access_token)
      envContent = updateEnvVar(envContent, "WHATSAPP_PHONE_NUMBER_ID", config.phone_number_id)
      envContent = updateEnvVar(envContent, "WHATSAPP_WEBHOOK_VERIFY_TOKEN", config.webhook_verify_token)
      envContent = updateEnvVar(envContent, "WHATSAPP_BUSINESS_ACCOUNT_ID", config.business_account_id)
      envContent = updateEnvVar(envContent, "WHATSAPP_APP_ID", config.app_id)
    } else if (type === "mikrotik") {
      envContent = updateEnvVar(envContent, "MIKROTIK_HOST", config.host)
      envContent = updateEnvVar(envContent, "MIKROTIK_USERNAME", config.username)
      envContent = updateEnvVar(envContent, "MIKROTIK_PASSWORD", config.password)
      envContent = updateEnvVar(envContent, "MIKROTIK_PORT", config.port)
      envContent = updateEnvVar(envContent, "MIKROTIK_SSL_ENABLED", config.ssl_enabled.toString())
    } else if (type === "mikpos") {
      envContent = updateEnvVar(envContent, "MIKPOS_BASE_URL", config.base_url)
      envContent = updateEnvVar(envContent, "MIKPOS_API_KEY", config.api_key)
      envContent = updateEnvVar(envContent, "MIKPOS_WEBHOOK_SECRET", config.webhook_secret)
      envContent = updateEnvVar(envContent, "MIKPOS_WEBHOOK_URL", config.webhook_url)
    }

    // Write updated .env.local file
    writeFileSync(CONFIG_FILE, envContent)

    return NextResponse.json({ success: true, message: "Configuration saved successfully" })
  } catch (error) {
    console.error("Failed to save configuration:", error)
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 })
  }
}

// Helper function to update environment variable in content
function updateEnvVar(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, "m")
  const newLine = `${key}=${value}`

  if (regex.test(content)) {
    return content.replace(regex, newLine)
  } else {
    return content + (content.endsWith("\n") ? "" : "\n") + newLine + "\n"
  }
}
