import { API_CONFIG } from '../config/api';
import type { AIAnalysis } from '../types';

const { baseUrl, apiKey, model, visionModel, ttsModel } = API_CONFIG.openai;

async function openaiRequest(endpoint: string, body: object) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${response.status} - ${err}`);
  }
  return response.json();
}

export async function extractTextFromImage(base64Image: string): Promise<string> {
  const result = await openaiRequest('/chat/completions', {
    model: visionModel,
    messages: [
      {
        role: 'system',
        content:
          'You are an advanced OCR system. Extract ALL text from the provided document image. Preserve formatting, paragraph breaks, and structure. Return only the extracted text with no commentary.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all text from this scanned document image.' },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' },
          },
        ],
      },
    ],
    max_tokens: 4096,
  });
  return result.choices[0].message.content;
}

export async function analyzeDocument(text: string): Promise<AIAnalysis> {
  const result = await openaiRequest('/chat/completions', {
    model,
    messages: [
      {
        role: 'system',
        content: `You are a document analysis expert. Analyze the provided document text and return a JSON object with:
- summary: A concise 2-3 sentence summary
- key_points: Array of up to 5 key takeaways
- document_type: The type of document (invoice, contract, letter, receipt, form, report, article, other)
- language: The detected language
- sentiment: The overall tone (neutral, positive, negative, formal, informal)
- entities: Array of objects with name and type (person, organization, date, amount, location)
Return ONLY valid JSON, no markdown.`,
      },
      { role: 'user', content: text },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2048,
  });
  return JSON.parse(result.choices[0].message.content);
}

export async function summarizeDocument(text: string): Promise<string> {
  const result = await openaiRequest('/chat/completions', {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a document summarizer. Provide a clear, concise summary of the document. Use bullet points for key items. Keep it under 200 words.',
      },
      { role: 'user', content: `Summarize this document:\n\n${text}` },
    ],
    max_tokens: 1024,
  });
  return result.choices[0].message.content;
}

export async function askDocumentQuestion(text: string, question: string): Promise<string> {
  const result = await openaiRequest('/chat/completions', {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful document assistant. Answer questions about the provided document accurately and concisely. If the answer is not in the document, say so.',
      },
      { role: 'user', content: `Document:\n${text}\n\nQuestion: ${question}` },
    ],
    max_tokens: 1024,
  });
  return result.choices[0].message.content;
}

export async function translateDocument(text: string, targetLanguage: string): Promise<string> {
  const result = await openaiRequest('/chat/completions', {
    model,
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the following document text to ${targetLanguage}. Preserve formatting and structure.`,
      },
      { role: 'user', content: text },
    ],
    max_tokens: 4096,
  });
  return result.choices[0].message.content;
}

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const response = await fetch(`${baseUrl}/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: ttsModel,
      input: text.slice(0, 4096),
      voice: 'nova',
      response_format: 'mp3',
    }),
  });
  if (!response.ok) {
    throw new Error(`TTS error: ${response.status}`);
  }
  return response.arrayBuffer();
}
