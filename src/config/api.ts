export const API_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
    model: 'gpt-4o',
    visionModel: 'gpt-4o',
    ttsModel: 'tts-1-hd',
  },
  elevenlabs: {
    baseUrl: 'https://api.elevenlabs.io/v1',
    apiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '',
    defaultVoice: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  },
  falai: {
    baseUrl: 'https://fal.run',
    apiKey: process.env.EXPO_PUBLIC_FAL_AI_API_KEY ?? '',
  },
  xai: {
    baseUrl: 'https://api.x.ai/v1',
    apiKey: process.env.EXPO_PUBLIC_X_AI_API_KEY ?? '',
    model: 'grok-3',
  },
} as const;
