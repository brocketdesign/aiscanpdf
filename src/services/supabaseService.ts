import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import type { Document, Folder, User } from '../types';

// ─── Auth ───────────────────────────────────────────────────
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// ─── Documents ──────────────────────────────────────────────
export async function fetchDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createDocument(doc: Omit<Document, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('documents').insert(doc).select().single();
  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, updates: Partial<Document>) {
  const { data, error } = await supabase
    .from('documents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
}

export async function searchDocuments(userId: string, query: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,ocr_text.ilike.%${query}%,tags.cs.{${query}}`)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Folders ────────────────────────────────────────────────
export async function fetchFolders(userId: string): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createFolder(folder: Omit<Folder, 'id' | 'created_at' | 'document_count'>) {
  const { data, error } = await supabase.from('folders').insert(folder).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFolder(id: string) {
  const { error } = await supabase.from('folders').delete().eq('id', id);
  if (error) throw error;
}

// ─── Storage ────────────────────────────────────────────────
export async function uploadFile(
  bucket: string,
  path: string,
  fileUri: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, decode(base64), { contentType, upsert: true });
  if (error) throw error;
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function getPublicUrl(bucket: string, path: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}
