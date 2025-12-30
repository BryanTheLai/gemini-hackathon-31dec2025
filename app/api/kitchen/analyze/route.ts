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

  try {
    const orders = globalStore.getOrders().filter(o => o.status === "pending")
    
    if (orders.length === 0) {
      return NextResponse.json({ alerts: [] })
    }

    // Initialize Vertex AI
    const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION })
    const generativeModel = vertex_ai.getGenerativeModel({
      model: "gemini-2.5-flash", // Updated to gemini-2.5-flash as requested
      generationConfig: {
        responseMimeType: "application/json",
      },
    })
    
    const prompt = `
      You are the Head Chef AI for "Gemini Burgers".
      Analyze these orders and give 3-4 IMMEDIATE, short instructions for the kitchen staff.
      
      Orders:
      ${JSON.stringify(orders, null, 2)}
      
      STRICT RULES:
      1. **Format**: "ACTION [Quantity] [Item] [Reason/Priority]"
      2. **Length**: Max 6-8 words per instruction.
      3. **Priority**: 
         - Start with "🔥 GRILL:" for burgers.
         - Start with "🍟 FRY:" for sides.
         - Start with "🥤 SHAKE:" for drinks.
         - Start with "🚨 EXPEDITE:" for supervisor/volume issues.
      4. **Examples**: 
         - "🔥 GRILL: 8 patties now. 4 orders waiting."
         - "🍟 FRY: 3 Asteroid Fries. High demand."
         - "🚨 EXPEDITE: 6 pending. Need help at Expo."
      
      Return a JSON array of objects with "type" (bulk-prep, supervisor, efficiency) and "message".
      No fluff. Just orders.
    `

    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }

    const response = await generativeModel.generateContent(request)
    let responseText = response.response.candidates?.[0].content.parts?.[0].text || "[]"
    
    // Clean up potential markdown code blocks from the response
    responseText = responseText.replace(/```json\n?|```/g, "").trim()
    
    try {
      const result = JSON.parse(responseText)
      return NextResponse.json({ alerts: Array.isArray(result) ? result : [] })
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText)
      return NextResponse.json({ alerts: [] })
    }
  } catch (error: any) {
    console.error("Error analyzing kitchen queue with Vertex AI:", error)
    
    // Fallback alerts if Vertex AI is not configured or fails
    // This ensures the UI still shows something useful during the demo
    const fallbackAlerts = [
      { type: "efficiency", message: "💡 Tip: Keep the grill hot for incoming burger orders." },
      { type: "bulk-prep", message: "🚀 High demand expected. Prep extra fries." }
    ]
    
    return NextResponse.json({ 
      alerts: fallbackAlerts,
      error: "Vertex AI Analysis Failed", 
      message: error.message || "Internal server error" 
    })
  }
}
