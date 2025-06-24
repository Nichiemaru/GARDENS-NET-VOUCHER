#!/bin/bash

# MikPos Webhook Configuration Script
# ==================================

set -e

echo "🔗 Setting up MikPos Webhook Integration"
echo "======================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Check required variables
if [ -z "$MIKPOS_BASE_URL" ] || [ -z "$MIKPOS_API_KEY" ] || [ -z "$MIKPOS_WEBHOOK_URL" ]; then
    echo -e "${RED}❌ Missing required MikPos configuration!${NC}"
    echo -e "${YELLOW}Please set: MIKPOS_BASE_URL, MIKPOS_API_KEY, MIKPOS_WEBHOOK_URL${NC}"
    exit 1
fi

echo -e "${BLUE}📋 MikPos Configuration:${NC}"
echo -e "   🌐 Base URL: ${YELLOW}$MIKPOS_BASE_URL${NC}"
echo -e "   🔗 Webhook URL: ${YELLOW}$MIKPOS_WEBHOOK_URL${NC}"
echo -e "   🔑 API Key: ${YELLOW}${MIKPOS_API_KEY:0:8}...${NC}"

# Test MikPos connection
echo -e "${BLUE}🔍 Testing MikPos connection...${NC}"
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/mikpos_test.json \
    -H "Authorization: Bearer $MIKPOS_API_KEY" \
    -H "Content-Type: application/json" \
    "$MIKPOS_BASE_URL/api/health" || echo "000")

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ MikPos connection successful!${NC}"
else
    echo -e "${RED}❌ MikPos connection failed (HTTP: $RESPONSE)${NC}"
    echo -e "${YELLOW}Please check your MIKPOS_BASE_URL and MIKPOS_API_KEY${NC}"
    exit 1
fi

# Register webhook with MikPos
echo -e "${BLUE}📡 Registering webhook with MikPos...${NC}"
WEBHOOK_PAYLOAD=$(cat <<EOF
{
    "url": "$MIKPOS_WEBHOOK_URL",
    "secret": "$MIKPOS_WEBHOOK_SECRET",
    "events": [
        "product.created",
        "product.updated",
        "product.deleted",
        "product.stock_changed",
        "product.price_changed"
    ],
    "active": true
}
EOF
)

WEBHOOK_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/webhook_register.json \
    -X POST \
    -H "Authorization: Bearer $MIKPOS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$WEBHOOK_PAYLOAD" \
    "$MIKPOS_BASE_URL/api/webhooks" || echo "000")

if [ "$WEBHOOK_RESPONSE" = "201" ] || [ "$WEBHOOK_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Webhook registered successfully!${NC}"
    WEBHOOK_ID=$(cat /tmp/webhook_register.json | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}   📝 Webhook ID: ${YELLOW}$WEBHOOK_ID${NC}"
else
    echo -e "${YELLOW}⚠️  Webhook registration response: HTTP $WEBHOOK_RESPONSE${NC}"
    if [ -f /tmp/webhook_register.json ]; then
        echo -e "${YELLOW}Response: $(cat /tmp/webhook_register.json)${NC}"
    fi
fi

# Test webhook endpoint
echo -e "${BLUE}🧪 Testing webhook endpoint...${NC}"
TEST_PAYLOAD=$(cat <<EOF
{
    "event": "product.updated",
    "data": {
        "id": "test-product-123",
        "name": "Test Product",
        "price": 15000,
        "stock": 100,
        "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    },
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)

# Generate webhook signature for testing
SIGNATURE=$(echo -n "$TEST_PAYLOAD" | openssl dgst -sha256 -hmac "$MIKPOS_WEBHOOK_SECRET" -binary | base64)

WEBHOOK_TEST_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/webhook_test.json \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-MikPos-Signature: sha256=$SIGNATURE" \
    -d "$TEST_PAYLOAD" \
    "$MIKPOS_WEBHOOK_URL" || echo "000")

if [ "$WEBHOOK_TEST_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Webhook endpoint test successful!${NC}"
else
    echo -e "${YELLOW}⚠️  Webhook endpoint test response: HTTP $WEBHOOK_TEST_RESPONSE${NC}"
    echo -e "${YELLOW}This is normal if the application is not running yet.${NC}"
fi

# Create webhook monitoring script
echo -e "${BLUE}📊 Creating webhook monitoring script...${NC}"
cat > scripts/monitor-mikpos-webhook.sh << 'EOF'
#!/bin/bash

# MikPos Webhook Monitor
# =====================

echo "🔍 MikPos Webhook Status Monitor"
echo "================================"

# Check webhook logs
echo "📝 Recent webhook logs:"
docker-compose logs --tail=50 app | grep -i "mikpos\|webhook" || echo "No recent webhook activity"

# Check MikPos connectivity
echo ""
echo "🌐 Testing MikPos connectivity..."
if curl -s --max-time 5 "$MIKPOS_BASE_URL/api/health" > /dev/null; then
    echo "✅ MikPos server is reachable"
else
    echo "❌ MikPos server is not reachable"
fi

# Check webhook endpoint
echo ""
echo "📡 Testing webhook endpoint..."
if curl -s --max-time 5 "$MIKPOS_WEBHOOK_URL" > /dev/null; then
    echo "✅ Webhook endpoint is accessible"
else
    echo "❌ Webhook endpoint is not accessible"
fi

# Show webhook statistics
echo ""
echo "📊 Webhook Statistics (last 24 hours):"
docker-compose logs --since=24h app | grep -c "mikpos.*webhook" || echo "0 webhook events"
EOF

chmod +x scripts/monitor-mikpos-webhook.sh

# Cleanup temp files
rm -f /tmp/mikpos_test.json /tmp/webhook_register.json /tmp/webhook_test.json

echo ""
echo -e "${GREEN}🎉 MikPos Webhook setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Configuration Summary:${NC}"
echo -e "   🌐 MikPos URL: ${YELLOW}$MIKPOS_BASE_URL${NC}"
echo -e "   📡 Webhook URL: ${YELLOW}$MIKPOS_WEBHOOK_URL${NC}"
echo -e "   🔐 Webhook Secret: ${YELLOW}${MIKPOS_WEBHOOK_SECRET:0:8}...${NC}"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo -e "   📊 Monitor: ${YELLOW}./scripts/monitor-mikpos-webhook.sh${NC}"
echo -e "   🧪 Test: ${YELLOW}./scripts/test-mikpos-webhook.sh${NC}"
echo -e "   📝 Logs: ${YELLOW}docker-compose logs -f app | grep mikpos${NC}"
echo ""
echo -e "${GREEN}✅ Ready for MikPos integration!${NC}"
