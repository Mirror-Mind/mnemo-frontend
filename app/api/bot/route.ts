import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { HumanMessage } from "@langchain/core/messages";
import { getNormalAgentResponse, parseWhatsAppResponse } from "@/lib/agents/agentUtils";
import prisma from "@/lib/prisma";

// Configure maximum duration for long-running AI processing
export const maxDuration = 300; // 5 minutes - adjust based on your needs

// Environment variables for Meta WhatsApp Business API
const META_APP_SECRET = process.env.META_APP_SECRET; // App Secret from your Meta Developer App
const WHATSAPP_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN; // Custom verification token you set in Meta Dashboard
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID; // Your WhatsApp Business Account phone number ID
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN; // Permanent access token for your Meta App

/**
 * Handle incoming GET requests for webhook verification
 * This is required by Meta to verify your webhook URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get verification parameters sent by Meta
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");
    
    // Verify the webhook
    if (mode === "subscribe" && token === WHATSAPP_TOKEN) {
      console.log("Webhook verified successfully");
      return new Response(challenge, { status: 200 });
    } else {
      // Verification failed
      console.error("Webhook verification failed");
      return new Response("Verification failed", { status: 403 });
    }
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return new Response("Server error", { status: 500 });
  }
}

/**
 * Handle incoming POST requests with WhatsApp messages or events
 */
