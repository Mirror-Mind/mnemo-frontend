import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || ""
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const { text, voice_id = "JBFqnCBsd6RMkjVDRZzb", model_id = "eleven_multilingual_v2" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    console.log("[ELEVENLABS] Generating speech for text:", text.substring(0, 100) + "...");

    // Create streaming audio using the correct method
    const audioStream = await elevenlabs.textToSpeech.stream(voice_id, {
      text: text,
      modelId: model_id,
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true
      }
    });

    // Create a readable stream for the response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of audioStream) {
            if (chunk instanceof Uint8Array) {
              controller.enqueue(chunk);
            }
          }
          controller.close();
        } catch (error) {
          console.error("[ELEVENLABS] Streaming error:", error);
          controller.error(error);
        }
      }
    });

    // Return streaming response
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("[ELEVENLABS] TTS Error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch available voices
export async function GET() {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    console.log("[ELEVENLABS] Fetching available voices...");
    const voices = await elevenlabs.voices.getAll();
    
    return NextResponse.json({
      voices: voices.voices.map(voice => ({
        voiceId: voice.voiceId,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        previewUrl: voice.previewUrl
      }))
    });

  } catch (error) {
    console.error("[ELEVENLABS] Error fetching voices:", error);
    return NextResponse.json(
      { error: "Failed to fetch voices" },
      { status: 500 }
    );
  }
} 