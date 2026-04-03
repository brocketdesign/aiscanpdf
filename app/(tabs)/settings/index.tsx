import React from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { Text, useTheme, Switch, Divider, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/stores/authStore';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import { LinearGradient } from 'expo-linear-gradient';

function SettingRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  color,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        pressed && onPress && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: (color ?? theme.colors.primary) + '15' }]}>
        <Ionicons name={icon as any} size={20} color={color ?? theme.colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text variant="bodyLarge" style={{ fontWeight: '500' }}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 1 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceVariant} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuthStore();
  const settings = useSettingsStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Pressable style={styles.profileSection}>
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700' }}>
              {(user?.full_name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
              {user?.full_name ?? 'User'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {user?.email}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceVariant} />
        </Pressable>

        {/* Scan Settings */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            SCANNING
          </Text>
          <View style={[styles.settingGroup, { backgroundColor: theme.colors.surface }]}>
            <SettingRow
              icon="color-wand-outline"
              title="Auto Enhance"
              subtitle="Automatically optimize scanned images"
              right={
                <Switch
                  value={settings.autoEnhance}
                  onValueChange={(v) => settings.updateSetting('autoEnhance', v)}
                />
              }
            />
            <Divider style={{ marginLeft: 60 }} />
            <SettingRow
              icon="text-outline"
              title="Auto OCR"
              subtitle="Extract text after scanning"
              right={
                <Switch
                  value={settings.autoOCR}
                  onValueChange={(v) => settings.updateSetting('autoOCR', v)}
                />
              }
            />
            <Divider style={{ marginLeft: 60 }} />
            <SettingRow
              icon="image-outline"
              title="Image Quality"
              subtitle={settings.imageQuality.charAt(0).toUpperCase() + settings.imageQuality.slice(1)}
              onPress={() => {
                const next = settings.imageQuality === 'standard' ? 'high' : settings.imageQuality === 'high' ? 'maximum' : 'standard';
                settings.updateSetting('imageQuality', next);
              }}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            APP
          </Text>
          <View style={[styles.settingGroup, { backgroundColor: theme.colors.surface }]}>
            <SettingRow
              icon="moon-outline"
              title="Theme"
              subtitle={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
              onPress={() => {
                const next = settings.theme === 'system' ? 'light' : settings.theme === 'light' ? 'dark' : 'system';
                settings.updateSetting('theme', next);
              }}
            />
            <Divider style={{ marginLeft: 60 }} />
            <SettingRow
              icon="phone-portrait-outline"
              title="Haptic Feedback"
              right={
                <Switch
                  value={settings.hapticFeedback}
                  onValueChange={(v) => settings.updateSetting('hapticFeedback', v)}
                />
              }
            />
            <Divider style={{ marginLeft: 60 }} />
            <SettingRow
              icon="cloud-upload-outline"
              title="Cloud Sync"
              subtitle="Auto-sync to Supabase"
              right={
                <Switch
                  value={settings.cloudSync}
                  onValueChange={(v) => settings.updateSetting('cloudSync', v)}
                />
              }
            />
          </View>
        </View>

        {/* About & Sign Out */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            GENERAL
          </Text>
          <View style={[styles.settingGroup, { backgroundColor: theme.colors.surface }]}>
            <SettingRow icon="information-circle-outline" title="About" subtitle="Version 1.0.0" />
            <Divider style={{ marginLeft: 60 }} />
            <SettingRow icon="shield-checkmark-outline" title="Privacy Policy" />
            <Divider style={{ marginLeft: 60 }} />
            <SettingRow icon="document-text-outline" title="Terms of Service" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.settingGroup, { backgroundColor: theme.colors.surface }]}>
            <SettingRow
              icon="log-out-outline"
              title="Sign Out"
              color="#EF4444"
              onPress={handleSignOut}
              right={null}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    paddingHorizontal: 28,
    marginBottom: 8,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  settingGroup: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
});
