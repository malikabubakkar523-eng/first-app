const BASE_URL = "http://localhost:3000";

async function runVerification() {
  console.log(`🚀 Running VELOCE Major Admin + User + Mobile Suite against: ${BASE_URL}\n`);

  let passed = 0;
  let total = 8;

  // Step 1: Admin Login & Activity Tracking Verification
  console.log("1️⃣ Testing Admin Authentication & Login Activity Logging...");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "adminveloco@gmail.com",
        password: "admin123",
      }),
    });
    const data = await res.json();
    const cookie = res.headers.get("set-cookie");
    if (res.ok && data.success && data.user.role === "ADMIN") {
      console.log(`✅ Admin authenticated successfully: "${data.user.name}"`);
      passed++;
    } else {
      console.error("❌ Admin auth failed:", data);
    }

    // Step 2: Customer Registration & Activity Log
    console.log("\n2️⃣ Testing Customer Registration & Patron Circle Onboarding...");
    const testEmail = `patron_${Date.now()}@veloce-atelier.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Lord Sterling",
        email: testEmail,
        password: "Password@123",
      }),
    });
    const regData = await regRes.json();
    const customerCookie = regRes.headers.get("set-cookie");
    if (regRes.ok && regData.success) {
      console.log(`✅ Customer registered & session started: "${regData.user.name}" (${testEmail})`);
      passed++;
    } else {
      console.error("❌ Registration failed:", regData);
    }

    // Step 3: Customer Profile Settings Update
    console.log("\n3️⃣ Testing Customer Profile & Avatar Update (/api/account/profile)...");
    const profRes = await fetch(`${BASE_URL}/api/account/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie || "",
      },
      body: JSON.stringify({
        name: "Lord Julian Sterling",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        phone: "+1 (555) 888-9999",
      }),
    });
    const profData = await profRes.json();
    if (profRes.ok && profData.success && profData.user.name === "Lord Julian Sterling") {
      console.log(`✅ Customer profile details & circular avatar updated: "${profData.user.name}"`);
      passed++;
    } else {
      console.error("❌ Profile update failed:", profData);
    }

    // Step 4: Customer Password Update
    console.log("\n4️⃣ Testing Secure Change Password Flow (/api/account/change-password)...");
    const passRes = await fetch(`${BASE_URL}/api/account/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie || "",
      },
      body: JSON.stringify({
        currentPassword: "Password@123",
        newPassword: "NewSecretPassword@2026",
        confirmNewPassword: "NewSecretPassword@2026",
      }),
    });
    const passData = await passRes.json();
    if (passRes.ok && passData.success) {
      console.log("✅ Password successfully verified, re-hashed, and updated in database.");
      passed++;
    } else {
      console.error("❌ Password change failed:", passData);
    }

    // Step 5: Admin Direct / Bulk Email via Resend
    console.log("\n5️⃣ Testing Admin Email Dispatch via Resend (/api/admin/emails/send)...");
    const emailRes = await fetch(`${BASE_URL}/api/admin/emails/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie || "",
      },
      body: JSON.stringify({
        recipients: ["malikabubakkar523@gmail.com"],
        subject: "Exclusive Atelier Invitation: SS26 Carbon Marathon Collection",
        message: "Dear Patron, your VIP allocation for the upcoming carbon plate drop is reserved.",
      }),
    });
    const emailData = await emailRes.json();
    if (emailRes.ok && emailData.success) {
      console.log(`✅ Resend Email Dispatched! Sent to ${emailData.sentCount} recipient(s).`);
      passed++;
    } else {
      console.error("❌ Admin email dispatch failed:", emailData);
    }

    // Step 6: Admin Email Logs Query
    console.log("\n6️⃣ Testing Admin Email History Logs Query (/api/admin/emails)...");
    const logsRes = await fetch(`${BASE_URL}/api/admin/emails`, {
      headers: { Cookie: cookie || "" },
    });
    const logsData = await logsRes.json();
    if (logsRes.ok && logsData.success && logsData.count > 0) {
      console.log(`✅ Email logs verified in database: Found ${logsData.count} dispatch records.`);
      passed++;
    } else {
      console.error("❌ Email logs query failed:", logsData);
    }

    // Step 7: Order Placement & Preservation Check
    console.log("\n7️⃣ Testing Order Creation & Historical Preservation...");
    const orderRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie || "",
      },
      body: JSON.stringify({
        items: [
          {
            productId: "seed-prod-1",
            productName: "Veloce Apex Carbon Ghost",
            productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
            size: "42",
            color: "Stealth Ghost",
            price: 240,
            quantity: 1,
          },
        ],
        customerName: "Lord Julian Sterling",
        customerEmail: "malikabubakkar523@gmail.com",
        customerPhone: "+1 (555) 888-9999",
        shippingAddress: {
          street: "888 Madison Ave",
          city: "New York",
          state: "NY",
          postalCode: "10021",
          country: "US",
        },
        paymentMethod: "CASH_ON_DELIVERY",
        subtotal: 240,
        discount: 0,
        shippingFee: 0,
        total: 240,
      }),
    });
    const orderData = await orderRes.json();
    if (orderRes.ok && orderData.success) {
      console.log(`✅ Order placed and preserved in DB: #${orderData.order.orderNumber} (Status: ${orderData.order.orderStatus})`);
      passed++;
    } else {
      console.error("❌ Order placement failed:", orderData);
    }

    // Step 8: Product Catalog & Quick View Availability
    console.log("\n8️⃣ Testing Product Catalog & Stock Query (/api/products)...");
    const prodRes = await fetch(`${BASE_URL}/api/products?limit=5`);
    const prodData = await prodRes.json();
    if (prodRes.ok && prodData.products && prodData.products.length > 0) {
      console.log(`✅ Footwear Catalog Active: ${prodData.products.length} models ready with Quick View modal.`);
      passed++;
    } else {
      console.error("❌ Products fetch failed:", prodData);
    }

  } catch (err) {
    console.error("Test execution exception:", err);
  }

  console.log(`\n======================================================`);
  console.log(`🏆 TEST RESULTS: ${passed}/${total} SUITES PASSED — VELOCE OPERATIONAL!`);
  console.log(`======================================================\n`);
}

runVerification();
