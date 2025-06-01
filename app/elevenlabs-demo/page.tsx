import { Conversation } from '@/components/conversation';
import { ConversationEnhanced } from '@/components/conversation-enhanced';

export default function ElevenLabsDemo() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          ElevenLabs Conversational AI Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Implementation</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Simple conversation component using direct agent ID (public agents)
            </p>
            <Conversation />
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Enhanced Implementation</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Enhanced component with better UI and support for both public and private agents
            </p>
            <ConversationEnhanced useSignedUrl={false} />
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Private Agent with Authentication</h2>
          <p className="text-gray-600 mb-4 text-sm">
            For private agents that require signed URL authentication
          </p>
          <ConversationEnhanced useSignedUrl={true} />
        </div>
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Setup Instructions:</h3>
          <div className="text-blue-800 text-sm space-y-2">
            <p>1. Create an ElevenLabs account and get your API key</p>
            <p>2. Create a conversational AI agent in your ElevenLabs dashboard</p>
            <p>3. Add these environment variables to your .env.local file:</p>
            <div className="bg-blue-100 p-3 rounded mt-2 font-mono text-xs">
              <div>ELEVENLABS_API_KEY=your-api-key-here</div>
              <div>NEXT_PUBLIC_AGENT_ID=your-agent-id-here</div>
            </div>
            <p>4. For private agents, use the signed URL authentication option</p>
            <p>5. Make sure your browser allows microphone access</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Implementation based on{' '}
            <a 
              href="https://elevenlabs.io/docs/conversational-ai/guides/quickstarts/next-js" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              ElevenLabs Next.js Documentation
            </a>
          </p>
        </div>
      </div>
    </main>
  );
} 