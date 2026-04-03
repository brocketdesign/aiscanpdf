import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscriptionStore } from '../stores/subscriptionStore';

interface UsageBadgeProps {
  feature: 'scans' | 'ocr' | 'summaries' | 'tts' | 'qa';
  compact?: boolean;
}

export function UsageBadge({ feature, compact = false }: UsageBadgeProps) {
  const theme = useTheme();
  const { isPremium, getRemainingCredits } = useSubscriptionStore();

  if (isPremium()) {
    if (compact) return null;
    return (
      <View style={[styles.badge, { backgroundColor: '#7C3AED20' }]}>
        <Ionicons name="diamond" size={12} color="#7C3AED" />
        <Text style={[styles.badgeText, { color: '#7C3AED' }]}>PRO</Text>
      </View>
    );
  }

  const remaining = getRemainingCredits(feature);
  const isLow = remaining <= 1;
  const isExhausted = remaining === 0;

  const bgColor = isExhausted
    ? theme.colors.errorContainer
    : isLow
    ? '#FEF3C7'
    : theme.colors.surfaceVariant;

  const textColor = isExhausted
    ? theme.colors.error
    : isLow
    ? '#92400E'
    : theme.colors.onSurfaceVariant;

  return (
    <Pressable
      onPress={() => {
        if (isExhausted) {
          router.push('/premium');
        }
      }}
      style={[styles.badge, { backgroundColor: bgColor }]}
    >
      {isExhausted ? (
        <Ionicons name="lock-closed" size={11} color={textColor} />
      ) : null}
      <Text style={[styles.badgeText, { color: textColor }]}>
        {isExhausted ? 'Upgrade' : `${remaining} left`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
