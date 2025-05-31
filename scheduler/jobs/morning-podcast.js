import { parentPort } from 'worker_threads';
import Cabin from 'cabin';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { sendWhatsAppMessage, uploadMediaToWhatsApp } from '../utils.js';
import fs from 'fs';
import path from 'path';

const logger = new Cabin();
const prisma = new PrismaClient();

// Helper function to send logs to parent process
function sendLog(message) {
  if (parentPort) {
    parentPort.postMessage(message);
  }
  console.log(message);
}

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

async function createPodcastWithElevenLabs(summary, userEmail) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  // Generate podcast content based on calendar and email summary
  const podcastContent = generatePodcastScript(summary, userEmail);
  
  // Using Rachel's voice - warm, expressive voice perfect for daily briefings
  const voiceId = "21m00Tcm4TlvDq8ikWAM";
  
  const payload = {
    text: podcastContent,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.6,
      similarity_boost: 0.75,
      style: 0.1,
      use_speaker_boost: true
    },
    output_format: "mp3_22050_32"
  };

  sendLog(`Creating audio for user ${userEmail} with voice ${voiceId}`);
  sendLog(`Content: ${podcastContent.substring(0, 200)}...`);

  try {
    const response = await fetch(`${ELEVENLABS_TTS_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`ElevenLabs TTS API error: ${response.status} - ${errorData}`);
    }

    const audioBuffer = await response.arrayBuffer();
    sendLog(`Audio generated successfully. Size: ${audioBuffer.byteLength} bytes`);
    
    // Save audio file to temp folder for debugging
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `podcast-${userEmail.split('@')[0]}-${timestamp}.mp3`;
    const filepath = path.join(tempDir, filename);
    
    fs.writeFileSync(filepath, Buffer.from(audioBuffer));
    sendLog(`Audio file saved to: ${filepath}`);
    
    return audioBuffer;
  } catch (error) {
    sendLog(`Error creating audio: ${error.message}`);
    throw error;
  }
}

async function sendPodcastViaWhatsApp(phoneNumber, audioBuffer, userEmail) {
  try {
    sendLog(`Sending podcast audio to WhatsApp for ${userEmail}`);
    sendLog(`Phone number: ${phoneNumber}`);
    sendLog(`Audio buffer size: ${audioBuffer.byteLength} bytes`);
    
    // Save audio file for direct URL access
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `podcast-${userEmail.split('@')[0]}-${timestamp}.mp3`;
    const filepath = path.join(tempDir, filename);
    
    fs.writeFileSync(filepath, Buffer.from(audioBuffer));
    sendLog(`Audio file saved to: ${filepath}`);
    
    // Method 1: Try direct link approach (more reliable)
    try {
      sendLog('Attempting direct link method...');
      
      // Upload the audio to WhatsApp first to get a media ID, then use it
      const mediaId = await uploadMediaToWhatsApp(audioBuffer, 'audio/mpeg');
      
      if (mediaId) {
        const audioMessage = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phoneNumber,
          type: "audio",
          audio: {
            id: mediaId
          }
        };

        const whatsappUrl = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
        
        const response = await fetch(whatsappUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
          },
          body: JSON.stringify(audioMessage)
        });

        const responseText = await response.text();
        sendLog(`Direct upload method - Status: ${response.status}`);
        
        if (response.ok) {
          const result = JSON.parse(responseText);
          sendLog(`✅ Podcast sent via media upload to ${userEmail}. Message ID: ${result.messages[0].id}`);
          return;
        } else {
          sendLog(`Direct upload method failed: ${responseText}`);
        }
      }
    } catch (directError) {
      sendLog(`Direct upload method error: ${directError.message}`);
    }

    // Method 2: Upload and send (original method)
    sendLog('Attempting upload method...');
    
    // Upload the audio to WhatsApp
    const mediaId = await uploadMediaToWhatsApp(audioBuffer, 'audio/mpeg');
    
    if (!mediaId) {
      throw new Error('Failed to upload audio to WhatsApp');
    }
    
    sendLog(`Audio uploaded successfully. Media ID: ${mediaId}`);
    
    // Verify environment variables
    if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.META_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured properly');
    }
    
    // Create audio message in the correct WhatsApp Business API format
    const audioMessage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "audio",
      audio: {
        id: mediaId
      }
    };

    // Send directly to WhatsApp API
    const whatsappUrl = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    const response = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`
      },
      body: JSON.stringify(audioMessage)
    });

    const responseText = await response.text();
    sendLog(`Upload method - Status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    if (result.messages && result.messages[0] && result.messages[0].id) {
      sendLog(`✅ Podcast sent via upload to ${userEmail}. Message ID: ${result.messages[0].id}`);
    } else {
      sendLog(`⚠️ Unexpected response format: ${responseText}`);
    }
    
  } catch (error) {
    sendLog(`❌ Error sending podcast via WhatsApp: ${error.message}`);
    
    // Fallback: send text notification
    try {
      const fallbackMessage = {
        message_type: "text",
        type: "text",
        text: `🎧 Your Daily Podcast is Ready!\n\nGood morning! I've generated your personalized daily podcast, but there was an issue delivering the audio file. \n\n✨ The podcast would have covered:\n• Today's schedule highlights\n• Important email summaries\n• Key priorities for the day\n\nYou can find the audio file at: temp/${path.basename(filepath)}`
      };

      await sendWhatsAppMessage(phoneNumber, JSON.stringify(fallbackMessage));
      sendLog(`Sent fallback text message to ${userEmail}`);
    } catch (fallbackError) {
      sendLog(`Failed to send fallback message: ${fallbackError.message}`);
    }
    
    throw error;
  }
}

function generatePodcastScript(summary, userEmail) {
  const { events, emails } = summary;
  
  // Return shorter podcast if minimal content
  if ((!events || events.length === 0) && (!emails || emails.length === 0)) {
    return `<podcast>
<intro>Good morning! This is your AI briefing assistant with a quick update for ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.</intro>

<main_content>
You've got a completely clear schedule today - no meetings, no urgent emails. This is your golden opportunity for deep work and strategic thinking!

<action_items>
Take advantage of this rare free day. Focus on your biggest priorities, catch up on important projects, or even take some time for strategic planning.
</action_items>
</main_content>

<outro>That's your lightning briefing. Make today count!</outro>
</podcast>`;
  }
  
  let script = `<podcast>
<intro>Good morning! Welcome to your personalized daily briefing. I'm your AI assistant, and I've got the essential intel you need to dominate ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}.</intro>

