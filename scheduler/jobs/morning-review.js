import { parentPort } from 'worker_threads';
import Cabin from 'cabin';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { sendWhatsAppMessage, parseWhatsAppResponse, geminiChat } from '../utils.js';
import { morning_review_system_prompt } from '../prompts.js';

const logger = new Cabin();
const prisma = new PrismaClient();

// Helper function to send logs to parent process
function sendLog(message) {
  if (parentPort) {
    parentPort.postMessage(message);
  }
  console.log(message);
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

async function generateReviewWithGemini(summary) {
  const prompt = morning_review_system_prompt(summary);
  const response = await geminiChat.invoke(prompt);
  const formattedResponse = parseWhatsAppResponse(response.content);
  const messageObject = { ...whatsapp_interactive_prompt };
  messageObject.body.text = JSON.parse(formattedResponse).text;
  return JSON.stringify(messageObject);
}

async function morningReview() {
  sendLog('Morning Briefing job started');
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
    sendLog(`Found ${users.length} users with Google accounts`);

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
        try {
          sendLog("Getting calendar events");
          const calendarResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: today.toISOString(),
            timeMax: tomorrow.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            fields: 'items(id,summary,start,end,description)'  // Specify fields to reduce response size
          });
          events = calendarResponse.data.items || [];
          sendLog(`Found ${events.length} calendar events for user ${user.email}`);
        } catch (calendarError) {
          sendLog(`Calendar API error for ${user.email}: ${calendarError.message}`);
        }
        try {
          sendLog("Getting emails");
          const emailResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 50,
            q: 'in:inbox is:important is:unread -category:promotions -category:social -in:spam'
          });
          const emailDetails = await Promise.all(
            emailResponse.data.messages.map(async (message) => {
              const fullMessage = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'metadata', // faster than 'full'
                metadataHeaders: ['Subject', 'From', 'Date']
              });
              const headers = fullMessage.data.payload?.headers || [];
              const getHeader = (name) =>
                headers.find((h) => h.name === name)?.value || '';
              return {
                id: message.id,
                subject: getHeader('Subject'),
                from: getHeader('From'),
                date: getHeader('Date')
              };
            })
          );
          emails = emailDetails;
          sendLog(`Emails: ${JSON.stringify(emailDetails)}`);
          sendLog(`Found ${emails.length} recent emails for user ${user.email}`);
        } catch (gmailError) {
          sendLog(`Gmail API error for ${user.email}: ${gmailError.message}`);
        }
        const summary = { events, emails };
        const review = await generateReviewWithGemini(summary);
        sendLog(`Review: ${review}`);
        await sendWhatsAppMessage(user.phoneNumber, review);
        sendLog(`Successfully processed user: ${user.email}`);
      } catch (userError) {
        sendLog(`Error processing user ${user.email}: ${userError.message}`);
        continue;
      }
    }
  } catch (error) {
    sendLog(`Morning Briefing job failed: ${error.message}`);
    throw error;
  }
}

export default morningReview;

if (parentPort) {
  morningReview()
    .then(() => {
      sendLog('Morning Briefing job completed');
      process.exit(0);
    })
    .catch((error) => {
      sendLog(`Morning Briefing job failed with error: ${error.message}`);
      process.exit(1);
    });
}