export async function POST(request: NextRequest) {
  try {
    const requestClone = request.clone();
    
    // Validate the request is coming from Meta
    const isValid = await validateMetaRequest(request);
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.error("Invalid signature from Meta");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    
    // Parse the request body
    const body = await requestClone.json();
    console.log("Received WhatsApp webhook:");
    
    // Return a 200 OK response immediately to acknowledge receipt of the event
    const response = NextResponse.json({ status: "ok" }, { status: 200 });
    
    // Process the message asynchronously
    if (
      body.object === "whatsapp_business_account" &&
      body.entry &&
      body.entry.length > 0 &&
      body.entry[0].changes &&
      body.entry[0].changes.length > 0 &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages.length > 0 &&
      body.entry[0].changes[0].field === "messages"
    ) {
      // Process message in background with proper error handling and timeout management
      const message = body.entry[0].changes[0].value.messages[0];
      
      // Use waitUntil-compatible approach for production environments
      const backgroundTask = (async () => {
        const startTime = Date.now();
        console.log(`[WhatsApp Bot] Starting background processing for message from ${message.from}`);
        
        try {
          await sendMessageReaction(message.from, message.id, "🤔");
          console.log(`[WhatsApp Bot] Reaction sent, starting AI processing...`);
          
          // Add timeout wrapper for AI processing
          const processWithTimeout = Promise.race([
            processWhatsAppMessage(body),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Processing timeout after 4 minutes')), 4 * 60 * 1000)
            )
          ]);
          
          await processWithTimeout;
          console.log(`[WhatsApp Bot] Processing completed in ${Date.now() - startTime}ms`);
        } catch (error) {
          console.error(`[WhatsApp Bot] Background processing error after ${Date.now() - startTime}ms:`, error);
          
          // Send error reaction if processing fails
          try {
            await sendMessageReaction(message.from, message.id, "❌");
          } catch (reactionError) {
            console.error(`[WhatsApp Bot] Failed to send error reaction:`, reactionError);
          }
        }
      })();
      
      // In production environments, ensure the promise is properly tracked
      if ((globalThis as any).waitUntil) {
        (globalThis as any).waitUntil(backgroundTask);
      } else {
        // For environments without waitUntil support, use setImmediate to avoid blocking
        setImmediate(() => {
          backgroundTask.catch(error => {
            console.error("Background task error:", error);
          });
        });
      }
    }
    return response;
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

/**
 * Process WhatsApp message asynchronously
 */
export async function processWhatsAppMessage(body: any): Promise<void> {
  try {
    // Extract message details
    const change = body.entry[0].changes[0];
    const value = change.value;
    const message = value.messages[0];
    
    // Handle different message types
    if (message.type === "text" || message.type === "button" || message.type === "interactive") {
      const from = message.from;
      let messageBody = "";
      let messageId = message.id;
      
      if (message.type === "text") {
        messageBody = message.text.body;
      } else if (message.type === "button") {
        messageBody = message.button.text;
      } else if (message.type === "interactive") {
        if (message.interactive.type === "button_reply") {
          messageBody = message.interactive.button_reply.title;
        } else if (message.interactive.type === "list_reply") {
          messageBody = message.interactive.list_reply.title;
        }
      }
      
      // Send a thinking emoji reaction first
      let response = "I didn't understand that. Type 'help' to see available commands.";
      try {
        let user;
        try {
          const normalizedPhoneNumber = from.startsWith('+') ? from : `+${from}`;
          user = await prisma.user.findFirst({
            where: {
              phoneNumber: normalizedPhoneNumber
            }
          });
          
          if (!user) {
            response = "I couldn't find your account. Please sign up for an account to continue.";
            await sendWhatsAppMessage(from, response, messageId);
            await sendMessageReaction(from, messageId, "❌");
            return;
          }
          
        } catch (error) {
          console.error("Error finding user by phone number:", error);
          response = "I'm having trouble accessing your account information. Please try again later.";
          await sendWhatsAppMessage(from, response, messageId);
          await sendMessageReaction(from, messageId, "❌");
          return;
        }
        
        const userId = user?.id;
        const messages = [
          new HumanMessage(messageBody)
        ];
        
        // Use the WhatsApp-specific agent by passing isWhatsApp=true
        const agentResponse = await getNormalAgentResponse(messages, userId, true);
        
        if (agentResponse && agentResponse.messages && agentResponse.messages.length > 0) {
          const lastMessage = agentResponse.messages[agentResponse.messages.length - 1];
          if (lastMessage.content) {
            response = lastMessage.content.toString();
            // Log the raw response for debugging
            console.log(`Raw WhatsApp agent response`);
          }
        }
        console.log(`Agent response for ${from} is ready to send`);
        const sendResult = await sendWhatsAppMessage(from, response, messageId);
        if (sendResult) {
          console.log(`WhatsApp message sent successfully to ${from}`);
        } else {
          console.error(`Failed to send WhatsApp message to ${from}`);
        }
      } catch (agentError: any) {
        // TODO: Log the error traceback
        console.log(agentError.stack);
        console.error("Error calling agent utility:", agentError);
        await sendMessageReaction(from, messageId, "❌");
        response = "I'm having trouble processing your request. Please try again later.";
        await sendWhatsAppMessage(from, response, messageId);
      }
      // Remove the thinking emoji reaction by sending an empty string
      await sendMessageReaction(from, messageId, "✅");
    }
    // Handle other message types like image, audio, etc. if needed
  } catch (error) {
    console.error("Error processing WhatsApp message asynchronously:", error);
  }
}

/**
 * Validates that the request is coming from Meta
 * Uses the X-Hub-Signature-256 header for validation
 */
async function validateMetaRequest(request: NextRequest): Promise<boolean> { // Keep NextRequest here for now
  if (!META_APP_SECRET) {
    console.warn("META_APP_SECRET not configured, skipping validation");
    return true;
  }
  
  try {
    // Get the signature from the header
    const signature = request.headers.get("X-Hub-Signature-256") || "";
    
    if (!signature) {
      console.warn("No X-Hub-Signature-256 header found");
      return false;
    }
    
    // Get the request body as text
    const body = await request.text();
    
    // Calculate the expected signature
    const expectedSignature = "sha256=" + 
      crypto
        .createHmac("sha256", META_APP_SECRET)
        .update(body)
        .digest("hex");
    
    // Compare the signatures
    return expectedSignature === signature;
  } catch (error) {
    console.error("Error validating Meta request:", error);
    return false;
  }
}

/**
 * Sends a reaction to a WhatsApp message
 */
async function sendMessageReaction(to: string, messageId: string, emoji: string): Promise<any> {
  if (!META_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("WhatsApp API credentials not configured");
    return null;
  }
  
  try {
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    // Prepare the reaction payload
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "reaction",
      reaction: {
        message_id: messageId,
        emoji: emoji
      }
    };
    
    const actionType = emoji === "" ? "Removing" : "Sending";
    console.log(`${actionType} WhatsApp reaction:`, JSON.stringify(payload, null, 2));
    
    // Send the reaction
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${META_ACCESS_TOKEN}`
      }, 
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Error ${emoji === "" ? "removing" : "sending"} WhatsApp reaction:`, data);
      return null;
    }
    
    console.log(`WhatsApp reaction ${emoji === "" ? "removed" : "sent"} successfully:`, data);
    return data;
  } catch (error) {
    console.error(`Error ${emoji === "" ? "removing" : "sending"} WhatsApp reaction:`, error);
    return null;
  }
}

