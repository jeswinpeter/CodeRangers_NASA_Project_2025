// Test script to check if location changes update all dashboard data
console.log("Testing location update functionality...");

async function testLocationUpdate() {
  try {
    // Test backend API directly
    console.log("1. Testing backend API directly...");
    
    const response = await fetch("http://localhost:8002/api/weather/current?lat=9.5916&lon=76.5222");
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Backend API working:", data);
    } else {
      console.log("❌ Backend API error:", data);
    }
    
    // Test frontend proxy
    console.log("\n2. Testing frontend proxy...");
    
    const proxyResponse = await fetch("/api/weather/current?lat=9.5916&lon=76.5222");
    const proxyData = await proxyResponse.json();
    
    if (proxyResponse.ok) {
      console.log("✅ Frontend proxy working:", proxyData);
    } else {
      console.log("❌ Frontend proxy error:", proxyData);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run test
testLocationUpdate();