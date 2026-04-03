import { create } from 'zustand';
import type { ScannedPage, ScanMode, ImageFilter } from '../types';
import * as imageProcessing from '../services/imageProcessing';

interface ScanState {
  pages: ScannedPage[];
  mode: ScanMode;
  currentFilter: ImageFilter;
  isProcessing: boolean;
  flashEnabled: boolean;

  addPage: (uri: string) => Promise<void>;
  removePage: (id: string) => void;
  reorderPages: (pages: ScannedPage[]) => void;
  setFilter: (filter: ImageFilter) => void;
  applyFilterToPage: (pageId: string, filter: ImageFilter) => Promise<void>;
  rotatePage: (pageId: string) => Promise<void>;
  setMode: (mode: ScanMode) => void;
  toggleFlash: () => void;
  clearSession: () => void;
}

let pageCounter = 0;

export const useScanStore = create<ScanState>((set, get) => ({
  pages: [],
  mode: 'single',
  currentFilter: 'original',
  isProcessing: false,
  flashEnabled: false,

  addPage: async (uri) => {
    set({ isProcessing: true });
    try {
      const savedUri = await imageProcessing.saveScannedImage(uri);
      const thumbUri = await imageProcessing.createThumbnail(savedUri);
      const newPage: ScannedPage = {
        id: `page_${++pageCounter}_${Date.now()}`,
        uri: savedUri,
        thumbnail_uri: thumbUri,
        width: 0,
        height: 0,
        filter: get().currentFilter,
        rotation: 0,
        order: get().pages.length,
      };
      set((state) => ({ pages: [...state.pages, newPage] }));
    } finally {
      set({ isProcessing: false });
    }
  },

  removePage: (id) => {
    set((state) => ({
      pages: state.pages
        .filter((p) => p.id !== id)
        .map((p, i) => ({ ...p, order: i })),
    }));
  },

  reorderPages: (pages) => set({ pages }),

  setFilter: (filter) => set({ currentFilter: filter }),

  applyFilterToPage: async (pageId, filter) => {
    set({ isProcessing: true });
    try {
      const page = get().pages.find((p) => p.id === pageId);
      if (!page) return;
      const filteredUri = await imageProcessing.applyFilter(page.uri, filter);
      set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId ? { ...p, uri: filteredUri, filter } : p
        ),
      }));
    } finally {
      set({ isProcessing: false });
    }
  },

  rotatePage: async (pageId) => {
    set({ isProcessing: true });
    try {
      const page = get().pages.find((p) => p.id === pageId);
      if (!page) return;
      const newRotation = (page.rotation + 90) % 360;
      const rotatedUri = await imageProcessing.rotateImage(page.uri, 90);
      set((state) => ({
        pages: state.pages.map((p) =>
          p.id === pageId ? { ...p, uri: rotatedUri, rotation: newRotation } : p
        ),
      }));
    } finally {
      set({ isProcessing: false });
    }
  },

  setMode: (mode) => set({ mode }),
  toggleFlash: () => set((state) => ({ flashEnabled: !state.flashEnabled })),
  clearSession: () => set({ pages: [], isProcessing: false }),
}));