<main_content>`;
  
  // Calendar section - Make it exciting
  if (events && events.length > 0) {
    script += `\n<schedule_briefing>
🗓️ SCHEDULE ALERT: You've got ${events.length} event${events.length > 1 ? 's' : ''} locked and loaded today.

<event_details>`;
    
    events.slice(0, 4).forEach((event, index) => { // Limit to top 4 events
      const startTime = event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      }) : 'All day';
      
      const priority = index === 0 ? "🔥 PRIORITY: " : index === 1 ? "⚡ NEXT UP: " : "";
      script += `\n${priority}${startTime} - ${event.summary || 'Meeting'}`;
      
      if (event.description && event.description.length > 0) {
        const shortDesc = event.description.substring(0, 60);
        script += `. Quick note: ${shortDesc}${event.description.length > 60 ? '...' : ''}`;
      }
    });
    
    if (events.length > 4) {
      script += `\nPlus ${events.length - 4} more events in your calendar.`;
    }
    
    script += `\n</event_details>
</schedule_briefing>`;
  } else {
    script += `\n<schedule_briefing>
🆓 CLEAR DECK: Zero meetings today. This is your power day for deep work and strategic execution!
</schedule_briefing>`;
  }
  
  // Email section - Sharp and selective
  if (emails && emails.length > 0) {
    script += `\n\n<email_intel>
📧 INBOX INTELLIGENCE: ${emails.length} critical message${emails.length > 1 ? 's' : ''} need your attention.

<urgent_emails>`;
    
    emails.slice(0, 3).forEach((email, index) => { // Only top 3 most important
      const fromName = email.from?.split('<')[0]?.trim().replace(/"/g, '') || 'Important sender';
      const priority = index === 0 ? "🚨 URGENT: " : index === 1 ? "⭐ HIGH: " : "📋 REVIEW: ";
      
      script += `\n${priority}${fromName} - ${email.subject?.substring(0, 50) || 'Important message'}${email.subject?.length > 50 ? '...' : ''}`;
    });
    
    if (emails.length > 3) {
      script += `\nPlus ${emails.length - 3} more important messages waiting.`;
    }
    
    script += `\n</urgent_emails>
</email_intel>`;
  } else {
    script += `\n\n<email_intel>
✅ INBOX STATUS: All clear! No urgent emails demanding your immediate attention.
</email_intel>`;
  }
  
  // Action items and closing
  script += `\n\n<action_briefing>
