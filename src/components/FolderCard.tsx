import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { Folder } from '../types';

interface FolderCardProps {
  folder: Folder;
  onPress: () => void;
  onLongPress?: () => void;
}

export function FolderCard({ folder, onPress, onLongPress }: FolderCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: folder.color + '20' }]}>
        <Ionicons name={folder.icon as any} size={24} color={folder.color} />
      </View>
      <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: '600', marginTop: 8 }}>
        {folder.name}
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
        {folder.document_count} {folder.document_count === 1 ? 'item' : 'items'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
