import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '../types';

const SETTINGS_KEY = 'app_settings';

const defaultSettings: AppSettings = {
  theme: 'system',
  defaultFilter: 'original',
  autoEnhance: true,
  defaultScanMode: 'single',
  autoOCR: true,
  hapticFeedback: true,
  cloudSync: true,
  imageQuality: 'high',
};

interface SettingsState extends AppSettings {
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppSettings>;
        set({ ...defaultSettings, ...parsed, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  updateSetting: async (key, value) => {
    set({ [key]: value } as any);
    const state = get();
    const settings: AppSettings = {
      theme: state.theme,
      defaultFilter: state.defaultFilter,
      autoEnhance: state.autoEnhance,
      defaultScanMode: state.defaultScanMode,
      autoOCR: state.autoOCR,
      hapticFeedback: state.hapticFeedback,
      cloudSync: state.cloudSync,
      imageQuality: state.imageQuality,
    };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  resetSettings: async () => {
    await AsyncStorage.removeItem(SETTINGS_KEY);
    set({ ...defaultSettings });
  },
}));
