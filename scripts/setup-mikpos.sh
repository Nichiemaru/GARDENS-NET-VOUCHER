#!/bin/bash

echo "🚀 Setting up MikPos Integration for GARDENS-NET"
echo "================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please configure your environment variables."
else
    echo "✅ .env file already exists."
fi

# Install additional dependencies for MikPos integration
echo "📦 Installing additional dependencies..."

# For MikroTik RouterOS API (uncomment if needed)
# npm install node-routeros

# For WhatsApp Business API
# npm install axios

# For database (uncomment if using PostgreSQL)
# npm install pg @types/pg

# For Redis (uncomment if using Redis for session storage)
# npm install redis @types/redis

echo "🔧 Setting up database tables..."

# Create database tables (if using PostgreSQL)
# psql $DATABASE_URL -c "
# CREATE TABLE IF NOT EXISTS mikpos_sessions (
#     id VARCHAR(255) PRIMARY KEY,
#     customer_data JSONB NOT NULL,
#     created_at TIMESTAMP DEFAULT NOW(),
#     expires_at TIMESTAMP NOT NULL
# );

# CREATE TABLE IF NOT EXISTS mikpos_orders (
#     id VARCHAR(255) PRIMARY KEY,
#     session_id VARCHAR(255) REFERENCES mikpos_sessions(id),
#     package_id VARCHAR(50) NOT NULL,
#     customer_data JSONB NOT NULL,
#     amount INTEGER NOT NULL,
#     status VARCHAR(20) DEFAULT 'pending',
#     created_at TIMESTAMP DEFAULT NOW(),
#     paid_at TIMESTAMP
# );

# CREATE TABLE IF NOT EXISTS mikpos_vouchers (
#     code VARCHAR(255) PRIMARY KEY,
#     order_id VARCHAR(255) REFERENCES mikpos_orders(id),
#     profile VARCHAR(50) NOT NULL,
#     customer_data JSONB NOT NULL,
#     status VARCHAR(20) DEFAULT 'active',
#     created_at TIMESTAMP DEFAULT NOW(),
#     expires_at TIMESTAMP NOT NULL,
#     used_at TIMESTAMP
# );
# "

echo "🔐 Setting up MikroTik RouterOS profiles..."

# Create hotspot profiles in MikroTik (example commands)
# You need to run these on your MikroTik router
echo "
Run these commands on your MikroTik router:

/ip hotspot user profile
add name=1hour rate-limit=10M/10M session-timeout=1h
add name=1day rate-limit=20M/20M session-timeout=1d
add name=3days rate-limit=25M/25M session-timeout=3d
add name=1week rate-limit=30M/30M session-timeout=1w
"

echo "📱 Setting up WhatsApp Business API..."
echo "
1. Go to https://developers.facebook.com/
2. Create a new app and add WhatsApp Business API
3. Get your Access Token and Phone Number ID
4. Set up webhook URL: https://yourdomain.com/api/whatsapp/webhook
5. Add these to your .env file:
   - WHATSAPP_ACCESS_TOKEN
   - WHATSAPP_PHONE_NUMBER_ID
   - WHATSAPP_WEBHOOK_VERIFY_TOKEN
"

echo "🌐 Setting up MikPos webhook..."
echo "
Configure your MikPos system to send webhooks to:
https://yourdomain.com/api/mikpos/webhook

Webhook events to configure:
- customer_redirect
- voucher_request
- payment_status
"

echo "✅ Setup completed!"
echo "
Next steps:
1. Configure your .env file with actual values
2. Set up MikroTik RouterOS API access
3. Configure WhatsApp Business API
4. Test the integration with MikPos
5. Deploy to production

For testing, you can use:
curl -X POST http://localhost:3000/api/mikpos/webhook \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer your-webhook-secret' \\
  -d '{
    \"action\": \"redirect_purchase\",
    \"customer\": {
      \"name\": \"Test Customer\",
      \"mac_address\": \"00:11:22:33:44:55\",
      \"ip_address\": \"192.168.1.100\"
    }
  }'
"
