#!/bin/bash

# Script untuk konfigurasi redirect MikPos ke GARDENS-NET
echo "🔧 Configuring MikPos Redirect to GARDENS-NET..."

# Variabel konfigurasi
MIKPOS_IP=${MIKPOS_IP:-"192.168.1.1"}
GARDENS_NET_URL=${GARDENS_NET_URL:-"http://192.168.1.100:8080"}
MIKROTIK_USER=${MIKROTIK_USER:-"admin"}
MIKROTIK_PASS=${MIKROTIK_PASS:-""}

echo "📋 Configuration:"
echo "   MikPos IP: $MIKPOS_IP"
echo "   GARDENS-NET URL: $GARDENS_NET_URL"
echo ""

# 1. Backup existing hotspot configuration
echo "💾 Backing up existing hotspot configuration..."
mkdir -p backups
curl -u "$MIKROTIK_USER:$MIKROTIK_PASS" \
     "http://$MIKPOS_IP/rest/ip/hotspot/walled-garden" \
     > backups/walled-garden-backup.json

# 2. Add GARDENS-NET to walled garden
echo "🌐 Adding GARDENS-NET to walled garden..."
curl -X POST \
     -u "$MIKROTIK_USER:$MIKROTIK_PASS" \
     -H "Content-Type: application/json" \
     -d "{\"dst-host\":\"$(echo $GARDENS_NET_URL | sed 's|http://||' | sed 's|:.*||')\",\"action\":\"allow\"}" \
     "http://$MIKPOS_IP/rest/ip/hotspot/walled-garden"

# 3. Configure hotspot login page redirect
echo "🔄 Configuring hotspot login redirect..."
curl -X PATCH \
     -u "$MIKROTIK_USER:$MIKROTIK_PASS" \
     -H "Content-Type: application/json" \
     -d "{\"login-by\":\"http-chap,https\",\"http-proxy\":\"$GARDENS_NET_URL/mikpos/redirect\"}" \
     "http://$MIKPOS_IP/rest/ip/hotspot/0"

# 4. Test configuration
echo "🧪 Testing configuration..."
TEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$GARDENS_NET_URL/customer")

if [ "$TEST_RESPONSE" = "200" ]; then
    echo "✅ Configuration successful!"
    echo "   Customer landing page: $GARDENS_NET_URL/customer"
    echo "   MikPos redirect: $GARDENS_NET_URL/mikpos/redirect"
else
    echo "❌ Configuration failed. HTTP response: $TEST_RESPONSE"
    exit 1
fi

# 5. Create monitoring script
echo "📊 Creating monitoring script..."
cat > monitor-redirect.sh << EOF
#!/bin/bash
while true; do
    echo "\$(date): Checking GARDENS-NET availability..."
    if curl -s "$GARDENS_NET_URL/customer" > /dev/null; then
        echo "✅ GARDENS-NET is accessible"
    else
        echo "❌ GARDENS-NET is not accessible"
    fi
    sleep 60
done
EOF

chmod +x monitor-redirect.sh

echo ""
echo "🎉 MikPos redirect configuration completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Test customer access: Connect to WiFi and try to browse"
echo "   2. Monitor logs: ./monitor-redirect.sh"
echo "   3. Admin access: $GARDENS_NET_URL/mikpos/login"
echo ""
echo "🔧 To revert changes, restore from backups/ directory"