⚡ TODAY'S MISSION:`;
  
  if (events && events.length > 0) {
    script += `\nStay sharp for your ${events.length} scheduled event${events.length > 1 ? 's' : ''}.`;
  }
  
  if (emails && emails.length > 0) {
    script += `\nTackle those ${emails.length} priority emails before they pile up.`;
  }
  
  script += `\nFocus on what moves the needle. Eliminate distractions. Execute with precision.
</action_briefing>
</main_content>

<outro>That's your intelligence briefing. Now go make things happen! This is your AI assistant signing off.</outro>
</podcast>`;
  
  return script;
}

async function morningPodcast() {
  sendLog('Morning podcast job started');
  
  if (!ELEVENLABS_API_KEY) {
    sendLog('ELEVENLABS_API_KEY is not configured. Please add it to your environment variables.');
    return;
  }
  
  try {
    const users = await prisma.user.findMany({
      where: {
        accounts: {
          some: {
            providerId: 'google'
          }
        },
        phoneNumber: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        accounts: {
          select: {
            providerId: true,
            accessToken: true,
            refreshToken: true
          }
        },
        phoneNumber: true
      }
    });
    
    sendLog(`Found ${users.length} users with Google accounts and phone numbers`);

    for (const user of users) {
      sendLog(`Processing user: ${user.email}`);
      let events = [];
      let emails = [];
      
      try {
        const googleAccount = user.accounts.find(acc => acc.providerId === 'google');
        if (!googleAccount) {
          sendLog(`No Google account found for user: ${user.email}`);
          continue;
        }

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
        
        oauth2Client.setCredentials({
          access_token: googleAccount.accessToken,
          refresh_token: googleAccount.refreshToken || undefined
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get calendar events
        try {
          sendLog("Getting calendar events");
          const calendarResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: today.toISOString(),
            timeMax: tomorrow.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            fields: 'items(id,summary,start,end,description)'
          });
          events = calendarResponse.data.items || [];
          sendLog(`Found ${events.length} calendar events for user ${user.email}`);
        } catch (calendarError) {
          sendLog(`Calendar API error for ${user.email}: ${calendarError.message}`);
        }

        // Get emails with better filtering
        try {
          sendLog("Getting emails");
          const emailResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 15,
            q: 'in:inbox is:unread -category:promotions -category:social -category:updates -in:spam -from:noreply -from:no-reply newer_than:2d'
          });
          
          if (emailResponse.data.messages) {
            const emailDetails = await Promise.all(
              emailResponse.data.messages.map(async (message) => {
                const fullMessage = await gmail.users.messages.get({
                  userId: 'me',
                  id: message.id,
                  format: 'metadata',
                  metadataHeaders: ['Subject', 'From', 'Date']
                });
                
                const headers = fullMessage.data.payload?.headers || [];
                const getHeader = (name) =>
                  headers.find((h) => h.name === name)?.value || '';
                
                const subject = getHeader('Subject');
                const from = getHeader('From');
                
                // Filter out automated/promotional emails
                const isImportant = !subject.toLowerCase().includes('newsletter') &&
                                  !subject.toLowerCase().includes('unsubscribe') &&
                                  !subject.toLowerCase().includes('sale') &&
                                  !subject.toLowerCase().includes('offer') &&
                                  !from.toLowerCase().includes('noreply') &&
                                  !from.toLowerCase().includes('marketing');
                
                if (isImportant) {
                  return {
                    id: message.id,
                    subject: subject,
                    from: from,
                    date: getHeader('Date')
                  };
                }
                return null;
              })
            );
            emails = emailDetails.filter(email => email !== null);
          }
          
          sendLog(`Found ${emails.length} important emails for user ${user.email}`);
        } catch (gmailError) {
          sendLog(`Gmail API error for ${user.email}: ${gmailError.message}`);
        }

        // Generate podcast
        const summary = { events, emails };
        sendLog(`Generating podcast for user ${user.email}`);
        
        const audioBuffer = await createPodcastWithElevenLabs(summary, user.email);
        
        await sendPodcastViaWhatsApp(user.phoneNumber, audioBuffer, user.email);
        sendLog(`Successfully processed user: ${user.email}`);
      } catch (userError) {
        sendLog(`Error processing user ${user.email}: ${userError.message}`);
        continue;
      }
    }
  } catch (error) {
    sendLog(`Morning podcast job failed: ${error.message}`);
    throw error;
  }
}

export default morningPodcast;

if (parentPort) {
  morningPodcast()
    .then(() => {
      sendLog('Morning podcast job completed');
      process.exit(0);
    })
    .catch((error) => {
      sendLog(`Morning podcast job failed with error: ${error.message}`);
      process.exit(1);
    });
} 