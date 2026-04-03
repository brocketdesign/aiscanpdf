import { create } from 'zustand';
import type { Document, Folder } from '../types';
import * as supabaseService from '../services/supabaseService';

interface DocumentState {
  documents: Document[];
  folders: Folder[];
  selectedDocument: Document | null;
  isLoading: boolean;
  searchQuery: string;

  loadDocuments: (userId: string) => Promise<void>;
  loadFolders: (userId: string) => Promise<void>;
  addDocument: (doc: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setSelectedDocument: (doc: Document | null) => void;
  setSearchQuery: (query: string) => void;
  searchDocuments: (userId: string, query: string) => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id' | 'created_at' | 'document_count'>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  folders: [],
  selectedDocument: null,
  isLoading: false,
  searchQuery: '',

  loadDocuments: async (userId) => {
    set({ isLoading: true });
    try {
      const documents = await supabaseService.fetchDocuments(userId);
      set({ documents });
    } finally {
      set({ isLoading: false });
    }
  },

  loadFolders: async (userId) => {
    try {
      const folders = await supabaseService.fetchFolders(userId);
      set({ folders });
    } catch (err) {
      console.error('Failed to load folders:', err);
    }
  },

  addDocument: async (doc) => {
    const newDoc = await supabaseService.createDocument(doc);
    set((state) => ({ documents: [newDoc, ...state.documents] }));
    return newDoc;
  },

  updateDocument: async (id, updates) => {
    const updatedDoc = await supabaseService.updateDocument(id, updates);
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? updatedDoc : d)),
      selectedDocument: state.selectedDocument?.id === id ? updatedDoc : state.selectedDocument,
    }));
  },

  deleteDocument: async (id) => {
    await supabaseService.deleteDocument(id);
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      selectedDocument: state.selectedDocument?.id === id ? null : state.selectedDocument,
    }));
  },

  toggleFavorite: async (id) => {
    const doc = get().documents.find((d) => d.id === id);
    if (doc) {
      await supabaseService.updateDocument(id, { is_favorite: !doc.is_favorite });
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? { ...d, is_favorite: !d.is_favorite } : d
        ),
      }));
    }
  },

  setSelectedDocument: (doc) => set({ selectedDocument: doc }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  searchDocuments: async (userId, query) => {
    set({ isLoading: true });
    try {
      const documents = await supabaseService.searchDocuments(userId, query);
      set({ documents });
    } finally {
      set({ isLoading: false });
    }
  },

  addFolder: async (folder) => {
    const newFolder = await supabaseService.createFolder(folder);
    set((state) => ({ folders: [...state.folders, newFolder] }));
  },

  deleteFolder: async (id) => {
    await supabaseService.deleteFolder(id);
    set((state) => ({ folders: state.folders.filter((f) => f.id !== id) }));
  },
}));
