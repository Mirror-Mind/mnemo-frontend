# ElevenLabs Voice Integration Setup

## Overview
Your Mnemo dashboard now includes high-quality text-to-speech powered by ElevenLabs. This provides natural, human-like voice responses for your AI executive assistant.

## Setup Instructions

### 1. Get ElevenLabs API Key
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Navigate to your profile settings
3. Copy your API key

### 2. Configure Environment Variable
Add the following to your `.env` file:
```bash
ELEVENLABS_API_KEY="your-elevenlabs-api-key-here"
```

### 3. Features Available

#### Voice Assistant Options
- **Browser TTS**: Uses your browser's built-in text-to-speech (free)
- **ElevenLabs HD**: High-quality, natural voice synthesis (requires API key)

#### ElevenLabs Features
- **Streaming Audio**: Real-time audio generation for low latency
- **Multiple Voices**: Choose from professional male and female voices
- **High Quality**: Natural, human-like speech synthesis
- **Voice Settings**: Adjustable stability, similarity boost, and style

### 4. Usage

1. Navigate to Dashboard → Chat tab
2. Click the toggle to switch between "Browser TTS" and "ElevenLabs HD"
3. Click "Start Voice Chat" to begin conversation
4. Use the settings icon to select different ElevenLabs voices

### 5. Fallback Behavior

If ElevenLabs API is unavailable or not configured:
- System falls back to browser's text-to-speech
- All functionality remains available
- No disruption to voice conversations

### 6. API Costs

ElevenLabs offers:
- Free tier with limited characters per month
- Paid plans for higher usage
- Check [ElevenLabs Pricing](https://elevenlabs.io/pricing) for current rates

## Technical Implementation

### API Endpoint
- **POST** `/api/elevenlabs/stream`: Generate streaming audio
- **GET** `/api/elevenlabs/stream`: Get available voices

### Voice Models Used
- **Default Model**: `eleven_multilingual_v2`
- **Default Voice**: Professional voice suitable for executive assistant

### Audio Processing
- Streaming audio chunks for low latency
- Web Audio API for playback
- Automatic fallback to browser TTS if needed

## Troubleshooting

### Common Issues
1. **No audio**: Check API key configuration
2. **Poor quality**: Verify internet connection
3. **Latency**: ElevenLabs streaming minimizes delay

### Logs
Check browser console and server logs for detailed error information. 