/**
 * Sends a WhatsApp message using Meta Cloud API
 * Optionally sends as a reply to a specific message
 */
async function sendWhatsAppMessage(to: string, message: string, replyToMessageId?: string): Promise<any> {
  if (!META_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("WhatsApp API credentials not configured", {
      hasAccessToken: !!META_ACCESS_TOKEN,
      hasPhoneNumberId: !!WHATSAPP_PHONE_NUMBER_ID,
      nodeEnv: process.env.NODE_ENV
    });
    return null;
  }
  
  try {
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    // Validate and format the message
    const formattedContent = parseWhatsAppResponse(message);
    const parsedContent = JSON.parse(formattedContent);
    
    // Build the base payload
    let payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to
    };
    
    // Add message content based on type
    if (parsedContent.message_type === "text") {
      payload.type = "text";
      payload.text = {
        body: parsedContent.text
      };
    } else if (parsedContent.message_type === "interactive") {
      // TODO: Validation to have better than splicing use mini model to validate
      payload.type = "interactive";
      payload.interactive = {
        type: parsedContent.type
      };
      
      // Add body
      if (parsedContent.body) {
        payload.interactive.body = parsedContent.body;
      }
      
      // Add action based on interactive type
      if (parsedContent.action) {
        payload.interactive.action = parsedContent.action;
        
        // Validate button titles if present
        if (parsedContent.action.buttons && Array.isArray(parsedContent.action.buttons)) {
          for (const button of parsedContent.action.buttons) {
            if (button && button.title) {
              if (button.title.length > 20) {
                button.title = button.title.slice(0, 20);
              }
            }
          }
        }
        
        if (parsedContent.action.sections && 
            Array.isArray(parsedContent.action.sections) && 
            parsedContent.action.sections.length > 0) {
          for (const section of parsedContent.action.sections) {
            if (section && section.title) {
              if (section.title.length > 24) {
                section.title = section.title.slice(0, 24);
              }
            }
            if (section?.rows) {
              for (const row of section.rows) {
                if (row && row.id && row.title) {
                  if (row.title.length > 24) {
                    row.title = row.title.slice(0, 24);
                  }
                }
                if (row && row.description) {
                  if (row.description.length > 72) {
                    row.description = row.description.slice(0, 72);
                  }
                }
              }
            }
          }
        }
      }
      
      // Add optional header
      if (parsedContent.header) {
        payload.interactive.header = parsedContent.header;
      }
      
      // Add optional footer
      if (parsedContent.footer) {
        payload.interactive.footer = parsedContent.footer;
      }
    }
    
    // Add context for replying to a specific message if messageId is provided
    if (replyToMessageId) {
      payload.context = {
        message_id: replyToMessageId
      };
    }
    
    // console.log("Sending WhatsApp message:", JSON.stringify(payload, null, 2));
    
    // Send the message
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${META_ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Error sending WhatsApp message:", data);
      return null; // TODO: Handle error better
    }
    console.log("WhatsApp message sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return null;
  }
}