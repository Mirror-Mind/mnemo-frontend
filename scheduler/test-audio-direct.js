import { config } from 'dotenv';
config();

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function testAudioDirectURL() {
  console.log('Testing WhatsApp audio with direct URL...');
  
  // Using a publicly available test MP3 file
  const testAudioMessage = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: "+919819628102",
    type: "audio",
    audio: {
      link: "https://download.samplelib.com/mp3/sample-9s.mp3"
    }
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${META_ACCESS_TOKEN}`
      },
      body: JSON.stringify(testAudioMessage)
    });

    const result = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${result}`);

    if (response.ok) {
      console.log('✅ Direct URL audio message sent successfully!');
      console.log('Check your WhatsApp for the test audio message');
    } else {
      console.log('❌ Direct URL audio message failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAudioDirectURL(); 