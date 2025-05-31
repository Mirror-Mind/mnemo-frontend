import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { Blob } from 'buffer';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export const parseWhatsAppResponse = (content) => {
  try {
    JSON.parse(content);
    return content;
  } catch (error) {
    const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*?})/);
    if (jsonMatch) {
      const jsonContent = jsonMatch[1] || jsonMatch[2];
      try {
        JSON.parse(jsonContent);
        return jsonContent;
      } catch (extractError) {
        console.error("Error parsing extracted JSON:", extractError);
      }
    }
    console.error("Error parsing WhatsApp response, falling back to text format");
    const textMessage = {
      message_type: "text",
      type: "text",
      text: content
    };
    return JSON.stringify(textMessage);
  }
};

// Send a WhatsApp message
export async function sendWhatsAppMessage(to, message, replyToMessageId) {
  console.log(`[WhatsApp] Attempting to send message to: ${to}`);
  
  if (!META_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("[WhatsApp] API credentials not configured");
    console.error(`[WhatsApp] META_ACCESS_TOKEN: ${META_ACCESS_TOKEN ? 'Set' : 'NOT SET'}`);
    console.error(`[WhatsApp] WHATSAPP_PHONE_NUMBER_ID: ${WHATSAPP_PHONE_NUMBER_ID ? 'Set' : 'NOT SET'}`);
    return null;
  }
  
  try {
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    console.log(`[WhatsApp] API URL: ${url}`);
    
    // Validate and format the message
    const formattedMessage = parseWhatsAppResponse(message);
    const parsedContent = JSON.parse(formattedMessage);
    console.log(`[WhatsApp] Message type: ${parsedContent.message_type}`);
    
    // Build the base payload
    let payload = {
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
      console.log(`[WhatsApp] Text message length: ${parsedContent.text.length}`);
    } else if (parsedContent.message_type === "audio") {
      payload.type = "audio";
      payload.audio = parsedContent.audio;
      console.log(`[WhatsApp] Audio message with ID: ${parsedContent.audio.id}`);
    } else if (parsedContent.message_type === "interactive") {
      // TODO: Validation to have better than splicing use mini model to validate
      payload.type = "interactive";
      payload.interactive = {
        type: parsedContent.type
      };
      console.log(`[WhatsApp] Interactive message type: ${parsedContent.type}`);
      
      // Add body
      if (parsedContent.body) {
        payload.interactive.body = parsedContent.body;
        console.log(`[WhatsApp] Interactive body length: ${parsedContent.body.text?.length || 0}`);
      }
      // Add action based on interactive type
      if (parsedContent.action) {
        payload.interactive.action = parsedContent.action;
        // Validate button titles if present
        if (parsedContent.action.buttons && Array.isArray(parsedContent.action.buttons)) {
          console.log(`[WhatsApp] Interactive has ${parsedContent.action.buttons.length} buttons`);
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
    
    console.log(`[WhatsApp] Sending payload: ${JSON.stringify(payload, null, 2)}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${META_ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log(`[WhatsApp] Response status: ${response.status}`);
    console.log(`[WhatsApp] Response data: ${JSON.stringify(data, null, 2)}`);
    
    if (!response.ok) {
      console.error("[WhatsApp] Error sending message:", data);
      return null;
    }
    
    console.log(`[WhatsApp] ✅ Message sent successfully. Message ID: ${data.messages?.[0]?.id}`);
    return data;
  } catch (error) {
    console.error("[WhatsApp] Exception sending message:", error);
    console.error("[WhatsApp] Error stack:", error.stack);
    return null;
  }
}

export const geminiChat = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-preview-04-17",
    structuredOutput: true,
    temperature: 0
}).bind({
  response_format: { type: "json_object" },
});

// Fallback OpenAI chat for when Gemini fails
export const openaiChat = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    maxTokens: 1000
});

// Upload media to WhatsApp Cloud API
export async function uploadMediaToWhatsApp(audioBuffer, mimeType = 'audio/mpeg') {
  console.log(`[WhatsApp Media] Attempting to upload media. Size: ${audioBuffer.byteLength} bytes, Type: ${mimeType}`);
  
  if (!META_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("[WhatsApp Media] API credentials not configured");
    console.error(`[WhatsApp Media] META_ACCESS_TOKEN: ${META_ACCESS_TOKEN ? 'Set' : 'NOT SET'}`);
    console.error(`[WhatsApp Media] WHATSAPP_PHONE_NUMBER_ID: ${WHATSAPP_PHONE_NUMBER_ID ? 'Set' : 'NOT SET'}`);
    return null;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/media`;
    console.log(`[WhatsApp Media] Upload URL: ${url}`);
    
    // Create a boundary for the multipart form data
    const boundary = `----formdata-polyfill-${Math.random().toString(36)}`;
    
    // Create the multipart form data body manually
    const fileName = 'podcast.mp3';
    const bodyParts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="messaging_product"\r\n\r\n`,
      `whatsapp\r\n`,
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`,
      `Content-Type: ${mimeType}\r\n\r\n`,
    ];
    
    const bodyEnd = `\r\n--${boundary}--\r\n`;
    
    // Calculate content length
    const bodyStart = bodyParts.join('');
    const totalLength = Buffer.byteLength(bodyStart) + audioBuffer.byteLength + Buffer.byteLength(bodyEnd);
    
    console.log(`[WhatsApp Media] Total upload size: ${totalLength} bytes`);
    
    // Create the complete body
    const startBuffer = Buffer.from(bodyStart, 'utf8');
    const endBuffer = Buffer.from(bodyEnd, 'utf8');
    const completeBody = Buffer.concat([
      startBuffer,
      Buffer.from(audioBuffer),
      endBuffer
    ]);

    console.log(`[WhatsApp Media] Making upload request...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': completeBody.length.toString()
      },
      body: completeBody
    });

    console.log(`[WhatsApp Media] Upload response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("[WhatsApp Media] Error uploading media:", errorData);
      return null;
    }

    const data = await response.json();
    console.log("[WhatsApp Media] ✅ Media uploaded successfully. Media ID:", data.id);
    console.log("[WhatsApp Media] Upload response:", JSON.stringify(data, null, 2));
    return data.id;
  } catch (error) {
    console.error("[WhatsApp Media] Exception uploading media:", error);
    console.error("[WhatsApp Media] Error stack:", error.stack);
    return null;
  }
}
