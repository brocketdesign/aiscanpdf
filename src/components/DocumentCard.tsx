import React from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Document } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface DocumentCardProps {
  document: Document;
  onPress: () => void;
  onLongPress?: () => void;
  variant?: 'grid' | 'list';
}

export function DocumentCard({ document, onPress, onLongPress, variant = 'grid' }: DocumentCardProps) {
  const theme = useTheme();

  if (variant === 'list') {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.listCard,
          { backgroundColor: theme.colors.surface },
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.listThumbnail, { backgroundColor: theme.colors.surfaceVariant }]}>
          {document.thumbnail_url ? (
            <Image
              source={{ uri: document.thumbnail_url }}
              style={styles.listImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <Ionicons name="document-text-outline" size={28} color={theme.colors.primary} />
          )}
        </View>
        <View style={styles.listContent}>
          <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: '600' }}>
            {document.title}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            {document.page_count} {document.page_count === 1 ? 'page' : 'pages'} ·{' '}
            {new Date(document.updated_at).toLocaleDateString()}
          </Text>
          {document.tags.length > 0 && (
            <View style={styles.tags}>
              {document.tags.slice(0, 2).map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: theme.colors.primaryContainer }]}
                >
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onPrimaryContainer, fontSize: 10 }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.listActions}>
          {document.is_favorite && (
            <Ionicons name="heart" size={16} color={theme.colors.error} />
          )}
          <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceVariant} />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.gridCard,
        { backgroundColor: theme.colors.surface, width: CARD_WIDTH },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.gridThumbnail, { backgroundColor: theme.colors.surfaceVariant }]}>
        {document.thumbnail_url ? (
          <Image
            source={{ uri: document.thumbnail_url }}
            style={styles.gridImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Ionicons name="document-text-outline" size={40} color={theme.colors.primary} />
        )}
        {document.is_favorite && (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={14} color="#EF4444" />
          </View>
        )}
      </View>
      <View style={styles.gridContent}>
        <Text variant="labelLarge" numberOfLines={1} style={{ fontWeight: '600' }}>
          {document.title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          {document.page_count} pg · {new Date(document.updated_at).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 16,
  },
  gridThumbnail: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridContent: {
    padding: 12,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  listThumbnail: {
    width: 56,
    height: 72,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
