import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Auth: Requesting signed URL for ElevenLabs...")
    const apiKey = process.env.ELEVENLABS_API_KEY
    const agentId = process.env.NEXT_PUBLIC_AGENT_ID || "JtZl84g28a524jJ795dJ"

    if (!apiKey) {
      console.error("Auth: ELEVENLABS_API_KEY is missing in environment. Available env vars:", Object.keys(process.env))
      return NextResponse.json({ 
        error: "ELEVENLABS_API_KEY is not set",
        details: "Check apphosting.yaml and Secret Manager permissions"
      }, { status: 500 })
    }

    console.log(`Auth: Using Agent ID: ${agentId}`)

    // Request a signed URL for the conversation
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Auth: ElevenLabs API Error:", errorText)
      return NextResponse.json({ error: "Failed to get signed URL from ElevenLabs" }, { status: response.status })
    }

    const data = await response.json()
    console.log("Auth: Successfully retrieved signed URL")
    return NextResponse.json({ signedUrl: data.signed_url })
  } catch (error) {
    console.error("Auth: Error getting conversation token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
