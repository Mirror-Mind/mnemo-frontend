import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || "your_api_key_here", // Add to your .env file
});

// Default voices for podcast hosts
const DEFAULT_VOICES = {
  host1: "21m00Tcm4TlvDq8ikWAM", // Rachel - professional, warm
  host2: "AZnzlk1XvdvUeBnXmlld", // Domi - conversational, friendly
  narrator: "pNInz6obpgDQGcFmaJgB", // Adam - authoritative narrator
  guest: "EXAVITQu4vr4xnSDxMaL", // Bella - engaging, expressive
};

/**
 * Generate a podcast script based on a topic or content
 * @param {string} topic - The main topic for the podcast
 * @param {string} content - Optional content to base the podcast on
 * @param {Object} options - Configuration options
 * @returns {Object} Generated script with segments
 */
export async function generatePodcastScript(topic, content = "", options = {}) {
  const {
    hosts = ["Alex", "Sarah"],
    duration = "10-15 minutes",
    style = "conversational",
    includeIntro = true,
    includeOutro = true,
    segments = 5
  } = options;

  const prompt = `Create a ${duration} podcast script for a ${style} discussion about "${topic}".

  ${content ? `Base the discussion on this content: ${content}` : ""}
  
  The podcast should feature ${hosts.join(" and ")} as hosts.
  
  Structure:
  ${includeIntro ? "- Opening/Introduction" : ""}
  - ${segments} main discussion segments
  ${includeOutro ? "- Closing/Outro" : ""}
  
  Format each segment as:
  [SEGMENT_TYPE: title]
  HOST_NAME: dialogue
  HOST_NAME: dialogue
  [END_SEGMENT]
  
  Make it engaging, informative, and natural. Include:
  - Natural conversation flow
  - Questions and responses
  - Interesting insights
  - Smooth transitions between topics
  - Personal anecdotes or examples where appropriate
  
  Keep the tone professional yet accessible.`;

  try {
    // In a real implementation, you'd use OpenAI or another LLM API here
    // For now, I'll create a sample script structure
    return {
      title: `Podcast: ${topic}`,
      hosts,
      duration,
      segments: await generateSampleScript(topic, hosts, includeIntro, includeOutro),
      metadata: {
        createdAt: new Date().toISOString(),
        topic,
        style,
        estimatedDuration: duration
      }
    };
  } catch (error) {
    console.error("Error generating podcast script:", error);
    throw error;
  }
}

/**
 * Generate a sample script structure
 */
async function generateSampleScript(topic, hosts, includeIntro, includeOutro) {
  const [host1, host2] = hosts;
  const segments = [];

  if (includeIntro) {
    segments.push({
      type: "INTRO",
      title: "Welcome and Introduction",
      dialogue: [
        { speaker: host1, text: `Welcome to today's episode! I'm ${host1}, and I'm here with my co-host ${host2}.` },
        { speaker: host2, text: `Thanks ${host1}! Today we're diving deep into ${topic}, and I think our listeners are going to find this fascinating.` },
        { speaker: host1, text: `Absolutely! We've got a lot to cover, so let's jump right in.` }
      ]
    });
  }

  // Main content segments
  segments.push({
    type: "DISCUSSION",
    title: `Understanding ${topic}`,
    dialogue: [
      { speaker: host1, text: `So ${host2}, let's start with the basics. How would you explain ${topic} to someone who's never heard of it before?` },
      { speaker: host2, text: `That's a great question! ${topic} is essentially about... Well, think of it this way - it's like having a conversation, but with artificial intelligence that can understand context and nuance.` },
      { speaker: host1, text: `That's a perfect analogy! And what makes this particularly exciting is how it's transforming the way we interact with technology.` }
    ]
  });

  segments.push({
    type: "DISCUSSION",
    title: "Real-world Applications",
    dialogue: [
      { speaker: host2, text: `One thing I find fascinating is how this is being applied in the real world. Can you share some examples?` },
      { speaker: host1, text: `Absolutely! We're seeing applications in everything from customer service to creative content generation. It's really remarkable how versatile this technology has become.` },
      { speaker: host2, text: `And the potential for the future is even more exciting. What do you think we'll see in the next few years?` }
    ]
  });

  segments.push({
    type: "DISCUSSION",
    title: "Challenges and Considerations",
    dialogue: [
      { speaker: host1, text: `Of course, with any emerging technology, there are challenges we need to address. What are some of the key concerns?` },
      { speaker: host2, text: `That's crucial to discuss. Privacy, ethical considerations, and ensuring responsible development are all important factors.` },
      { speaker: host1, text: `Exactly. It's about finding the right balance between innovation and responsibility.` }
    ]
  });

  if (includeOutro) {
    segments.push({
      type: "OUTRO",
      title: "Wrap-up and Next Steps",
      dialogue: [
        { speaker: host2, text: `This has been such an enlightening conversation! Any final thoughts for our listeners?` },
        { speaker: host1, text: `I'd encourage everyone to stay curious and keep learning about these developments. The future is really exciting!` },
        { speaker: host2, text: `Couldn't agree more! Thanks for listening, and we'll see you next time!` }
      ]
    });
  }

  return segments;
}

