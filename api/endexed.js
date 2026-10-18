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

  // 🔑 Valid Key: Endexed
  // 📅 Expiry: 6 November 2026
  const VALID_KEYS = {
    "Endexed": { expires: 1830902400000 }
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

  // 🚗 Vehicle RC format check
  if (!/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(term.toUpperCase())) {
    return response.status(400).json({ 
      status: "error",
      message: "Provide valid RC number (e.g. WB74BG4539)",
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
        message: "Data not found",
        contact: "@Endexed"
      });
    }

    let data = await apiResponse.json();

    // ❌ अगर असली API में कोई error है
    if (data.status === "error" || !data.data) {
      return response.status(404).json({ 
        status: "error",
        message: "Data not found",
        contact: "@Endexed"
      });
    }

    const responseTimeMs = Date.now() - startTime;

    // ✅ Success Response (नाम @jobdiya)
    const finalJson = {
      status: "success",
      developer: "@jobdiya",
      vehicle_number: data.data.vehicle_number,
      mobile_number: data.data.mobile_number,
      response_time: responseTimeMs + "ms",
      key_expires_on: new Date(keyInfo.expires).toISOString().split("T")[0],
      contact: "@Endexed"
    };

    return response.status(200).json(finalJson);

  } catch (error) {
    return response.status(500).json({ 
      status: "error",
      message: "Data not found",
      contact: "@Endexed"
    });
  }
    }
