import { parentPort } from 'worker_threads';
import Cabin from 'cabin';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { sendWhatsAppMessage, uploadMediaToWhatsApp, parseWhatsAppResponse, geminiChat, openaiChat } from '../utils.js';
import { morning_review_system_prompt } from '../prompts.js';
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

// User preferences utilities (inline to avoid TypeScript import issues)
const DEFAULT_PREFERENCES = {
  interests: [],
  textInput: "",
  capabilities: {
    "daily-briefings": false,
    "meeting-prep": false,
    "smart-reminders": false,
    "vc-updates": false,
    "market-insights": false,
    "executive-memory": false,
  },
  communicationSettings: {
    briefingSchedule: "daily-morning",
    focusHours: {
      start: "09:00",
      end: "11:00",
    },
    meetingPrepTiming: "30min",
  },
};

function parseUserPreferences(preferencesString) {
  if (!preferencesString) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(preferencesString);
    // Merge with defaults to ensure all fields are present
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      capabilities: {
        ...DEFAULT_PREFERENCES.capabilities,
        ...parsed.capabilities,
      },
      communicationSettings: {
        ...DEFAULT_PREFERENCES.communicationSettings,
        ...parsed.communicationSettings,
        focusHours: {
          ...DEFAULT_PREFERENCES.communicationSettings?.focusHours,
          ...parsed.communicationSettings?.focusHours,
        },
      },
    };
  } catch (error) {
    sendLog(`Error parsing user preferences: ${error.message}`);
    return DEFAULT_PREFERENCES;
  }
}

function hasCapability(preferences, capability) {
  return preferences.capabilities?.[capability] === true;
}

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Perplexity Sonar API configuration
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Default news topics to fetch if not specified
const DEFAULT_NEWS_TOPICS = [
  'artificial intelligence technology breakthroughs',
  'startup funding and venture capital',
  'cryptocurrency and blockchain developments',
  'space exploration and discoveries',
  'climate change and renewable energy',
  'global economic trends and market updates'
];

// Generate personalized news topics based on user preferences
function generatePersonalizedNewsTopics(userPreferences) {
  const preferences = parseUserPreferences(userPreferences);
  let topics = [];
  
  // Add topics from user's interests array
  if (preferences.interests && preferences.interests.length > 0) {
    topics = [...preferences.interests];
    sendLog(`Using ${topics.length} topics from user interests: ${topics.join(', ')}`);
  }
  
  // Add topics from user's text input if available
  if (preferences.textInput && preferences.textInput.trim()) {
    const textTopics = preferences.textInput
      .split(/[,\n]/)
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0 && !topics.some(existing => 
        existing.toLowerCase().includes(topic.toLowerCase()) || 
        topic.toLowerCase().includes(existing.toLowerCase())
      ));
    
    if (textTopics.length > 0) {
      topics = [...topics, ...textTopics];
      sendLog(`Added ${textTopics.length} topics from text input: ${textTopics.join(', ')}`);
    }
  }
  
  // If no personalized topics found, use defaults
  if (topics.length === 0) {
    sendLog('No personalized topics found, using default topics');
    return DEFAULT_NEWS_TOPICS;
  }
  
  // Limit to 6 topics to avoid overly long API calls
  if (topics.length > 6) {
    topics = topics.slice(0, 6);
    sendLog(`Limited to 6 topics to manage API call length`);
  }
  
  sendLog(`Generated ${topics.length} personalized news topics`);
  return topics;
}

const whatsapp_interactive_prompt = {
  "message_type": "interactive",
  "type": "button",
  "header": {
    "type": "text",
    "text": "Your Morning Briefing 🔔"
  },
  "body": {
    "text": "Here's your Morning Briefing for today!"
  },
  "footer": {
    "text": "Hope you have a productive day today! ✨"
  },
  "action": {
    "buttons": [
      {
        "type": "reply",
        "reply": {
          "id": "view-calendar-details",
          "title": "Calendar 🗓️"
        }
      },
      {
        "type": "reply",
        "reply": {
          "id": "view-email-details",
          "title": "Emails 📧"
        }
      }
    ]
  }
};

