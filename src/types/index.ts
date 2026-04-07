export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface ScannedPage {
  id: string;
  uri: string;
  thumbnail_uri?: string;
  width: number;
  height: number;
  filter: ImageFilter;
  rotation: number;
  order: number;
}

export type ImageFilter = 'original' | 'grayscale' | 'bw' | 'magic' | 'vivid';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  folder_id?: string;
  pages: ScannedPage[];
  page_count: number;
  thumbnail_url?: string;
  pdf_url?: string;
  ocr_text?: string;
  ai_summary?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  synced: boolean;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  document_count: number;
  created_at: string;
}

export interface AIAnalysis {
  summary: string;
  key_points: string[];
  document_type: string;
  language: string;
  sentiment?: string;
  entities?: Array<{ name: string; type: string }>;
}

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: Array<{
    text: string;
    bbox: { x: number; y: number; width: number; height: number };
  }>;
}

export type ScanMode = 'single' | 'batch' | 'auto';

export interface ScanSession {
  pages: ScannedPage[];
  mode: ScanMode;
  isProcessing: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultFilter: ImageFilter;
  autoEnhance: boolean;
  defaultScanMode: ScanMode;
  autoOCR: boolean;
  hapticFeedback: boolean;
  cloudSync: boolean;
  imageQuality: 'standard' | 'high' | 'maximum';
}

// ─── Subscription & Usage ───────────────────────────────────
export type SubscriptionPlan = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'none';
export type BillingPeriod = 'monthly' | 'yearly';

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  revenueCatUserId?: string;
  billing_period?: BillingPeriod;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface UsageCredits {
  scans_used: number;
  scans_limit: number;
  ocr_used: number;
  ocr_limit: number;
  summaries_used: number;
  summaries_limit: number;
  tts_used: number;
  tts_limit: number;
  qa_used: number;
  qa_limit: number;
  reset_date: string;
}

export const FREE_LIMITS: Omit<UsageCredits, 'scans_used' | 'ocr_used' | 'summaries_used' | 'tts_used' | 'qa_used' | 'reset_date'> = {
  scans_limit: 1,
  ocr_limit: 0,
  summaries_limit: 0,
  tts_limit: 0,
  qa_limit: 0,
};

export const PREMIUM_LIMITS: Omit<UsageCredits, 'scans_used' | 'ocr_used' | 'summaries_used' | 'tts_used' | 'qa_used' | 'reset_date'> = {
  scans_limit: 999999,
  ocr_limit: 999999,
  summaries_limit: 999999,
  tts_limit: 999999,
  qa_limit: 999999,
};
