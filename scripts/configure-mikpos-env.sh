#!/bin/bash

# MikPos Environment Configuration Helper
# ======================================

set -e

echo "⚙️  MikPos Environment Configuration"
echo "==================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}📋 Creating new .env file...${NC}"
    cp .env.production .env
fi

echo -e "${BLUE}🔧 Configuring MikPos integration...${NC}"
echo ""

# Function to prompt for input with default
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    echo -e "${BLUE}$prompt${NC}"
    if [ -n "$default" ]; then
        echo -e "${YELLOW}Current/Default: $default${NC}"
    fi
    read -p "Enter value (or press Enter for default): " input
    
    if [ -z "$input" ] && [ -n "$default" ]; then
        input="$default"
    fi
    
    # Update or add to .env file
    if grep -q "^$var_name=" "$ENV_FILE"; then
        sed -i "s|^$var_name=.*|$var_name=$input|" "$ENV_FILE"
    else
        echo "$var_name=$input" >> "$ENV_FILE"
    fi
    
    echo -e "${GREEN}✅ Set $var_name=$input${NC}"
    echo ""
}

# Get current values from .env if they exist
CURRENT_BASE_URL=$(grep "^MIKPOS_BASE_URL=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- || echo "")
CURRENT_API_KEY=$(grep "^MIKPOS_API_KEY=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- || echo "")
CURRENT_WEBHOOK_URL=$(grep "^MIKPOS_WEBHOOK_URL=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- || echo "")
CURRENT_WEBHOOK_SECRET=$(grep "^MIKPOS_WEBHOOK_SECRET=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- || echo "")

# Prompt for configuration
prompt_with_default "🌐 MikPos Base URL (e.g., http://192.168.1.100:8080):" \
    "${CURRENT_BASE_URL:-http://192.168.1.100:8080}" \
    "MIKPOS_BASE_URL"

prompt_with_default "🔑 MikPos API Key:" \
    "$CURRENT_API_KEY" \
    "MIKPOS_API_KEY"

# Auto-generate webhook URL if BASE_URL is set
BASE_URL=$(grep "^BASE_URL=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- || echo "http://localhost:3000")
DEFAULT_WEBHOOK_URL="$BASE_URL/api/mikpos/products/webhook"

prompt_with_default "📡 Webhook URL:" \
    "${CURRENT_WEBHOOK_URL:-$DEFAULT_WEBHOOK_URL}" \
    "MIKPOS_WEBHOOK_URL"

# Generate webhook secret if not exists
if [ -z "$CURRENT_WEBHOOK_SECRET" ]; then
    GENERATED_SECRET=$(openssl rand -hex 32)
    prompt_with_default "🔐 Webhook Secret (auto-generated):" \
        "$GENERATED_SECRET" \
        "MIKPOS_WEBHOOK_SECRET"
else
    prompt_with_default "🔐 Webhook Secret:" \
        "$CURRENT_WEBHOOK_SECRET" \
        "MIKPOS_WEBHOOK_SECRET"
fi

# Additional MikPos settings
echo -e "${BLUE}📋 Additional MikPos Settings:${NC}"

# Sync settings
if ! grep -q "^MIKPOS_SYNC_ENABLED=" "$ENV_FILE"; then
    echo "MIKPOS_SYNC_ENABLED=true" >> "$ENV_FILE"
fi

if ! grep -q "^MIKPOS_AUTO_SYNC=" "$ENV_FILE"; then
    echo "MIKPOS_AUTO_SYNC=true" >> "$ENV_FILE"
fi

if ! grep -q "^MIKPOS_SYNC_INTERVAL=" "$ENV_FILE"; then
    echo "MIKPOS_SYNC_INTERVAL=300" >> "$ENV_FILE"
fi

echo -e "${GREEN}✅ Additional settings configured${NC}"
echo ""

# Display final configuration
echo -e "${BLUE}📋 Final MikPos Configuration:${NC}"
echo -e "${YELLOW}$(grep "^MIKPOS_" "$ENV_FILE")${NC}"
echo ""

# Test configuration
echo -e "${BLUE}🧪 Testing configuration...${NC}"
if command -v curl &> /dev/null; then
    MIKPOS_BASE_URL=$(grep "^MIKPOS_BASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
    MIKPOS_API_KEY=$(grep "^MIKPOS_API_KEY=" "$ENV_FILE" | cut -d'=' -f2-)
    
    if [ -n "$MIKPOS_BASE_URL" ] && [ -n "$MIKPOS_API_KEY" ]; then
        echo -e "${YELLOW}Testing MikPos connection...${NC}"
        if curl -s --max-time 10 -H "Authorization: Bearer $MIKPOS_API_KEY" "$MIKPOS_BASE_URL/api/health" > /dev/null; then
            echo -e "${GREEN}✅ MikPos connection successful!${NC}"
        else
            echo -e "${RED}❌ MikPos connection failed. Please check your settings.${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  curl not available, skipping connection test${NC}"
fi

echo ""
echo -e "${GREEN}🎉 MikPos configuration completed!${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo -e "   1. ${YELLOW}Restart the application: docker-compose restart${NC}"
echo -e "   2. ${YELLOW}Setup webhook: ./scripts/setup-mikpos-webhook.sh${NC}"
echo -e "   3. ${YELLOW}Test integration: ./scripts/test-mikpos-webhook.sh${NC}"
echo -e "   4. ${YELLOW}Monitor status: ./scripts/monitor-mikpos-webhook.sh${NC}"