async function fetchNewsWithPerplexity(topics = DEFAULT_NEWS_TOPICS) {
  if (!PERPLEXITY_API_KEY) {
    sendLog('PERPLEXITY_API_KEY is not configured. Skipping news fetch.');
    return [];
  }

  sendLog(`Fetching news for ${topics.length} topics using Perplexity Sonar API in single request`);
  
  try {
    // Combine all topics into a single, comprehensive query
    const topicsText = topics.map((topic, index) => `${index + 1}. ${topic}`).join('\n');
    
    const payload = {
      model: "sonar-pro", // Using Sonar Pro for more detailed answers with citations
      messages: [
        {
          role: "system",
          content: "You are a professional news analyst. Provide concise, sharp, and deeply informative news summaries. For each topic, focus on the most significant recent developments and their implications. Include specific details, numbers, and context that matter. Be analytical and insightful, not just descriptive. Structure your response clearly by topic."
        },
        {
          role: "user",
          content: `Give me the most important recent news stories for each of these topics. For each topic, provide 1-2 key stories with:
          - What happened (specific details)
          - Why it matters (implications and context)
          - Key numbers or data points
          - What to watch next
          
          Topics:
          ${topicsText}
          
          Keep each story to 2-3 sentences maximum but make them information-dense and insightful. Clearly separate each topic with headers.`
        }
      ],
      search_recency_filter: "day", // Focus on very recent news
      temperature: 0.1, // Low temperature for factual, consistent responses
      max_tokens: 1200 // Increased for multiple topics
    };
    sendLog('Making single API request for all news topics...');
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      sendLog(`Perplexity API error: ${response.status} - ${errorData}`);
      return [];
    }

    const data = await response.json();
    const newsContent = data.choices[0]?.message?.content;
    
    if (newsContent) {
      sendLog(`Successfully fetched news for all ${topics.length} topics in single request`);
      sendLog(`Response length: ${newsContent.length} characters`);
      
      return [{
        topic: 'Combined News Intelligence',
        content: newsContent,
        citations: data.citations || []
      }];
      
    } else {
      sendLog('No content received from Perplexity API');
      return [];
    }
    
  } catch (error) {
    sendLog(`Error fetching news from Perplexity API: ${error.message}`);
    return [];
  }
}

async function generateReviewWithGemini(summary) {
  try {
    sendLog(`Attempting to generate review with Gemini...`);
    const prompt = morning_review_system_prompt(summary);
    const response = await geminiChat.invoke(prompt);
    const formattedResponse = parseWhatsAppResponse(response.content);
    const messageObject = { ...whatsapp_interactive_prompt };
    messageObject.body.text = JSON.parse(formattedResponse).text;
    sendLog(`✅ Gemini review generated successfully`);
    return JSON.stringify(messageObject);
  } catch (error) {
    sendLog(`❌ Gemini API error: ${error.message}. Trying OpenAI fallback...`);
    
    // Try OpenAI fallback
    try {
      sendLog(`Attempting to generate review with OpenAI o4-mini...`);
      const prompt = morning_review_system_prompt(summary);
      const response = await openaiChat.invoke(prompt);
      const formattedResponse = parseWhatsAppResponse(response.content);
      const messageObject = { ...whatsapp_interactive_prompt };
      messageObject.body.text = JSON.parse(formattedResponse).text;
      sendLog(`✅ OpenAI fallback review generated successfully`);
      return JSON.stringify(messageObject);
    } catch (openaiError) {
      sendLog(`❌ OpenAI fallback also failed: ${openaiError.message}. Using static fallback message.`);
      
      // Final fallback - static review message when both AI services fail
      const { events, emails } = summary;
      let fallbackText = "🌅 Good morning! Here's your daily overview:\n\n";
      
      if (events && events.length > 0) {
        fallbackText += `📅 **Today's Schedule** (${events.length} events)\n`;
        events.slice(0, 3).forEach((event, index) => {
          const startTime = event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
          }) : 'All day';
          fallbackText += `• ${startTime}: ${event.summary || 'Meeting'}\n`;
        });
        if (events.length > 3) {
          fallbackText += `• Plus ${events.length - 3} more events\n`;
        }
        fallbackText += "\n";
      }
      
      if (emails && emails.length > 0) {
        fallbackText += `📧 **Priority Emails** (${emails.length} unread)\n`;
        emails.slice(0, 2).forEach((email, index) => {
          const fromName = email.from?.split('<')[0]?.trim().replace(/"/g, '') || 'Unknown';
          const subject = email.subject?.substring(0, 40) || 'No subject';
          fallbackText += `• From ${fromName}: ${subject}\n`;
        });
        if (emails.length > 2) {
          fallbackText += `• Plus ${emails.length - 2} more emails\n`;
        }
        fallbackText += "\n";
      }
      
      fallbackText += "Have a productive day! 🚀";
      
      const fallbackMessage = { ...whatsapp_interactive_prompt };
      fallbackMessage.body.text = fallbackText;
      sendLog(`✅ Static fallback review generated`);
      return JSON.stringify(fallbackMessage);
    }
  }
}

