'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';

interface ConversationEnhancedProps {
  useSignedUrl?: boolean;
}

export function ConversationEnhanced({ useSignedUrl = false }: ConversationEnhancedProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const getSignedUrl = async (): Promise<string> => {
    const response = await fetch("/api/get-signed-url");
    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.statusText}`);
    }
    const { signedUrl } = await response.json();
    return signedUrl;
  };

  const startConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (useSignedUrl) {
        // For private agents, use signed URL
        const signedUrl = await getSignedUrl();
        
        await conversation.startSession({
          signedUrl,
        });
      } else {
        // For public agents, use agentId directly
        await conversation.startSession({
          agentId: process.env.NEXT_PUBLIC_AGENT_ID || 'YOUR_AGENT_ID',
        });
      }

    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, useSignedUrl]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">ElevenLabs Conversational AI</h2>
        <p className="text-gray-600">
          {useSignedUrl ? 'Private Agent with Authentication' : 'Public Agent'}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected' || isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Starting...' : 'Start Conversation'}
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Stop Conversation
        </button>
      </div>

      <div className="text-center space-y-2">
        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          conversation.status === 'connected' 
            ? 'bg-green-100 text-green-800' 
            : conversation.status === 'connecting'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          Status: {conversation.status}
        </div>
        
        {conversation.status === 'connected' && (
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            conversation.isSpeaking 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            Agent is {conversation.isSpeaking ? 'speaking' : 'listening'}
          </div>
        )}
      </div>

      {conversation.status === 'connected' && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 max-w-md text-center">
          <p className="text-blue-800 text-sm">
            🎙️ Microphone is active. Start speaking to have a conversation with the AI agent.
          </p>
        </div>
      )}
    </div>
  );
} 