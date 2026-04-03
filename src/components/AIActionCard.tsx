import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface AIActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  loading?: boolean;
  color?: string;
}

export function AIActionCard({
  icon,
  title,
  subtitle,
  onPress,
  loading = false,
  color,
}: AIActionCardProps) {
  const theme = useTheme();
  const accentColor = color ?? theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: accentColor + '15' }]}>
        {loading ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <Ionicons name={icon as any} size={22} color={accentColor} />
        )}
      </View>
      <View style={styles.content}>
        <Text variant="titleSmall" style={{ fontWeight: '600' }}>
          {title}
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