function generatePodcastScript(summary, userEmail, newsData = []) {
  const { events, emails } = summary;
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });
  
  let script = `Hey there! Good morning, it's ${currentTime}. I've got your daily intel ready, so let's dive right in. `;
  
  // Calendar section - Start with events of the day
  if (events && events.length > 0) {
    script += `Let's start with your day ahead. You've got ${events.length} thing${events.length > 1 ? 's' : ''} on your calendar. `;
    
    events.slice(0, 3).forEach((event, index) => {
      const startTime = event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      }) : 'All day';
      
      if (index === 0) {
        script += `Your first one is at ${startTime} - ${event.summary || 'that meeting'}. `;
      } else if (index === 1) {
        script += `Then at ${startTime} you have ${event.summary || 'another meeting'}. `;
      } else {
        script += `And later at ${startTime}, there's ${event.summary || 'one more'}. `;
      }
    });
    
    if (events.length > 3) {
      script += `Plus you've got ${events.length - 3} more after that. `;
    }
  } else {
    script += `Your calendar's looking pretty clear today, which is great for getting some deep work done. `;
  }
  
  // Email section with time estimates
  if (emails && emails.length > 0) {
    // Calculate estimated time (assuming 2-3 minutes per email on average)
    const estimatedMinutes = Math.ceil(emails.length * 2.5);
    
    script += `Now about your inbox - you've got ${emails.length} unread message${emails.length > 1 ? 's' : ''} that need your attention, which should take about ${estimatedMinutes} minutes to get through. `;
    
    if (emails.length > 0) {
      const fromName = emails[0].from?.split('<')[0]?.trim().replace(/"/g, '') || 'someone important';
      const subject = emails[0].subject?.substring(0, 35) || 'something urgent';
      script += `The priority one is from ${fromName} about ${subject}. `;
      
      if (emails.length > 1) {
        script += `The other ${emails.length - 1} can probably wait a bit, but factor in that time for your planning. `;
      }
    }
  } else {
    script += `Your inbox is actually looking pretty manageable right now. `;
  }
  
  // News Briefing Section - End with news updates
  if (newsData && newsData.length > 0) {
    script += `And finally, here's what's happening in the world that you should know about. `;
    
    newsData.forEach((newsItem, index) => {
      const content = newsItem.content.substring(0, 250).replace(/[\n\r]/g, ' ').replace(/\s+/g, ' ');
      script += `${content}. This could definitely impact your space, so keep an eye on it. `;
    });
    
    script += `That's your landscape update for today. `;
  }
  
  // Conversational, motivational close
  script += `Alright, that's everything you need to know to crush today. You've got this! Go make some magic happen.`;
  
  return script;
}

