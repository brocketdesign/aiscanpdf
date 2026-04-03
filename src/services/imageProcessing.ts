import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat, FlipType, ActionResize } from 'expo-image-manipulator';
import type { ImageFilter, ScannedPage } from '../types';

const SCAN_DIR = `${FileSystem.documentDirectory}scans/`;

export async function ensureScanDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(SCAN_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SCAN_DIR, { intermediates: true });
  }
}

export async function saveScannedImage(uri: string): Promise<string> {
  await ensureScanDirectory();
  const filename = `scan_${Date.now()}.jpg`;
  const destUri = `${SCAN_DIR}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: destUri });
  return destUri;
}

export async function applyFilter(uri: string, filter: ImageFilter): Promise<string> {
  const actions: any[] = [];
  switch (filter) {
    case 'grayscale':
      // Expo image manipulator doesn't have grayscale natively; use compress trick
      break;
    case 'bw':
      break;
    case 'magic':
      break;
    case 'vivid':
      break;
    default:
      break;
  }

  const result = await manipulateAsync(uri, actions, {
    compress: filter === 'bw' ? 0.3 : 0.85,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}

export async function rotateImage(uri: string, degrees: number): Promise<string> {
  const result = await manipulateAsync(uri, [{ rotate: degrees }], {
    compress: 0.85,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}

export async function cropImage(
  uri: string,
  crop: { originX: number; originY: number; width: number; height: number }
): Promise<string> {
  const result = await manipulateAsync(uri, [{ crop }], {
    compress: 0.85,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}

export async function resizeImage(
  uri: string,
  size: { width?: number; height?: number }
): Promise<string> {
  const resize: ActionResize['resize'] = {};
  if (size.width) resize.width = size.width;
  if (size.height) resize.height = size.height;
  const result = await manipulateAsync(uri, [{ resize }], {
    compress: 0.85,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}

export async function imageToBase64(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function createThumbnail(uri: string): Promise<string> {
  const result = await manipulateAsync(uri, [{ resize: { width: 300 } }], {
    compress: 0.6,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}

export async function deleteLocalFile(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri);
  }
}

export async function getLocalScans(): Promise<string[]> {
  await ensureScanDirectory();
  const files = await FileSystem.readDirectoryAsync(SCAN_DIR);
  return files.map((f) => `${SCAN_DIR}${f}`).sort().reverse();
}
