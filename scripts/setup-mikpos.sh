#!/bin/bash

echo "🚀 Setting up MikPos Integration for GARDENS-NET..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from example..."
    cp .env.local.example .env.local
    print_status ".env.local created. Please configure your environment variables."
fi

# Install required dependencies
print_header "📦 Installing dependencies..."
npm install

# Check MikroTik connection
print_header "🔌 Testing MikroTik connection..."
node -e "
const { mikrotikAPI } = require('./lib/mikrotik-api.ts');
mikrotikAPI.testConnection().then(success => {
    if (success) {
        console.log('✅ MikroTik connection successful');
    } else {
        console.log('❌ MikroTik connection failed');
        console.log('Please check your MIKROTIK_* environment variables');
    }
}).catch(err => {
    console.log('❌ MikroTik test error:', err.message);
});
"

# Check WhatsApp API connection
print_header "📱 Testing WhatsApp API connection..."
node -e "
const { whatsappAPI } = require('./lib/whatsapp-api.ts');
whatsappAPI.testConnection().then(success => {
    if (success) {
        console.log('✅ WhatsApp API connection successful');
    } else {
        console.log('❌ WhatsApp API connection failed');
        console.log('Please check your WHATSAPP_* environment variables');
    }
}).catch(err => {
    console.log('❌ WhatsApp test error:', err.message);
});
"

# Setup MikroTik profiles
print_header "⚙️ Setting up MikroTik hotspot profiles..."
node -e "
const { mikrotikAPI } = require('./lib/mikrotik-api.ts');
mikrotikAPI.setupDefaultProfiles().then(() => {
    console.log('✅ MikroTik profiles setup completed');
}).catch(err => {
    console.log('❌ MikroTik profiles setup failed:', err.message);
});
"

# Create webhook test
print_header "🔗 Testing webhook endpoint..."
curl -X GET "http://localhost:3000/api/mikpos/webhook" \
  -H "Content-Type: application/json" \
  --silent --output /dev/null --write-out "Webhook status: %{http_code}\n"

# Generate sample webhook payload for testing
print_header "📝 Generating sample webhook payload..."
cat > webhook-test.json << EOF
{
  "action": "voucher_purchase_request",
  "customer": {
    "name": "Test Customer",
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  "hotspot": {
    "interface": "ether1",
    "server_name": "GARDENS-NET Hotspot",
    "login_url": "http://192.168.1.1/login"
  },
  "requested_profile": "1day",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
}
EOF

print_status "Sample webhook payload created: webhook-test.json"

# Test webhook with sample data
print_header "🧪 Testing webhook with sample data..."
if command -v curl &> /dev/null; then
    curl -X POST "http://localhost:3000/api/mikpos/webhook" \
      -H "Content-Type: application/json" \
      -H "x-mikpos-signature: sha256=test-signature" \
      -d @webhook-test.json \
      --silent | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
else
    print_warning "curl not found. Please test webhook manually."
fi

# Create MikPos configuration template
print_header "📋 Creating MikPos configuration template..."
cat > mikpos-config.json << EOF
{
  "webhook": {
    "url": "${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}/api/mikpos/webhook",
    "secret": "${MIKPOS_WEBHOOK_SECRET:-default-secret}",
    "events": [
      "voucher_purchase_request",
      "customer_redirect",
      "payment_notification"
    ]
  },
  "voucher_packages": [
    {
      "id": "1hour",
      "name": "Express 1 Jam",
      "price": 5000,
      "mikrotik_profile": "1hour-10M"
    },
    {
      "id": "1day",
      "name": "Daily 1 Hari",
      "price": 15000,
      "mikrotik_profile": "1day-20M"
    },
    {
      "id": "3days",
      "name": "Weekend 3 Hari",
      "price": 35000,
      "mikrotik_profile": "3days-25M"
    },
    {
      "id": "1week",
      "name": "Weekly 1 Minggu",
      "price": 75000,
      "mikrotik_profile": "1week-30M"
    }
  ]
}
EOF

print_status "MikPos configuration template created: mikpos-config.json"

# Create systemd service file for production
print_header "🔧 Creating systemd service template..."
cat > gardens-net.service << EOF
[Unit]
Description=GARDENS-NET E-commerce with MikPos Integration
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/gardens-net
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/var/www/gardens-net/.env.local

[Install]
WantedBy=multi-user.target
EOF

print_status "Systemd service template created: gardens-net.service"

# Create nginx configuration template
print_header "🌐 Creating nginx configuration template..."
cat > nginx-gardens-net.conf << EOF
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Special handling for MikPos webhook
    location /api/mikpos/webhook {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Increase timeout for webhook processing
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
}
EOF

print_status "Nginx configuration template created: nginx-gardens-net.conf"

# Create deployment script
print_header "🚀 Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying GARDENS-NET with MikPos Integration..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Build application
npm run build

# Restart service
sudo systemctl restart gardens-net

# Check status
sudo systemctl status gardens-net

echo "✅ Deployment completed!"
EOF

chmod +x deploy.sh
print_status "Deployment script created: deploy.sh"

# Final instructions
print_header "🎉 Setup completed!"
echo ""
print_status "Next steps:"
echo "1. Configure your environment variables in .env.local"
echo "2. Update MikPos configuration with webhook URL"
echo "3. Setup MikroTik RouterOS API access"
echo "4. Configure WhatsApp Business API"
echo "5. Test the integration with: npm run dev"
echo ""
print_status "Files created:"
echo "• .env.local (environment variables)"
echo "• webhook-test.json (sample webhook payload)"
echo "• mikpos-config.json (MikPos configuration)"
echo "• gardens-net.service (systemd service)"
echo "• nginx-gardens-net.conf (nginx configuration)"
echo "• deploy.sh (deployment script)"
echo ""
print_status "For production deployment:"
echo "• Copy gardens-net.service to /etc/systemd/system/"
echo "• Copy nginx-gardens-net.conf to /etc/nginx/sites-available/"
echo "• Enable and start the service: sudo systemctl enable gardens-net"
echo ""
print_warning "Remember to configure SSL certificates and firewall rules for production!"
echo ""
print_header "🔗 Integration URLs:"
echo "• Webhook: ${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}/api/mikpos/webhook"
echo "• Redirect: ${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}/mikpos/redirect"
echo "• Status: ${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}/mikpos/status"
echo ""
print_status "Happy coding! 🎯"
EOF

chmod +x scripts/setup-mikpos.sh
