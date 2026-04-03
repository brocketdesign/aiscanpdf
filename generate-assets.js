const fs = require('fs');
const path = require('path');
const https = require('https');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const API_KEY = process.env.EXPO_PUBLIC_X_AI_API_KEY;
const API_URL = 'https://api.x.ai/v1/images/generations';

const STORE_ASSETS_DIR = path.join(__dirname, 'store-assets');
const ASSETS_DIR = path.join(__dirname, 'assets');

// Ensure directories exist
if (!fs.existsSync(STORE_ASSETS_DIR)) fs.mkdirSync(STORE_ASSETS_DIR, { recursive: true });

function generateImage(prompt, aspectRatio) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'grok-imagine-image',
      prompt,
      n: 1,
      ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}),
    });

    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data[0] && json.data[0].url) {
            resolve(json.data[0].url);
          } else {
            reject(new Error('No image URL in response: ' + data));
          }
        } catch (e) {
          reject(new Error('Failed to parse response: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        https.get(res.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', reject);
  });
}

async function main() {
  if (!API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_X_AI_API_KEY environment variable.');
  }

  const tasks = [
    // 1. App Icon / Logo
    {
      name: 'icon',
      filename: 'icon.png',
      dir: ASSETS_DIR,
      aspectRatio: '1:1',
      prompt: `Design a modern, clean app icon for "AI Scan PDF" - a document scanning app with AI features. The icon should feature a stylized document/page with a scanner beam or AI sparkle effect. Use a gradient from electric blue (#2563EB) to purple (#7C3AED) on a deep navy background (#0A0E27). Minimalist flat design, suitable for iOS and Android app stores. No text on the icon. The design should convey document scanning and artificial intelligence.`,
    },
    {
      name: 'adaptive-icon',
      filename: 'adaptive-icon.png',
      dir: ASSETS_DIR,
      aspectRatio: '1:1',
      prompt: `Design a modern, clean Android adaptive app icon foreground for "AI Scan PDF" - a document scanning app. Feature a stylized document with an AI scanning beam effect. Use electric blue (#2563EB) to purple (#7C3AED) gradient. Centered design with safe zone padding for adaptive icon format. Deep navy background (#0A0E27). Minimalist flat design, no text. Conveys document scanning and AI intelligence.`,
    },
    // 2. Store Preview Images (phone screenshots mockups) - 9:19.5 ratio for modern phones
    {
      name: 'preview-1-home',
      filename: 'preview-1-home.png',
      dir: STORE_ASSETS_DIR,
      aspectRatio: '9:19.5',
      prompt: `App store screenshot mockup for "AI Scan PDF" app. Show a modern smartphone screen displaying a document management home screen with a dark theme (background #0A0E27). The screen shows: a greeting "Good morning" at top, a search bar, "Recent Documents" section with document card thumbnails showing PDF previews, and a "Folders" section with colorful folder cards. Navigation bar at bottom with Home, Scan, Settings tabs. Blue (#2563EB) and purple (#7C3AED) accent colors. Clean modern UI design. Header text at top: "All Your Documents, Organized" in white bold text.`,
    },
    {
      name: 'preview-2-scan',
      filename: 'preview-2-scan.png',
      dir: STORE_ASSETS_DIR,
      aspectRatio: '9:19.5',
      prompt: `App store screenshot mockup for "AI Scan PDF" app. Show a modern smartphone screen displaying a camera scanning view with dark theme. The screen shows a live camera viewfinder with a document detection overlay (blue corner markers highlighting a document on a desk). Bottom controls show: a gallery button, a large capture button with blue (#2563EB) ring, and a flash toggle. Top shows scan mode selector "Single | Batch | Auto". Clean modern UI. Header text at top of mockup: "Scan Documents Instantly" in white bold text on dark navy (#0A0E27) background.`,
    },
    {
      name: 'preview-3-ai',
      filename: 'preview-3-ai.png',
      dir: STORE_ASSETS_DIR,
      aspectRatio: '9:19.5',
      prompt: `App store screenshot mockup for "AI Scan PDF" app. Show a modern smartphone screen displaying AI analysis results of a scanned document with dark theme (background #0A0E27). The screen shows: a scanned document thumbnail at top, then AI-generated summary text, key points as bullet items, detected document type badge, language badge, and extracted entities. Purple (#7C3AED) and blue (#2563EB) accent colors for badges and highlights. Clean modern UI design. Header text at top: "AI-Powered Analysis" in white bold text.`,
    },
    {
      name: 'preview-4-ocr',
      filename: 'preview-4-ocr.png',
      dir: STORE_ASSETS_DIR,
      aspectRatio: '9:19.5',
      prompt: `App store screenshot mockup for "AI Scan PDF" app. Show a modern smartphone screen displaying OCR text extraction from a scanned document with dark theme (background #0A0E27). Split screen view: top half shows the scanned document image, bottom half shows extracted text with high confidence score "98.5%". Blue (#2563EB) highlight on text blocks being recognized. Action buttons: Copy, Share, Export as PDF. Clean modern UI. Header text at top: "Extract Text with OCR" in white bold text.`,
    },
    {
      name: 'preview-5-export',
      filename: 'preview-5-export.png',
      dir: STORE_ASSETS_DIR,
      aspectRatio: '9:19.5',
      prompt: `App store screenshot mockup for "AI Scan PDF" app. Show a modern smartphone screen displaying document export and sharing options with dark theme (background #0A0E27). The screen shows: a PDF preview of a multi-page scanned document, export format options (PDF, JPG, PNG), quality selector, cloud sync toggle with Supabase, and share buttons for email and other apps. Blue (#2563EB) primary buttons and purple (#7C3AED) secondary elements. A gradient button "Export PDF" at the bottom. Clean modern UI. Header text at top: "Export & Share Anywhere" in white bold text.`,
    },
  ];

  console.log(`Generating ${tasks.length} images via Grok API...\n`);

  for (const task of tasks) {
    console.log(`[${task.name}] Generating...`);
    try {
      const imageUrl = await generateImage(task.prompt, task.aspectRatio);
      console.log(`[${task.name}] Got URL: ${imageUrl}`);

      const filepath = path.join(task.dir, task.filename);
      await downloadImage(imageUrl, filepath);
      console.log(`[${task.name}] Saved to: ${filepath}\n`);
    } catch (err) {
      console.error(`[${task.name}] ERROR: ${err.message}\n`);
    }
  }

  // Also generate splash screen
  console.log('[splash] Generating...');
  try {
    const splashUrl = await generateImage(
      `A splash screen for "AI Scan PDF" app. Dark navy background (#0A0E27). Centered app logo: a stylized document icon with AI scanning beam, using blue (#2563EB) to purple (#7C3AED) gradient. Below the icon, the text "AI Scan PDF" in clean white modern font. Minimalist design, no other elements. The overall feel should be premium and tech-forward.`,
      '9:19.5'
    );
    console.log(`[splash] Got URL: ${splashUrl}`);
    await downloadImage(splashUrl, path.join(ASSETS_DIR, 'splash.png'));
    console.log(`[splash] Saved to: ${path.join(ASSETS_DIR, 'splash.png')}\n`);
  } catch (err) {
    console.error(`[splash] ERROR: ${err.message}\n`);
  }

  console.log('Done! All images generated.');
}

main().catch(console.error);
