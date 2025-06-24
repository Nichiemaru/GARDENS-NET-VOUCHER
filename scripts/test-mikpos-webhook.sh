#!/bin/bash

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
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Configuration
BASE_URL=${NEXT_PUBLIC_BASE_URL:-"http://localhost:3000"}
WEBHOOK_SECRET=${MIKPOS_WEBHOOK_SECRET:-"default-secret"}

print_header "MikPos Webhook Testing Script"
echo "Base URL: $BASE_URL"
echo "Webhook Secret: $WEBHOOK_SECRET"
echo ""

# Function to generate signature
generate_signature() {
    local payload="$1"
    local secret="$2"
    echo -n "$payload" | openssl dgst -sha256 -hmac "$secret" | sed 's/^.* //'
}

# Function to test webhook endpoint
test_webhook() {
    local test_name="$1"
    local payload="$2"
    local expected_status="${3:-200}"
    
    print_header "Testing: $test_name"
    
    # Generate signature
    local signature=$(generate_signature "$payload" "$WEBHOOK_SECRET")
    
    # Make request
    local response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/mikpos/webhook" \
        -H "Content-Type: application/json" \
        -H "x-mikpos-signature: sha256=$signature" \
        -d "$payload")
    
    # Parse response
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    # Check status
    if [ "$http_code" -eq "$expected_status" ]; then
        print_status "✅ Test passed (HTTP $http_code)"
        echo "Response: $body" | jq '.' 2>/dev/null || echo "Response: $body"
    else
        print_error "❌ Test failed (HTTP $http_code, expected $expected_status)"
        echo "Response: $body"
    fi
    
    echo ""
    return $([ "$http_code" -eq "$expected_status" ] && echo 0 || echo 1)
}

# Test 1: Voucher Purchase Request
print_header "Test 1: Voucher Purchase Request"
PAYLOAD1='{
  "action": "voucher_purchase_request",
  "customer": {
    "name": "Test Customer 1",
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
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
}'

test_webhook "Voucher Purchase Request" "$PAYLOAD1" 200

# Test 2: Customer Redirect
print_header "Test 2: Customer Redirect"
PAYLOAD2='{
  "action": "customer_redirect",
  "customer": {
    "name": "Test Customer 2",
    "mac_address": "BB:CC:DD:EE:FF:AA",
    "ip_address": "192.168.1.101"
  },
  "hotspot": {
    "interface": "ether2",
    "server_name": "GARDENS-NET Hotspot",
    "login_url": "http://192.168.1.1/login"
  },
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
}'

test_webhook "Customer Redirect" "$PAYLOAD2" 200

# Test 3: Payment Notification
print_header "Test 3: Payment Notification"
PAYLOAD3='{
  "action": "payment_notification",
  "customer": {
    "name": "Test Customer 3",
    "mac_address": "CC:DD:EE:FF:AA:BB",
    "ip_address": "192.168.1.102"
  },
  "payment": {
    "order_id": "ORDER-TEST-123",
    "status": "success",
    "amount": 15000,
    "method": "qris"
  },
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
}'

test_webhook "Payment Notification" "$PAYLOAD3" 200

# Test 4: Invalid Signature
print_header "Test 4: Invalid Signature"
PAYLOAD4='{"action": "test", "invalid": true}'

print_status "Testing with invalid signature..."
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/mikpos/webhook" \
    -H "Content-Type: application/json" \
    -H "x-mikpos-signature: sha256=invalid-signature" \
    -d "$PAYLOAD4")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq "401" ]; then
    print_status "✅ Invalid signature test passed (HTTP 401)"
else
    print_error "❌ Invalid signature test failed (HTTP $http_code, expected 401)"
fi
echo "Response: $body"
echo ""

# Test 5: Health Check
print_header "Test 5: Health Check"
print_status "Testing webhook health check..."
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/mikpos/webhook")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq "200" ]; then
    print_status "✅ Health check passed"
    echo "Response: $body" | jq '.' 2>/dev/null || echo "Response: $body"
else
    print_error "❌ Health check failed (HTTP $http_code)"
    echo "Response: $body"
fi
echo ""

# Test 6: Full Flow Test via API
print_header "Test 6: Full Flow Test"
print_status "Running full flow test via test API..."

FULL_FLOW_PAYLOAD='{
  "testType": "full_flow",
  "customData": {
    "customer": {
      "name": "Full Flow Test Customer",
      "mac_address": "DD:EE:FF:AA:BB:CC",
      "ip_address": "192.168.1.103"
    },
    "requested_profile": "1day"
  }
}'

response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/mikpos/test" \
    -H "Content-Type: application/json" \
    -d "$FULL_FLOW_PAYLOAD")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq "200" ]; then
    print_status "✅ Full flow test completed"
    echo "Response: $body" | jq '.' 2>/dev/null || echo "Response: $body"
else
    print_error "❌ Full flow test failed (HTTP $http_code)"
    echo "Response: $body"
fi
echo ""

# Summary
print_header "Test Summary"
print_status "All webhook tests completed!"
print_status "Check the responses above for detailed results."
print_status ""
print_status "Next steps:"
echo "1. Visit $BASE_URL/mikpos/test for interactive testing"
echo "2. Configure MikPos to use webhook URL: $BASE_URL/api/mikpos/webhook"
echo "3. Test with real MikPos system"
echo ""
print_warning "Remember to configure proper webhook secrets in production!"
