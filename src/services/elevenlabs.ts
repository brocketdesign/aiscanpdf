import { API_CONFIG } from '../config/api';

const { baseUrl, apiKey, defaultVoice } = API_CONFIG.elevenlabs;

export async function textToSpeechElevenLabs(
  text: string,
  voiceId: string = defaultVoice
): Promise<ArrayBuffer> {
  const response = await fetch(`${baseUrl}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: text.slice(0, 5000),
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS error: ${response.status}`);
  }
  return response.arrayBuffer();
}

export async function getVoices(): Promise<
  Array<{ voice_id: string; name: string; category: string }>
> {
  const response = await fetch(`${baseUrl}/voices`, {
    headers: { 'xi-api-key': apiKey },
  });
  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);
  const data = await response.json();
  return data.voices;
}
