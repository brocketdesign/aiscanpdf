-- ============================================
-- AI Scan PDF - Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Documents Table ────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Scan',
  folder_id UUID,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  page_count INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  pdf_url TEXT,
  ocr_text TEXT,
  ai_summary TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  synced BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Folders Table ──────────────────────────
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#2563EB',
  icon TEXT NOT NULL DEFAULT 'folder-outline',
  document_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_is_favorite ON documents(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);

-- ─── Row Level Security ─────────────────────
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Documents: users can only access their own
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Folders: users can only access their own
CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Storage Buckets ────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('scans', 'scans', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload scans"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('scans', 'pdfs', 'thumbnails') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id IN ('scans', 'pdfs', 'thumbnails') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('scans', 'pdfs', 'thumbnails') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view uploaded files"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('scans', 'pdfs', 'thumbnails'));
