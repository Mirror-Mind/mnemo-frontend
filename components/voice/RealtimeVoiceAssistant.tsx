"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconLoader,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";

// Speech Recognition TypeScript declarations
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Real-time API event types
interface RealtimeEvent {
  type: string;
  [key: string]: any;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface RealtimeVoiceAssistantProps {
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
}

export function RealtimeVoiceAssistant({ 
  onConnectionChange, 
  className = "" 
}: RealtimeVoiceAssistantProps) {
  // Connection states
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Conversation state
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Fallback text input
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Audio processing
  const setupAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000
        } 
      });
      
      streamRef.current = stream;
      
      // Create AudioContext for real-time processing
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      // Set up MediaRecorder for audio capture
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 64000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Handle audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert to base64 and send to OpenAI
          const reader = new FileReader();
          reader.onload = () => {
            const base64Audio = (reader.result as string).split(',')[1];
            wsRef.current?.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };
      
      return true;
    } catch (error) {
      console.error('Error setting up audio:', error);
      setError('Microphone access denied. Please enable microphone access.');
      setShowTextFallback(true);
      return false;
    }
  }, []);

  // Handle audio processing (for now, we'll simulate this with the existing agent API)
  const handleVoiceInput = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    // Add user message to conversation
    const userMessage = {
      role: 'user' as const,
      content: transcript,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);

    try {
      // Send to our existing agent API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: transcript }],
          voice: true,
          isVoiceMode: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent API error: ${response.status} ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body from agent API');
      }

      let assistantResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantResponse += chunk;
      }

      if (assistantResponse.trim()) {
        // Add assistant message to conversation
        const assistantMessage = {
          role: 'assistant' as const,
          content: assistantResponse,
          timestamp: new Date()
        };

        setConversation(prev => [...prev, assistantMessage]);

        // Use text-to-speech for the response
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(assistantResponse);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          speechSynthesis.speak(utterance);
          setIsSpeaking(true);
          
          utterance.onend = () => setIsSpeaking(false);
        }
      }

    } catch (error: any) {
      console.error('Error processing voice input:', error);
      
      const errorMessage = {
        role: 'assistant' as const,
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, errorMessage]);
      setError(`Processing error: ${error.message}`);
    }
  }, []);

  // Setup browser speech recognition
  const setupSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(interimTranscript);

      if (finalTranscript) {
        handleVoiceInput(finalTranscript);
        setCurrentTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      setError(`Speech recognition error: ${event.error}`);
      setShowTextFallback(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
      // Auto-restart if still connected
      if (isConnected && !error) {
        setTimeout(() => {
          if (isConnected) {
            try {
              recognition.start();
            } catch (err) {
              console.error('Error restarting speech recognition:', err);
            }
          }
        }, 100);
      }
    };

    return recognition;
  }, [isConnected, error, handleVoiceInput]);

  // Connect to voice assistant (using browser speech recognition + existing agent API)
  const connectToRealtime = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Setup audio first
      const audioSetup = await setupAudioContext();
      if (!audioSetup) {
        setIsConnecting(false);
        return;
      }
      
      // Setup speech recognition
      const recognition = setupSpeechRecognition();
      if (!recognition) {
        setError('Speech recognition not supported in this browser');
        setIsConnecting(false);
        setShowTextFallback(true);
        return;
      }

      // Store recognition reference
      wsRef.current = recognition; // We'll reuse wsRef for the recognition object
      
      // Set connected state
      setIsConnected(true);
      setIsConnecting(false);
      onConnectionChange?.(true);
      
      // Add welcome message
      setConversation([{
        role: 'assistant',
        content: 'Hello! I\'m Mnemo, your AI Executive Assistant. I\'m ready to help with your executive needs. You can speak naturally and I\'ll respond with voice.',
        timestamp: new Date()
      }]);
      
      // Speak welcome message
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Hello! I\'m Mnemo, your AI Executive Assistant. I\'m ready to help with your executive needs.');
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
      }
      
      // Start speech recognition
      startRecording();
      
    } catch (error: any) {
      console.error('Error connecting to voice assistant:', error);
      setError(error.message || 'Failed to connect to voice assistant');
      setIsConnecting(false);
      setShowTextFallback(true);
    }
  }, [setupAudioContext, setupSpeechRecognition, onConnectionChange]);

  // Handle real-time events from OpenAI
  const handleRealtimeEvent = useCallback((event: RealtimeEvent) => {
    console.log('Received event:', event.type);
    
    switch (event.type) {
      case 'session.created':
        console.log('Session created successfully');
        break;
        
      case 'input_audio_buffer.speech_started':
        setIsRecording(true);
        setCurrentTranscript('');
        break;
        
      case 'input_audio_buffer.speech_stopped':
        setIsRecording(false);
        // Commit the audio buffer
        wsRef.current?.send(JSON.stringify({
          type: 'input_audio_buffer.commit'
        }));
        // Request response
        wsRef.current?.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['text', 'audio']
          }
        }));
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        const userTranscript = event.transcript || '';
        setCurrentTranscript(userTranscript);
        
        // Add user message to conversation
        if (userTranscript) {
          setConversation(prev => [...prev, {
            role: 'user',
            content: userTranscript,
            timestamp: new Date()
          }]);
        }
        break;
        
      case 'response.audio.delta':
        // Handle audio output chunks
        if (event.delta && audioContextRef.current) {
          playAudioChunk(event.delta);
        }
        break;
        
      case 'response.audio_transcript.delta':
        // Update current assistant response
        const delta = event.delta || '';
        setConversation(prev => {
          const newConv = [...prev];
          const lastMessage = newConv[newConv.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content += delta;
          } else {
            newConv.push({
              role: 'assistant',
              content: delta,
              timestamp: new Date()
            });
          }
          
          return newConv;
        });
        break;
        
      case 'response.audio.done':
        setIsSpeaking(false);
        break;
        
      case 'response.audio_transcript.done':
        console.log('Audio transcript completed');
        break;
        
      case 'error':
        console.error('Real-time API error:', event);
        setError(`Voice assistant error: ${event.error?.message || 'Unknown error'}`);
        break;
        
      default:
        // Log other events for debugging
        console.log('Unhandled event:', event.type);
    }
  }, []);

  // Play audio chunk
  const playAudioChunk = useCallback((base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    try {
      // Decode base64 audio
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Convert to AudioBuffer and play
      audioContextRef.current.decodeAudioData(bytes.buffer).then(audioBuffer => {
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current!.destination);
        source.start();
        setIsSpeaking(true);
      }).catch(error => {
        console.error('Error playing audio:', error);
      });
    } catch (error) {
      console.error('Error decoding audio:', error);
    }
  }, []);

  // Cleanup audio resources
  const cleanupAudio = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    if (wsRef.current && typeof (wsRef.current as any).start === 'function') {
      try {
        (wsRef.current as any).start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Failed to start speech recognition');
        setShowTextFallback(true);
      }
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (wsRef.current && typeof (wsRef.current as any).stop === 'function') {
      (wsRef.current as any).stop();
      setIsRecording(false);
    }
  }, []);

  // Disconnect from voice assistant
  const disconnect = useCallback(() => {
    if (wsRef.current && typeof (wsRef.current as any).stop === 'function') {
      (wsRef.current as any).stop();
    }
    wsRef.current = null;
    
    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    cleanupAudio();
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
    setConversation([]);
    setCurrentTranscript('');
    setError(null);
    setShowTextFallback(false);
    onConnectionChange?.(false);
  }, [cleanupAudio, onConnectionChange]);

  // Handle text input fallback
  const handleTextSubmit = useCallback(async () => {
    if (!textInput.trim()) return;
    
    // Use the same voice input handler for text input
    await handleVoiceInput(textInput);
    setTextInput('');
  }, [textInput, handleVoiceInput]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  }, [handleTextSubmit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Voice Controls */}
      <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-amber-50/50">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
            isRecording 
              ? 'bg-green-100 border-green-400 animate-pulse' 
              : isConnected
                ? 'bg-amber-100 border-amber-400'
                : 'bg-slate-100 border-slate-300'
          }`}>
            <IconMicrophone className={`h-5 w-5 ${
              isRecording ? 'text-green-600' : isConnected ? 'text-amber-600' : 'text-slate-400'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Mnemo Voice Assistant</h3>
            <p className="text-sm text-slate-600">
              {isConnecting 
                ? 'Connecting to voice assistant...'
                : isConnected 
                  ? isRecording
                    ? 'Listening - Speak naturally'
                    : isSpeaking
                      ? 'Mnemo is speaking...'
                      : 'Ready - Start speaking'
                  : 'Click to start voice conversation'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <Button
              onClick={connectToRealtime}
              disabled={isConnecting}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isConnecting ? (
                <IconLoader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <IconMicrophone className="h-4 w-4 mr-2" />
              )}
              {isConnecting ? 'Connecting...' : 'Start Voice Chat'}
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
                  Voice Assistant Ready
                </h3>
                <p className="text-sm max-w-md mx-auto">
                  Connect to start voice conversation with Mnemo. 
                  Speak naturally and get intelligent voice responses from your AI executive assistant.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Voice Visualization */}
            <div className="flex items-center justify-center mb-6">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'border-green-400 bg-green-50 animate-pulse scale-110' 
                  : isSpeaking
                    ? 'border-blue-400 bg-blue-50 animate-pulse scale-105'
                    : 'border-amber-400 bg-amber-50'
              }`}>
                <IconMicrophone className={`h-12 w-12 ${
                  isRecording ? 'text-green-600' : isSpeaking ? 'text-blue-600' : 'text-amber-600'
                }`} />
              </div>
            </div>

            {/* Current Status */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                isRecording 
                  ? 'bg-green-100 text-green-800' 
                  : isSpeaking
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
              }`}>
                {isRecording ? (
                  <>
                    <span className="animate-pulse mr-2">🎤</span>
                    Listening...
                  </>
                ) : isSpeaking ? (
                  <>
                    <span className="animate-bounce mr-2">🔊</span>
                    Mnemo speaking...
                  </>
                ) : (
                  'Ready to listen'
                )}
              </div>
            </div>

            {/* Current Transcript */}
            {currentTranscript && (
              <div className="text-center mb-4">
                <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 max-w-md">
                  <span className="text-sm text-blue-800">"{currentTranscript}"</span>
                </div>
              </div>
            )}

            {/* Conversation Display */}
            <div className="flex-1 space-y-4 max-h-80 overflow-y-auto mb-6">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 border max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-blue-50 border-blue-200 ml-auto'
                      : 'bg-white border-slate-200 mr-auto'
                  }`}
                >
                  <div className="text-sm text-slate-600 mb-1">
                    {message.role === 'user' ? 'You:' : 'Mnemo:'}
                  </div>
                  <div className="text-slate-800">{message.content}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Fallback Text Input */}
            {showTextFallback && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Microphone unavailable - Type your message:
                </h4>
                <div className="flex gap-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="flex-1 bg-white border border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}

            {/* Voice Features */}
            <div className="mt-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-emerald-800">Voice Recognition</span>
                  </div>
                  <p className="text-emerald-700 text-xs mt-1">Browser-based speech-to-text</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-emerald-800">AI Voice Response</span>
                  </div>
                  <p className="text-emerald-700 text-xs mt-1">Natural text-to-speech output</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}