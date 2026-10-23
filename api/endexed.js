export default async function handler(request, response) {
  const startTime = Date.now();

  const term = request.query.term;
  const apikey = request.query.key;

  // 🔑 Key check
  if (!apikey) {
    return response.status(401).json({ 
      status: "error",
      message: "Provide correct key",
      contact: "@Endexed"
    });
  }

  // 🔑 Valid Key: RC-VEHICLE-2026-X
  // 📅 Expiry: Year 2033
  const VALID_KEYS = {
    "RC-VEHICLE-2026-X": { expires: 2000000000000 }
  };

  const keyInfo = VALID_KEYS[apikey];

  if (!keyInfo) {
    return response.status(403).json({ 
      status: "error",
      message: "Provide correct key",
      contact: "@Endexed"
    });
  }

  // ⏰ Expire check
  const now = Date.now();
  if (now > keyInfo.expires) {
    const expiryDate = new Date(keyInfo.expires).toISOString().split("T")[0];
    return response.status(403).json({ 
      status: "error",
      message: "Your API key expired",
      expired_on: expiryDate,
      contact: "@Endexed"
    });
  }

  // 🔍 Term check
  if (!term) {
    return response.status(400).json({ 
      status: "error",
      message: "Please provide vehicle number",
      contact: "@Endexed"
    });
  }

  // 🚗 Vehicle RC format check (सुधारा गया है ताकि UP43AH4275 पास हो जाए)
  if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(term.toUpperCase())) {
    return response.status(400).json({ 
      status: "error",
      message: "Provide valid RC number (e.g. UP43AH4275)",
      contact: "@Endexed"
    });
  }

  // 🌐 Upstream API Call
  const upstreamUrl = `https://shuruu-rc-to-num-asif-laskari-api.vercel.app/api?key=@AsifLaskari&term=${encodeURIComponent(term.toUpperCase())}`;

  try {
    const apiResponse = await fetch(upstreamUrl);
    
    if (!apiResponse.ok) {
      return response.status(404).json({ 
        status: "error",
        message: "Data not found from upstream",
        contact: "@Endexed"
      });
    }

    let data = await apiResponse.json();

    // ❌ डेटा चेक करें (नए रिस्पॉन्स स्ट्रक्चर के अनुसार)
    let mobileNumber = null;
    let vehicleNumber = null;

    if (data.RC_TO_MOBILE && data.RC_TO_MOBILE.mobile_number) {
      mobileNumber = data.RC_TO_MOBILE.mobile_number;
      vehicleNumber = data.RC_TO_MOBILE.vehicle_number;
    } else if (data.data && data.data.mobile_number) {
      // पुराना स्ट्रक्चर (अगर हो)
      mobileNumber = data.data.mobile_number;
      vehicleNumber = data.data.vehicle_number;
    }

    // अगर मोबाइल नंबर नहीं मिला
    if (!mobileNumber) {
      return response.status(404).json({ 
        status: "error",
        message: "Data not found for this vehicle",
        contact: "@Endexed"
      });
    }

    const responseTimeMs = Date.now() - startTime;

    // ✅ Success Response (सिर्फ ज़रूरी डेटा)
    const finalJson = {
      status: "success",
      developer: "@Endexed",
      vehicle_number: vehicleNumber,
      mobile_number: mobileNumber,
      response_time: responseTimeMs + "ms",
      key_expires_on: new Date(keyInfo.expires).toISOString().split("T")[0],
      contact: "@Endexed"
    };

    return response.status(200).json(finalJson);

  } catch (error) {
    return response.status(500).json({ 
      status: "error",
      message: "System Error: " + error.message,
      contact: "@Endexed"
    });
  }
      }
