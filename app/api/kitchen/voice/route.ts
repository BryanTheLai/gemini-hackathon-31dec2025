import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { text } = await req.json()
  const apiKey = process.env.ELEVENLABS_API_KEY
  // Default to "George" (JBFqnCBsd6RMkjVDRZzb) if no voice ID is provided
  const voiceId = process.env.KITCHEN_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb" 

  if (!apiKey) {
    console.error("Kitchen Voice: ELEVENLABS_API_KEY is missing")
    return NextResponse.json({ error: "ElevenLabs API Key missing" }, { status: 500 })
  }

  try {
    console.log(`Kitchen Voice: Generating audio for text using voice: ${voiceId}`)
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.3,
            similarity_boost: 0.9,
            style: 0.8,
            use_speaker_boost: true
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Kitchen Voice: ElevenLabs API Error:", errorText)
      return NextResponse.json({ 
        error: "ElevenLabs API error", 
        details: errorText 
      }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    })
  } catch (error) {
    console.error("Kitchen Voice: Internal Error:", error)
    return NextResponse.json({ error: "Failed to generate voice" }, { status: 500 })
  }
}