/**
 * Convert script to audio using ElevenLabs
 * @param {Object} script - The podcast script object
 * @param {Object} voiceMapping - Mapping of speaker names to voice IDs
 * @param {Object} options - Audio generation options
 * @returns {Object} Audio generation results
 */
export async function generatePodcastAudio(script, voiceMapping = {}, options = {}) {
  const {
    outputFormat = "mp3_44100_128",
    modelId = "eleven_multilingual_v2",
    outputDir = path.join(__dirname, "../temp/podcasts"),
    addPauses = true,
    pauseDuration = 1000 // milliseconds
  } = options;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Map speakers to voices
  const defaultVoiceMapping = {
    [script.hosts[0]]: DEFAULT_VOICES.host1,
    [script.hosts[1]]: DEFAULT_VOICES.host2,
  };
  const finalVoiceMapping = { ...defaultVoiceMapping, ...voiceMapping };

  const audioSegments = [];
  const timestamp = Date.now();

  try {
    for (let segmentIndex = 0; segmentIndex < script.segments.length; segmentIndex++) {
      const segment = script.segments[segmentIndex];
      console.log(`Generating audio for segment: ${segment.title}`);

      const segmentAudios = [];

      for (let dialogueIndex = 0; dialogueIndex < segment.dialogue.length; dialogueIndex++) {
        const dialogue = segment.dialogue[dialogueIndex];
        const voiceId = finalVoiceMapping[dialogue.speaker] || DEFAULT_VOICES.host1;

        console.log(`Generating audio for ${dialogue.speaker}: "${dialogue.text.substring(0, 50)}..."`);

        try {
          // Generate audio for this dialogue
          const audio = await elevenlabs.textToSpeech.convert(voiceId, {
            text: dialogue.text,
            modelId,
            outputFormat
          });

          // Save the audio file
          const filename = `segment_${segmentIndex}_dialogue_${dialogueIndex}_${timestamp}.mp3`;
          const filepath = path.join(outputDir, filename);
          
          // Convert stream to buffer and save
          const audioBuffer = await streamToBuffer(audio);
          fs.writeFileSync(filepath, audioBuffer);

          segmentAudios.push({
            speaker: dialogue.speaker,
            text: dialogue.text,
            audioFile: filepath,
            filename,
            voiceId,
            duration: audioBuffer.length // Approximate duration
          });

          // Add pause between speakers if enabled
          if (addPauses && dialogueIndex < segment.dialogue.length - 1) {
            await new Promise(resolve => setTimeout(resolve, pauseDuration));
          }

        } catch (error) {
          console.error(`Error generating audio for dialogue ${dialogueIndex}:`, error);
          // Continue with next dialogue even if one fails
        }
      }

      audioSegments.push({
        segment: segment.title,
        type: segment.type,
        audios: segmentAudios
      });
    }

    // Generate metadata
    const podcastMetadata = {
      title: script.title,
      hosts: script.hosts,
      segments: audioSegments.length,
      totalAudioFiles: audioSegments.reduce((acc, seg) => acc + seg.audios.length, 0),
      generatedAt: new Date().toISOString(),
      outputDirectory: outputDir,
      voiceMapping: finalVoiceMapping,
      script: script
    };

    // Save metadata
    const metadataFile = path.join(outputDir, `podcast_metadata_${timestamp}.json`);
    fs.writeFileSync(metadataFile, JSON.stringify(podcastMetadata, null, 2));

    console.log(`Podcast generation completed! Metadata saved to: ${metadataFile}`);

    return {
      success: true,
      metadata: podcastMetadata,
      audioSegments,
      metadataFile,
      outputDirectory: outputDir
    };

  } catch (error) {
    console.error("Error generating podcast audio:", error);
    throw error;
  }
}

