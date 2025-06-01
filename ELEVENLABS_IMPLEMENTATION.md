# ElevenLabs Conversational AI Implementation

This implementation follows the official [ElevenLabs Next.js documentation](https://elevenlabs.io/docs/conversational-ai/guides/quickstarts/next-js) for building voice conversations with AI agents.

## Features

- ✅ Real-time voice conversation with AI agents
- ✅ Microphone input and audio output
- ✅ Support for both public and private agents
- ✅ Signed URL authentication for private agents
- ✅ Modern React hooks with `@elevenlabs/react`
- ✅ Clean, responsive UI with Tailwind CSS

## Files Created

1. **`components/conversation.tsx`** - Basic implementation using direct agent ID
2. **`components/conversation-enhanced.tsx`** - Enhanced version with better UI and authentication options
3. **`app/api/get-signed-url/route.ts`** - API endpoint for signed URL authentication
4. **`app/elevenlabs-demo/page.tsx`** - Demo page showcasing all implementations

## Setup Instructions

### 1. Install Dependencies

The required dependency `@elevenlabs/react` has been installed:

```bash
npm install @elevenlabs/react
```

### 2. Get ElevenLabs Credentials

1. Create an account at [ElevenLabs](https://elevenlabs.io)
2. Get your API key from [Settings > API Keys](https://elevenlabs.io/app/settings/api-keys)
3. Create a conversational AI agent at [Conversational AI](https://elevenlabs.io/app/conversational-ai)
4. Copy your agent ID from the agent settings

### 3. Environment Variables

Add these to your `.env.local` file:

```env
# ElevenLabs API Key (keep this secret - server-side only)
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here

# Agent ID (public - can be exposed to client)
NEXT_PUBLIC_AGENT_ID=your-agent-id-here
```

### 4. Usage

#### Basic Implementation (Public Agents)

```tsx
import { Conversation } from '@/components/conversation';

export default function MyPage() {
  return <Conversation />;
}
```

#### Enhanced Implementation

```tsx
import { ConversationEnhanced } from '@/components/conversation-enhanced';

export default function MyPage() {
  return (
    <div>
      {/* For public agents */}
      <ConversationEnhanced useSignedUrl={false} />
      
      {/* For private agents with authentication */}
      <ConversationEnhanced useSignedUrl={true} />
    </div>
  );
}
```

### 5. Demo Page

Visit `/elevenlabs-demo` to see all implementations in action with setup instructions.

## How It Works

### Public Agents
- Uses agent ID directly in the client
- No authentication required
- Simpler setup

### Private Agents
- Requires signed URL authentication
- API key stays secure on the server
- More secure for production use

### Key Features

1. **Microphone Access**: Automatically requests microphone permissions
2. **Real-time Audio**: Streams audio to/from ElevenLabs in real-time
3. **Connection Management**: Handles WebSocket connections automatically
4. **Error Handling**: Graceful error handling and user feedback
5. **Status Indicators**: Visual feedback for connection and speaking states

## Browser Requirements

- Modern browser with WebRTC support
- Microphone access permissions
- HTTPS (required for microphone access in production)

## Implementation Details

This implementation uses the `useConversation` hook from `@elevenlabs/react` which provides:

- Automatic WebSocket connection management
- Audio input/output handling
- Connection status tracking
- Speaking state detection
- Error handling

The enhanced version adds:

- Better UI/UX with Tailwind CSS
- Loading states
- Support for both public and private agents
- Comprehensive error handling

## Comparison with Custom Implementation

Your existing `ElevenLabsVoiceAssistant.tsx` is a custom WebSocket implementation that provides more granular control. This new implementation using `@elevenlabs/react` is:

- **Simpler**: Less code, easier to maintain
- **Official**: Uses ElevenLabs' official React package
- **Robust**: Built-in error handling and connection management
- **Modern**: Follows React best practices

Choose based on your needs:
- Use the new implementation for most use cases
- Keep the custom implementation if you need specific WebSocket control

## Next Steps

1. Set up your environment variables
2. Test with the demo page at `/elevenlabs-demo`
3. Integrate the components into your application
4. Customize the UI to match your design system

## References

- [ElevenLabs Next.js Documentation](https://elevenlabs.io/docs/conversational-ai/guides/quickstarts/next-js)
- [ElevenLabs React Package](https://www.npmjs.com/package/@elevenlabs/react)
- [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai) 