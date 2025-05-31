import morningPodcast from './scheduler/jobs/morning-podcast.js';

console.log('🎧 Starting Enhanced Morning Podcast Generation...');
console.log('📰 Fetching news from Perplexity API...');
console.log('🎵 Creating audio with ElevenLabs...');
console.log('📱 Sending via WhatsApp...');

morningPodcast()
  .then(() => {
    console.log('✅ Podcast generated and sent successfully!');
    console.log('📱 Check your WhatsApp for the enhanced morning podcast!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error generating podcast:', error.message);
    process.exit(1);
  }); 