#!/bin/bash

# WhatsApp Business API Integration Setup
# =====================================

set -e

echo "📱 WhatsApp Business API Integration Setup"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

ENV_FILE=".env"

echo -e "${BLUE}🔧 Setting up WhatsApp Business API integration...${NC}"
echo ""

# Function to prompt for input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local is_secret="$3"
    
    echo -e "${BLUE}$prompt${NC}"
    if [ "$is_secret" = "true" ]; then
        read -s -p "Enter value: " input
        echo ""
    else
        read -p "Enter value: " input
    fi
    
    # Update or add to .env file
    if grep -q "^$var_name=" "$ENV_FILE"; then
        sed -i "s|^$var_name=.*|$var_name=$input|" "$ENV_FILE"
    else
        echo "$var_name=$input" >> "$ENV_FILE"
    fi
    
    echo -e "${GREEN}✅ Set $var_name${NC}"
    echo ""
}

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}📋 Creating .env file...${NC}"
    touch "$ENV_FILE"
fi

echo -e "${YELLOW}📋 Please provide your WhatsApp Business API credentials:${NC}"
echo ""

# Collect WhatsApp credentials
prompt_input "🔑 WhatsApp Access Token (from Facebook Developer Console):" "WHATSAPP_ACCESS_TOKEN" "true"
prompt_input "📱 Phone Number ID (from WhatsApp Business API):" "WHATSAPP_PHONE_NUMBER_ID" "false"
prompt_input "🏢 Business Account ID (from Facebook Business Manager):" "WHATSAPP_BUSINESS_ACCOUNT_ID" "false"
prompt_input "📱 App ID (from Facebook App Dashboard):" "WHATSAPP_APP_ID" "false"

# Generate webhook verify token
WEBHOOK_TOKEN="whatsapp_verify_$(openssl rand -hex 16)"
if grep -q "^WHATSAPP_WEBHOOK_VERIFY_TOKEN=" "$ENV_FILE"; then
    sed -i "s|^WHATSAPP_WEBHOOK_VERIFY_TOKEN=.*|WHATSAPP_WEBHOOK_VERIFY_TOKEN=$WEBHOOK_TOKEN|" "$ENV_FILE"
else
    echo "WHATSAPP_WEBHOOK_VERIFY_TOKEN=$WEBHOOK_TOKEN" >> "$ENV_FILE"
fi
echo -e "${GREEN}✅ Generated webhook verify token${NC}"

# Set webhook URL
BASE_URL=$(grep "^BASE_URL=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- || echo "http://localhost:3000")
WEBHOOK_URL="$BASE_URL/api/whatsapp/webhook"
if grep -q "^WHATSAPP_WEBHOOK_URL=" "$ENV_FILE"; then
    sed -i "s|^WHATSAPP_WEBHOOK_URL=.*|WHATSAPP_WEBHOOK_URL=$WEBHOOK_URL|" "$ENV_FILE"
else
    echo "WHATSAPP_WEBHOOK_URL=$WEBHOOK_URL" >> "$ENV_FILE"
fi
echo -e "${GREEN}✅ Set webhook URL: $WEBHOOK_URL${NC}"

# Enable WhatsApp by default
if grep -q "^WHATSAPP_ENABLED=" "$ENV_FILE"; then
    sed -i "s|^WHATSAPP_ENABLED=.*|WHATSAPP_ENABLED=true|" "$ENV_FILE"
else
    echo "WHATSAPP_ENABLED=true" >> "$ENV_FILE"
fi
echo -e "${GREEN}✅ Enabled WhatsApp integration${NC}"

echo ""
echo -e "${BLUE}📋 WhatsApp Configuration Summary:${NC}"
echo -e "${YELLOW}$(grep "^WHATSAPP_" "$ENV_FILE" | sed 's/WHATSAPP_ACCESS_TOKEN=.*/WHATSAPP_ACCESS_TOKEN=***HIDDEN***/')${NC}"
echo ""

# Test configuration
echo -e "${BLUE}🧪 Testing WhatsApp configuration...${NC}"
if command -v curl &> /dev/null; then
    ACCESS_TOKEN=$(grep "^WHATSAPP_ACCESS_TOKEN=" "$ENV_FILE" | cut -d'=' -f2-)
    PHONE_ID=$(grep "^WHATSAPP_PHONE_NUMBER_ID=" "$ENV_FILE" | cut -d'=' -f2-)
    
    if [ -n "$ACCESS_TOKEN" ] && [ -n "$PHONE_ID" ]; then
        echo -e "${YELLOW}Testing WhatsApp Business API connection...${NC}"
        
        # Test API connection
        RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/whatsapp_test.json \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            "https://graph.facebook.com/v18.0/$PHONE_ID")
        
        if [ "$RESPONSE" = "200" ]; then
            PHONE_NUMBER=$(cat /tmp/whatsapp_test.json | grep -o '"display_phone_number":"[^"]*' | cut -d'"' -f4)
            BUSINESS_NAME=$(cat /tmp/whatsapp_test.json | grep -o '"verified_name":"[^"]*' | cut -d'"' -f4)
            echo -e "${GREEN}✅ WhatsApp API connection successful!${NC}"
            echo -e "${GREEN}   Phone: $PHONE_NUMBER${NC}"
            echo -e "${GREEN}   Business: $BUSINESS_NAME${NC}"
        else
            echo -e "${RED}❌ WhatsApp API connection failed (HTTP $RESPONSE)${NC}"
            echo -e "${YELLOW}Please check your credentials and try again${NC}"
        fi
        
        rm -f /tmp/whatsapp_test.json
    fi
else
    echo -e "${YELLOW}⚠️  curl not available, skipping connection test${NC}"
fi

echo ""
echo -e "${GREEN}🎉 WhatsApp integration setup completed!${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "   1. ${YELLOW}Configure webhook in Facebook Developer Console:${NC}"
echo -e "      URL: $WEBHOOK_URL"
echo -e "      Verify Token: $WEBHOOK_TOKEN"
echo -e "      Fields: messages, message_deliveries, message_reads"
echo ""
echo -e "   2. ${YELLOW}Test the integration:${NC}"
echo -e "      Visit: http://localhost:3000/mikpos/settings/whatsapp"
echo ""
echo -e "   3. ${YELLOW}Send test message:${NC}"
echo -e "      Use the test interface to verify message delivery"
echo ""
echo -e "   4. ${YELLOW}Start using voucher delivery:${NC}"
echo -e "      Generate vouchers with WhatsApp delivery enabled"
