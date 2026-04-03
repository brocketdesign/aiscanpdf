import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { Text, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useScanStore } from '../src/stores/scanStore';
import { useDocumentStore } from '../src/stores/documentStore';
import { useAuthStore } from '../src/stores/authStore';
import { GradientButton } from '../src/components/GradientButton';
import * as imageProcessing from '../src/services/imageProcessing';
import type { ImageFilter } from '../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMB_SIZE = 64;

const FILTERS: { key: ImageFilter; label: string; icon: string }[] = [
  { key: 'original', label: 'Original', icon: 'image-outline' },
  { key: 'magic', label: 'Magic', icon: 'color-wand-outline' },
  { key: 'grayscale', label: 'Gray', icon: 'contrast-outline' },
  { key: 'bw', label: 'B&W', icon: 'moon-outline' },
  { key: 'vivid', label: 'Vivid', icon: 'sunny-outline' },
];

export default function PreviewScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { pages, isProcessing, removePage, rotatePage, applyFilterToPage, clearSession } =
    useScanStore();
  const { addDocument } = useDocumentStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const activePage = pages[activeIndex];

  const handleSave = async () => {
    if (!user || pages.length === 0) return;
    setSaving(true);
    try {
      const doc = await addDocument({
        user_id: user.id,
        title: `Scan ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        pages: pages,
        page_count: pages.length,
        thumbnail_url: pages[0]?.thumbnail_uri,
        tags: [],
        is_favorite: false,
        synced: false,
      });
      clearSession();
      router.replace(`/document/${doc.id}`);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (pages.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge">No pages scanned</Text>
        <GradientButton title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ fontWeight: '600' }}>
          Preview ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
        </Text>
        <IconButton
          icon="plus"
          size={24}
          onPress={() => router.push('/(tabs)/scan')}
        />
      </View>

      {/* Main Image */}
      <View style={styles.imageContainer}>
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        )}
        {activePage && (
          <Image
            source={{ uri: activePage.uri }}
            style={styles.mainImage}
            contentFit="contain"
            transition={200}
          />
        )}
      </View>

      {/* Page Thumbnails */}
      {pages.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {pages.map((page, index) => (
            <Pressable
              key={page.id}
              onPress={() => setActiveIndex(index)}
              style={[
                styles.thumb,
                index === activeIndex && { borderColor: theme.colors.primary, borderWidth: 2 },
              ]}
            >
              <Image
                source={{ uri: page.thumbnail_uri ?? page.uri }}
                style={styles.thumbImage}
                contentFit="cover"
              />
              <View style={styles.thumbBadge}>
                <Text style={styles.thumbBadgeText}>{index + 1}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Edit Tools */}
      <View style={[styles.toolbar, { backgroundColor: theme.colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
          <Pressable
            style={styles.toolButton}
            onPress={() => activePage && rotatePage(activePage.id)}
          >
            <Ionicons name="refresh-outline" size={22} color={theme.colors.onSurface} />
            <Text variant="labelSmall" style={{ marginTop: 4 }}>Rotate</Text>
          </Pressable>
          <Pressable
            style={styles.toolButton}
            onPress={() => activePage && removePage(activePage.id)}
          >
            <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
            <Text variant="labelSmall" style={{ marginTop: 4, color: theme.colors.error }}>Delete</Text>
          </Pressable>
          <View style={styles.filterDivider} />
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.filterChip,
                activePage?.filter === f.key && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              onPress={() => activePage && applyFilterToPage(activePage.id, f.key)}
            >
              <Ionicons
                name={f.icon as any}
                size={18}
                color={
                  activePage?.filter === f.key
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
              />
              <Text
                variant="labelSmall"
                style={{
                  marginTop: 2,
                  color:
                    activePage?.filter === f.key
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Save Button */}
      <View style={[styles.saveBar, { paddingBottom: insets.bottom + 12 }]}>
        <GradientButton
          title={saving ? 'Saving...' : 'Save Document'}
          onPress={handleSave}
          loading={saving}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  imageContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainImage: {
    flex: 1,
    borderRadius: 12,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE * 1.3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  thumbBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  toolbar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  toolbarScroll: {
    paddingHorizontal: 16,
    gap: 4,
    alignItems: 'flex-start',
  },
  toolButton: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 6,
    alignSelf: 'center',
  },
  filterChip: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
