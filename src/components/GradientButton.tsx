import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import type { MD3Theme } from 'react-native-paper';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
  size = 'md',
}: GradientButtonProps) {
  const theme = useTheme();
  const styles = makeStyles(theme, size);

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.outlineButton,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.outlineText, { color: theme.colors.primary }]}>{title}</Text>
      </Pressable>
    );
  }

  const colors =
    variant === 'primary'
      ? (['#2563EB', '#7C3AED'] as const)
      : (['#7C3AED', '#EC4899'] as const);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={styles.gradientText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const makeStyles = (theme: MD3Theme, size: string) =>
  StyleSheet.create({
    gradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: size === 'lg' ? 16 : 12,
      paddingVertical: size === 'sm' ? 10 : size === 'lg' ? 18 : 14,
      paddingHorizontal: size === 'sm' ? 16 : size === 'lg' ? 32 : 24,
    },
    gradientText: {
      color: '#FFFFFF',
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontWeight: '600',
    },
    outlineButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: size === 'lg' ? 16 : 12,
      paddingVertical: size === 'sm' ? 10 : size === 'lg' ? 18 : 14,
      paddingHorizontal: size === 'sm' ? 16 : size === 'lg' ? 32 : 24,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    outlineText: {
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontWeight: '600',
    },
    iconContainer: {
      marginRight: 8,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    disabled: {
      opacity: 0.5,
    },
  });
