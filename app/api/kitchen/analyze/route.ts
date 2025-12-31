import { NextResponse } from "next/server"
import { VertexAI } from "@google-cloud/vertexai"
import { globalStore } from "@/lib/store"

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1"

export async function GET() {
  if (!PROJECT_ID) {
    console.error("Kitchen Analysis Error: GOOGLE_CLOUD_PROJECT is not set in .env")
    return NextResponse.json({ 
      alerts: [
        { type: "efficiency", message: "⚠️ Vertex AI not configured. Add GOOGLE_CLOUD_PROJECT to .env" }
      ],
      error: "Configuration Missing"
    })
  }

  console.log("Kitchen Analysis: Starting analysis...")
  try {
    const orders = globalStore.getOrders().filter(o => o.status === "pending")
    console.log(`Kitchen Analysis: Found ${orders.length} pending orders to analyze`)
    
    if (orders.length === 0) {
      console.log("Kitchen Analysis: No pending orders, skipping Gemini call")
      return NextResponse.json({ alerts: [] })
    }

    // Initialize Vertex AI
    console.log(`Kitchen Analysis: Using project ${PROJECT_ID} in ${LOCATION}`)
    const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION })
    const generativeModel = vertex_ai.getGenerativeModel({
      model: "gemini-2.0-flash", // Fixed to 2.0 flash
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4, // Slightly higher for more natural speech
      },
    })
    
    const prompt = `
      You are the Head Chef of "24/7 Humanless DriveThru", and you are in the middle of the most stressful dinner rush of your life. 
      You are authoritative, ruthless, and demand absolute perfection. Think Gordon Ramsay at his most intense.
      
      Analyze the pending orders and provide a natural, concise kitchen briefing.
      
      <Orders>
      ${JSON.stringify(orders, null, 2)}
      <Orders/>
      
      STRICT RULES:
      1. **Format**: Return a JSON array of objects with "type" (bulk-prep, supervisor, efficiency) and "message".
      2. **Voice**: The "message" should be written for a human to speak. 
         - Use aggressive, high-energy language. 
         - "MOVE IT!", "NOW!", "WAKE UP!", "DISASTER!"
         - Instead of "GRILL: 2 Burgers", say "LISTEN UP! I need two burgers on the grill NOW! Don't let them burn!"
      3. **Conciseness**: Keep each message under 15 words.
      4. **Variety**: Don't repeat the exact same phrasing every time.
      
      Example Output:
      [
        { "type": "bulk-prep", "message": "GRILL STATION! Four patties down NOW! We are backing up! MOVE IT!" },
        { "type": "efficiency", "message": "EXPO! Clear those shakes! It's a disaster out here! WAKE UP!" }
      ]
    `

    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }

    console.log("Kitchen Analysis: Sending prompt to Gemini...")
    const response = await generativeModel.generateContent(request)
    
    let responseText = response.response.candidates?.[0].content.parts?.[0].text || "[]"
    console.log("Kitchen Analysis: Received response from Gemini:", responseText)
    
    // Clean up potential markdown code blocks from the response
    responseText = responseText.replace(/```json\n?|```/g, "").trim()
    
    try {
      const result = JSON.parse(responseText)
      console.log(`Kitchen Analysis: Successfully parsed ${result.length} alerts`)
      return NextResponse.json({ alerts: Array.isArray(result) ? result : [] })
    } catch (parseError) {
      console.error("Kitchen Analysis: Failed to parse Gemini response:", responseText)
      return NextResponse.json({ alerts: [] })
    }
  } catch (error: any) {
    console.error("Kitchen Analysis: Error analyzing kitchen queue with Vertex AI:", error)
    
    // Fallback alerts if Vertex AI is not configured or fails
    // This ensures the UI still shows something useful during the demo
    const fallbackAlerts = [
      { type: "efficiency", message: `⚠️ AI Offline: ${error.message || "Check Cloud Console"}` },
      { type: "bulk-prep", message: "🚀 High demand expected. Prep extra fries." }
    ]
    
    return NextResponse.json({ 
      alerts: fallbackAlerts,
      error: "Vertex AI Analysis Failed", 
      message: error.message || "Internal server error" 
    })
  }
}
