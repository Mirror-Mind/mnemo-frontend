import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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
  if (!META_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("WhatsApp API credentials not configured");
    return null;
  }
  try {
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    // Validate and format the message
    const formattedMessage = parseWhatsAppResponse(message);
    const parsedContent = JSON.parse(formattedMessage);
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
    } else if (parsedContent.message_type === "audio") {
      payload.type = "audio";
      payload.audio = parsedContent.audio;
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
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
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

// Upload media to WhatsApp Cloud API
export async function uploadMediaToWhatsApp(audioBuffer, mimeType = 'audio/mpeg') {
  if (!META_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error("WhatsApp API credentials not configured");
    return null;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/media`;
    
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
    
    // Create the complete body
    const startBuffer = Buffer.from(bodyStart, 'utf8');
    const endBuffer = Buffer.from(bodyEnd, 'utf8');
    const completeBody = Buffer.concat([
      startBuffer,
      Buffer.from(audioBuffer),
      endBuffer
    ]);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': completeBody.length.toString()
      },
      body: completeBody
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error uploading media to WhatsApp:", errorData);
      return null;
    }

    const data = await response.json();
    console.log("Media uploaded successfully. Media ID:", data.id);
    return data.id;
  } catch (error) {
    console.error("Error uploading media to WhatsApp:", error);
    return null;
  }
}