/**
 * Create a complete podcast from topic to audio
 * @param {string} topic - The podcast topic
 * @param {Object} options - All configuration options
 * @returns {Object} Complete podcast generation results
 */
export async function createCompletePodcast(topic, options = {}) {
  try {
    console.log(`Starting podcast creation for topic: ${topic}`);

    // Generate script
    console.log("Generating podcast script...");
    const script = await generatePodcastScript(topic, options.content, options.scriptOptions);

    // Generate audio
    console.log("Converting script to audio...");
    const audioResult = await generatePodcastAudio(script, options.voiceMapping, options.audioOptions);

    return {
      success: true,
      topic,
      script,
      audio: audioResult,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error creating complete podcast:", error);
    return {
      success: false,
      error: error.message,
      topic
    };
  }
}

/**
 * Get available voices from ElevenLabs
 * @returns {Array} List of available voices
 */
export async function getAvailableVoices() {
  try {
    const voices = await elevenlabs.voices.search();
    return voices.voices || [];
  } catch (error) {
    console.error("Error fetching voices:", error);
    return [];
  }
}

/**
 * Create a conversational podcast between two AI hosts using GenFM-style approach
 * @param {string} content - Content to discuss (can be text, URL, or topic)
 * @param {Object} options - Configuration options
 * @returns {Object} Podcast generation results
 */
export async function createConversationalPodcast(content, options = {}) {
  const {
    hostVoices = [DEFAULT_VOICES.host1, DEFAULT_VOICES.host2],
    hostNames = ["Alex", "Sarah"],
    style = "dynamic_discussion",
    duration = "10-15 minutes"
  } = options;

  try {
    // Use Studio API to create a conversational podcast
    console.log("Creating conversational podcast using ElevenLabs Studio...");
    
    const podcastResult = await elevenlabs.studio.createPodcast({
      modelId: "eleven_multilingual_v2",
      mode: {
        type: "conversation",
        conversation: {
          hostVoiceId: hostVoices[0],
          guestVoiceId: hostVoices[1]
        }
      },
      source: {
        type: "text",
        text: content
      }
    });

    return {
      success: true,
      studioPodcast: podcastResult,
      content,
      options,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error creating conversational podcast:", error);
    // Fallback to manual script generation
    return await createCompletePodcast(`Discussion about: ${content}`, options);
  }
}

/**
 * Utility function to convert stream to buffer
 * @param {Stream} stream - Audio stream
 * @returns {Buffer} Audio buffer
 */
async function streamToBuffer(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * Example usage and testing function
 */
export async function testPodcastGeneration() {
  try {
    console.log("Testing ElevenLabs podcast generation...");

    // Test 1: Get available voices
    console.log("\n1. Fetching available voices...");
    const voices = await getAvailableVoices();
    console.log(`Found ${voices.length} available voices`);
    
    if (voices.length > 0) {
      console.log("Sample voices:", voices.slice(0, 3).map(v => ({ name: v.name, id: v.voice_id })));
    }

    // Test 2: Generate a simple podcast script
    console.log("\n2. Generating podcast script...");
    const script = await generatePodcastScript("Artificial Intelligence in 2025", "", {
      hosts: ["Alex", "Sarah"],
      duration: "5-7 minutes",
      segments: 3
    });
    console.log("Script generated successfully!");
    console.log(`- Title: ${script.title}`);
    console.log(`- Hosts: ${script.hosts.join(", ")}`);
    console.log(`- Segments: ${script.segments.length}`);

    // Test 3: Generate audio for a short segment (if API key is configured)
    if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== "your_api_key_here") {
      console.log("\n3. Testing audio generation (first segment only)...");
      
      // Create a test script with just one short segment
      const testScript = {
        ...script,
        segments: [script.segments[0]]
      };

      const audioResult = await generatePodcastAudio(testScript, {}, {
        outputDir: path.join(__dirname, "../temp/test_podcast")
      });

      if (audioResult.success) {
        console.log("Audio generation test successful!");
        console.log(`- Audio files created: ${audioResult.audioSegments[0].audios.length}`);
        console.log(`- Output directory: ${audioResult.outputDirectory}`);
      }
    } else {
      console.log("\n3. Skipping audio generation test (API key not configured)");
      console.log("   Add ELEVENLABS_API_KEY to your .env file to test audio generation");
    }

    return {
      success: true,
      script,
      voices: voices.slice(0, 5) // Return first 5 voices as sample
    };

  } catch (error) {
    console.error("Error in test:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export default voices for reference
export { DEFAULT_VOICES };
