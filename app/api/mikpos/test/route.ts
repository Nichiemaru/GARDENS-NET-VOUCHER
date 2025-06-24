import { type NextRequest, NextResponse } from "next/server"

// Test endpoint untuk simulate MikPos webhook calls
export async function POST(request: NextRequest) {
  try {
    const { testType, customData } = await request.json()

    console.log(`🧪 Running MikPos webhook test: ${testType}`)

    switch (testType) {
      case "voucher_purchase_request":
        return await testVoucherPurchaseRequest(customData)

      case "customer_redirect":
        return await testCustomerRedirect(customData)

      case "payment_notification":
        return await testPaymentNotification(customData)

      case "full_flow":
        return await testFullFlow(customData)

      default:
        return NextResponse.json({ error: "Invalid test type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({ error: "Test failed", details: error.message }, { status: 500 })
  }
}

async function testVoucherPurchaseRequest(customData?: any) {
  const testData = {
    action: "voucher_purchase_request",
    customer: {
      name: customData?.customer?.name || "Test Customer",
      mac_address: customData?.customer?.mac_address || "AA:BB:CC:DD:EE:FF",
      ip_address: customData?.customer?.ip_address || "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    hotspot: {
      interface: "ether1",
      server_name: "GARDENS-NET Hotspot",
      login_url: "http://192.168.1.1/login",
    },
    requested_profile: customData?.requested_profile || "1day",
    timestamp: new Date().toISOString(),
  }

  // Simulate webhook call to our own endpoint
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/mikpos/webhook`

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mikpos-signature": "sha256=test-signature",
    },
    body: JSON.stringify(testData),
  })

  const result = await response.json()

  return NextResponse.json({
    test: "voucher_purchase_request",
    status: response.status,
    webhook_response: result,
    test_data: testData,
    success: response.ok,
  })
}

async function testCustomerRedirect(customData?: any) {
  const testData = {
    action: "customer_redirect",
    customer: {
      name: customData?.customer?.name || "Redirect Test Customer",
      mac_address: customData?.customer?.mac_address || "BB:CC:DD:EE:FF:AA",
      ip_address: customData?.customer?.ip_address || "192.168.1.101",
    },
    hotspot: {
      interface: "ether2",
      server_name: "GARDENS-NET Hotspot",
      login_url: "http://192.168.1.1/login",
    },
    timestamp: new Date().toISOString(),
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/mikpos/webhook`

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mikpos-signature": "sha256=test-signature",
    },
    body: JSON.stringify(testData),
  })

  const result = await response.json()

  return NextResponse.json({
    test: "customer_redirect",
    status: response.status,
    webhook_response: result,
    test_data: testData,
    success: response.ok,
  })
}

async function testPaymentNotification(customData?: any) {
  const testData = {
    action: "payment_notification",
    customer: {
      name: "Payment Test Customer",
      mac_address: "CC:DD:EE:FF:AA:BB",
      ip_address: "192.168.1.102",
    },
    payment: {
      order_id: customData?.order_id || "ORDER-TEST-123",
      status: customData?.payment_status || "success",
      amount: customData?.amount || 15000,
      method: "qris",
    },
    timestamp: new Date().toISOString(),
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/mikpos/webhook`

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mikpos-signature": "sha256=test-signature",
    },
    body: JSON.stringify(testData),
  })

  const result = await response.json()

  return NextResponse.json({
    test: "payment_notification",
    status: response.status,
    webhook_response: result,
    test_data: testData,
    success: response.ok,
  })
}

async function testFullFlow(customData?: any) {
  const results = []

  // Step 1: Test voucher purchase request
  console.log("🔄 Step 1: Testing voucher purchase request...")
  const step1 = await testVoucherPurchaseRequest(customData)
  const step1Data = await step1.json()
  results.push({ step: 1, name: "voucher_purchase_request", ...step1Data })

  if (!step1Data.success) {
    return NextResponse.json({
      test: "full_flow",
      success: false,
      error: "Step 1 failed",
      results,
    })
  }

  // Extract session ID from redirect URL
  const redirectUrl = step1Data.webhook_response?.redirect_url
  const sessionId = redirectUrl?.split("session=")[1]

  if (!sessionId) {
    return NextResponse.json({
      test: "full_flow",
      success: false,
      error: "No session ID generated",
      results,
    })
  }

  // Step 2: Test session retrieval
  console.log("🔄 Step 2: Testing session retrieval...")
  try {
    const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mikpos/session/${sessionId}`)
    const sessionData = await sessionResponse.json()

    results.push({
      step: 2,
      name: "session_retrieval",
      status: sessionResponse.status,
      success: sessionResponse.ok,
      data: sessionData,
    })
  } catch (error) {
    results.push({
      step: 2,
      name: "session_retrieval",
      success: false,
      error: error.message,
    })
  }

  // Step 3: Test order creation
  console.log("🔄 Step 3: Testing order creation...")
  try {
    const orderData = {
      session_id: sessionId,
      package_id: "1day",
      customer: {
        name: "Test Customer",
        whatsapp: "6281234567890",
      },
    }

    const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mikpos/order/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })

    const orderResult = await orderResponse.json()

    results.push({
      step: 3,
      name: "order_creation",
      status: orderResponse.status,
      success: orderResponse.ok,
      data: orderResult,
    })

    // Step 4: Test payment success
    if (orderResponse.ok && orderResult.order_id) {
      console.log("🔄 Step 4: Testing payment success...")

      const paymentData = {
        order_id: orderResult.order_id,
        payment_status: "success",
        payment_method: "qris",
        amount: 15000,
      }

      const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mikpos/payment/success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      })

      const paymentResult = await paymentResponse.json()

      results.push({
        step: 4,
        name: "payment_success",
        status: paymentResponse.status,
        success: paymentResponse.ok,
        data: paymentResult,
      })
    }
  } catch (error) {
    results.push({
      step: 3,
      name: "order_creation",
      success: false,
      error: error.message,
    })
  }

  const allSuccess = results.every((r) => r.success)

  return NextResponse.json({
    test: "full_flow",
    success: allSuccess,
    total_steps: results.length,
    results,
    session_id: sessionId,
    redirect_url: redirectUrl,
  })
}

// GET endpoint untuk health check dan test info
export async function GET() {
  return NextResponse.json({
    service: "MikPos Webhook Test API",
    available_tests: ["voucher_purchase_request", "customer_redirect", "payment_notification", "full_flow"],
    usage: {
      endpoint: "/api/mikpos/test",
      method: "POST",
      body: {
        testType: "voucher_purchase_request | customer_redirect | payment_notification | full_flow",
        customData: "optional custom test data",
      },
    },
    timestamp: new Date().toISOString(),
  })
}
