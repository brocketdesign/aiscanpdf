import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { Text, useTheme, IconButton, ActivityIndicator, Portal, Modal } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useScanStore } from '../../../src/stores/scanStore';
import { GradientButton } from '../../../src/components/GradientButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScanScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const {
    pages,
    mode,
    isProcessing,
    flashEnabled,
    addPage,
    setMode,
    toggleFlash,
    clearSession,
  } = useScanStore();

  const [showModeSheet, setShowModeSheet] = useState(false);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isProcessing) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      await addPage(photo.uri);

      if (mode === 'single') {
        router.push('/preview');
      }
    } catch (err) {
      console.error('Capture error:', err);
    }
  }, [isProcessing, mode, addPage]);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: mode === 'batch',
    });
    if (!result.canceled) {
      for (const asset of result.assets) {
        await addPage(asset.uri);
      }
      if (mode === 'single') {
        router.push('/preview');
      }
    }
  }, [mode, addPage]);

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleLarge" style={{ fontWeight: '600', marginTop: 20, textAlign: 'center' }}>
            Camera Access Required
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}
          >
            We need camera access to scan your documents
          </Text>
          <View style={{ marginTop: 24, width: '100%' }}>
            <GradientButton title="Grant Permission" onPress={requestPermission} size="lg" />
          </View>
          <Pressable onPress={pickImage} style={{ marginTop: 16 }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
              Or import from gallery
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flashEnabled ? 'on' : 'off'}
      />

      {/* Top Controls */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <IconButton
          icon="close"
          iconColor="#FFF"
          size={24}
          onPress={() => {
            clearSession();
            router.back();
          }}
        />
        <View style={styles.topCenter}>
          <Pressable
            style={[styles.modeChip, mode === 'single' && styles.modeChipActive]}
            onPress={() => setMode('single')}
          >
            <Text style={[styles.modeText, mode === 'single' && styles.modeTextActive]}>
              Single
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeChip, mode === 'batch' && styles.modeChipActive]}
            onPress={() => setMode('batch')}
          >
            <Text style={[styles.modeText, mode === 'batch' && styles.modeTextActive]}>
              Batch
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeChip, mode === 'auto' && styles.modeChipActive]}
            onPress={() => setMode('auto')}
          >
            <Text style={[styles.modeText, mode === 'auto' && styles.modeTextActive]}>
              Auto
            </Text>
          </Pressable>
        </View>
        <IconButton
          icon={flashEnabled ? 'flash' : 'flash-off'}
          iconColor="#FFF"
          size={24}
          onPress={toggleFlash}
        />
      </View>

      {/* Scan Frame Guide */}
      <View style={styles.frameGuide}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* Gallery */}
        <Pressable onPress={pickImage} style={styles.sideButton}>
          <Ionicons name="images-outline" size={28} color="#FFF" />
          <Text style={styles.sideLabel}>Gallery</Text>
        </Pressable>

        {/* Capture */}
        <Pressable onPress={takePicture} disabled={isProcessing} style={styles.captureOuter}>
          {isProcessing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <View style={styles.captureInner} />
          )}
        </Pressable>

        {/* Page Count / Done */}
        <Pressable
          onPress={() => pages.length > 0 && router.push('/preview')}
          style={styles.sideButton}
        >
          {pages.length > 0 ? (
            <View style={styles.pageCountBadge}>
              <Text style={styles.pageCountText}>{pages.length}</Text>
            </View>
          ) : (
            <View style={{ width: 28, height: 28 }} />
          )}
          <Text style={styles.sideLabel}>{pages.length > 0 ? 'Done' : ''}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const CORNER_SIZE = 30;
const CORNER_BORDER = 3;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionBox: {
    alignItems: 'center',
    maxWidth: 300,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  topCenter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 3,
  },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 17,
  },
  modeChipActive: {
    backgroundColor: '#FFF',
  },
  modeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#000',
  },
  frameGuide: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH * 0.08,
    right: SCREEN_WIDTH * 0.08,
    bottom: SCREEN_HEIGHT * 0.25,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
    borderColor: '#FFF',
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
    borderColor: '#FFF',
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_BORDER,
    borderLeftWidth: CORNER_BORDER,
    borderColor: '#FFF',
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_BORDER,
    borderRightWidth: CORNER_BORDER,
    borderColor: '#FFF',
    borderBottomRightRadius: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sideButton: {
    alignItems: 'center',
    width: 60,
  },
  sideLabel: {
    color: '#FFF',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF',
  },
  pageCountBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageCountText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