async function createPodcastWithElevenLabs(summary, userEmail, newsData = []) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  // Generate podcast content based on calendar, email summary, and news
  const podcastContent = generatePodcastScript(summary, userEmail, newsData);
  
  // Using the specified voice ID for smoother, more conversational delivery
  const voiceId = "2WM58lWaTXuuBkN1puHx";
  
  const payload = {
    text: podcastContent,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.3,
      similarity_boost: 0.85,
      style: 0.4,
      use_speaker_boost: true,
    },
    output_format: "mp3_22050_32"
  };

  sendLog(`Creating audio for user ${userEmail} with voice ${voiceId}`);
  sendLog(`Content includes ${newsData.length} news topics: ${podcastContent.substring(0, 200)}...`);

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

async function morningCombined() {
  sendLog('Morning combined job started');
  
  if (!ELEVENLABS_API_KEY) {
    sendLog('ELEVENLABS_API_KEY is not configured. Please add it to your environment variables.');
    return;
  }
  
  try {
    // Step 1: Get users with Google accounts and phone numbers
    sendLog('Step 1: Getting users with Google accounts and phone numbers...');
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
        preferences: true, // Add preferences to the query
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
        
        // Step 2: Generate personalized news topics and fetch news for this user
        const personalizedTopics = generatePersonalizedNewsTopics(user.preferences);
        sendLog(`Step 2: Fetching personalized news for ${user.email} with topics: ${personalizedTopics.join(', ')}`);
        const newsData = await fetchNewsWithPerplexity(personalizedTopics);
        
        // Step 3: Get calendar and emails for each user
        sendLog(`Step 3: Getting calendar and emails for ${user.email}...`);
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

        // Get emails with better filtering (from morning-podcast.js)
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

        // Step 4: Generate podcast with news, calendar, and emails
        sendLog(`Step 4: Generating podcast for user ${user.email} with ${newsData.length} news items`);
        const summary = { events, emails };
        const audioBuffer = await createPodcastWithElevenLabs(summary, user.email, newsData);
        
        // Step 5: Send Morning Briefing message first (with fallback)
        sendLog(`Step 5: Sending Morning Briefing message to ${user.email}`);
        const review = await generateReviewWithGemini(summary);
        sendLog(`Review message generated successfully`);
        sendLog(`Review content preview: ${review.substring(0, 200)}...`);
        
        // Debug WhatsApp credentials
        sendLog(`WhatsApp Phone Number ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID ? 'Set' : 'NOT SET'}`);
        sendLog(`Meta Access Token: ${process.env.META_ACCESS_TOKEN ? 'Set' : 'NOT SET'}`);
        sendLog(`User phone number: ${user.phoneNumber}`);
        
        await sendWhatsAppMessage(user.phoneNumber, review);
        sendLog(`✅ Morning Briefing message sent successfully to ${user.email}`);
        
        // Step 6: Send podcast audio
        sendLog(`Step 6: Sending podcast audio to ${user.email}`);
        await sendPodcastViaWhatsApp(user.phoneNumber, audioBuffer, user.email);
        sendLog(`✅ Podcast audio sent successfully to ${user.email}`);
        
        sendLog(`✅ Successfully processed user: ${user.email}`);
      } catch (userError) {
        sendLog(`❌ Error processing user ${user.email}: ${userError.message}`);
        sendLog(`❌ Error stack: ${userError.stack}`);
        continue;
      }
    }
  } catch (error) {
    sendLog(`Morning combined job failed: ${error.message}`);
    sendLog(`Error stack: ${error.stack}`);
    throw error;
  }
}

export default morningCombined;

if (parentPort) {
  morningCombined()
    .then(() => {
      sendLog('Morning combined job completed');
      process.exit(0);
    })
    .catch((error) => {
      sendLog(`Morning combined job failed with error: ${error.message}`);
      process.exit(1);
    });
}