"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useConversation } from '@elevenlabs/react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconLoader,
  IconAlertCircle,
  IconSettings,
  IconVolume,
  IconVolumeOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconWifi,
  IconWifiOff,
} from "@tabler/icons-react";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ElevenLabsVoiceAssistantProps {
  className?: string;
  agentId: string;
  useSignedUrl?: boolean;
  onConnectionChange?: (connected: boolean) => void;
}

export function ElevenLabsVoiceAssistant({ 
  className = "",
  agentId,
  useSignedUrl = false,
  onConnectionChange
}: ElevenLabsVoiceAssistantProps) {
  // Local state
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use the official ElevenLabs React hook
  const conversationHook = useConversation({
    onConnect: () => {
      console.log('ElevenLabs Connected');
      setError(null);
      onConnectionChange?.(true);
    },
    onDisconnect: () => {
      console.log('ElevenLabs Disconnected');
      onConnectionChange?.(false);
    },
    onMessage: (message) => {
      console.log('ElevenLabs Message:', message);
      // Handle messages in a type-safe way
      try {
        const msg = message as any;
        if (msg && typeof msg === 'object') {
          // Try to extract content and role from various possible message structures
          let content = '';
          let role: 'user' | 'assistant' = 'assistant';
          
          if (msg.message) {
            content = msg.message;
            role = msg.source === 'user' ? 'user' : 'assistant';
          } else if (msg.content) {
            content = msg.content;
            role = msg.role || 'assistant';
          }
          
          if (content) {
            const conversationMessage = {
              role,
              content,
              timestamp: Date.now()
            };
            setConversation(prev => [...prev, conversationMessage]);
          }
        }
      } catch (err) {
        console.warn('Could not parse message:', err);
      }
    },
    onError: (error) => {
      console.error('ElevenLabs Error:', error);
      setError(typeof error === 'string' ? error : (error as any)?.message || 'Connection error occurred');
    },
  });

  // Get signed URL for private agents
  const getSignedUrl = useCallback(async () => {
    try {
      const response = await fetch('/api/get-signed-url');
      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.status}`);
      }
      const data = await response.json();
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }, []);

  // Connect to ElevenLabs
  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (useSignedUrl) {
        // For private agents, use signed URL
        const signedUrl = await getSignedUrl();
        await conversationHook.startSession({ signedUrl });
      } else {
        // For public agents, use agentId directly
        await conversationHook.startSession({ agentId });
      }
      
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(error.message || 'Failed to connect to ElevenLabs');
    } finally {
      setIsLoading(false);
    }
  }, [agentId, useSignedUrl, getSignedUrl, conversationHook]);

  // Disconnect from ElevenLabs
  const disconnect = useCallback(async () => {
    await conversationHook.endSession();
    setConversation([]);
    setError(null);
  }, [conversationHook]);

  // Derived state from the hook
  const isConnected = conversationHook.status === 'connected';
  const isConnecting = conversationHook.status === 'connecting' || isLoading;
  const isSpeaking = conversationHook.isSpeaking;

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Connection Controls */}
      <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-amber-50/50">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
            isSpeaking
              ? 'bg-blue-100 border-blue-400 animate-pulse'
              : isConnected
                ? 'bg-green-100 border-green-400'
                : 'bg-slate-100 border-slate-300'
          }`}>
            {isSpeaking ? (
              <IconVolume className="h-5 w-5 text-blue-600" />
            ) : isConnected ? (
              <IconMicrophone className="h-5 w-5 text-green-600" />
            ) : (
              <IconMicrophoneOff className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              ElevenLabs Conversational AI
              {isConnected ? (
                <IconWifi className="h-4 w-4 text-green-600" />
              ) : (
                <IconWifiOff className="h-4 w-4 text-red-600" />
              )}
            </h3>
            <p className="text-sm text-slate-600">
              {isConnecting 
                ? 'Connecting to ElevenLabs...'
                : !isConnected
                  ? 'Click to start conversation'
                  : isSpeaking
                    ? '🔊 Agent speaking...'
                    : '🎤 Listening...'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <IconSettings className="h-4 w-4" />
          </Button>
          
          {!isConnected ? (
            <Button
              onClick={connect}
              disabled={isConnecting}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isConnecting ? (
                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <IconMicrophone className="h-4 w-4 mr-2" />
              )}
              {isConnecting ? 'Connecting...' : 'Start Conversation'}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={disconnect}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Disconnect
            </Button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-amber-200 bg-amber-50/30">
          <div className="space-y-4">
            <h4 className="font-medium text-slate-800">Conversation Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Agent ID
                </label>
                <div className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-300">
                  {agentId}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Authentication Mode
                </label>
                <div className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-300">
                  {useSignedUrl ? 'Private Agent (Signed URL)' : 'Public Agent (Direct)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Interface */}
      <div className="flex-1 p-4">
        {!isConnected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-500 space-y-3">
              <IconMicrophone className="h-16 w-16 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-slate-700">
                  ElevenLabs Conversational AI
                </h3>
                <p className="text-sm max-w-md mx-auto">
                  Real-time voice conversation with AI agents using ElevenLabs' 
                  official React package. Experience natural, human-like conversations 
                  with low latency and high-quality audio.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Status Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                isSpeaking
                  ? 'border-blue-400 bg-blue-50 animate-pulse scale-110'
                  : 'border-green-400 bg-green-50'
              }`}>
                {isSpeaking ? (
                  <IconVolume className="h-12 w-12 text-blue-600" />
                ) : (
                  <IconMicrophone className="h-12 w-12 text-green-600" />
                )}
              </div>
            </div>

            {/* Current Status */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                isSpeaking
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {isSpeaking ? (
                  <>
                    <span className="animate-bounce mr-2">🔊</span>
                    Agent speaking...
                  </>
                ) : (
                  <>
                    <span className="animate-pulse mr-2">🎤</span>
                    Ready for conversation
                  </>
                )}
              </div>
            </div>

            {/* Conversation History */}
            <div className="flex-1 space-y-3 max-h-64 overflow-y-auto mb-6">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 border max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-green-50 border-green-200 ml-auto'
                      : 'bg-blue-50 border-blue-200 mr-auto'
                  }`}
                >
                  <div className="text-xs text-slate-500 mb-1">
                    {message.role === 'user' ? 'You' : 'Agent'} • {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-slate-800">{message.content}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="mt-auto">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <IconWifi className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-800">ElevenLabs Conversational AI</span>
                </div>
                <p className="text-emerald-700 text-sm">
                  Powered by the official @elevenlabs/react package for reliable, 
                  real-time voice conversations with intelligent turn-taking.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 