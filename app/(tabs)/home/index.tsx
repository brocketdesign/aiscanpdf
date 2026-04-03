import React, { useEffect, useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
  ScrollView,
} from 'react-native';
import { Text, useTheme, FAB, Menu, Divider, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DocumentCard } from '../../../src/components/DocumentCard';
import { FolderCard } from '../../../src/components/FolderCard';
import { SearchHeader } from '../../../src/components/SearchHeader';
import { EmptyState } from '../../../src/components/EmptyState';
import { useDocumentStore } from '../../../src/stores/documentStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { isPremium, usage, showPremiumScreen, getRemainingCredits } = useSubscriptionStore();
  const {
    documents,
    folders,
    isLoading,
    searchQuery,
    loadDocuments,
    loadFolders,
    setSearchQuery,
    searchDocuments,
    setSelectedDocument,
  } = useDocumentStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    await Promise.all([loadDocuments(user.id), loadFolders(user.id)]);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-show premium screen when usage limit is hit
  useEffect(() => {
    if (showPremiumScreen) {
      router.push('/premium');
    }
  }, [showPremiumScreen]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (user && query.length > 2) {
      searchDocuments(user.id, query);
    } else if (user && query.length === 0) {
      loadDocuments(user.id);
    }
  };

  const recentDocs = documents.slice(0, 4);
  const favoriteDocs = documents.filter((d) => d.is_favorite);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {greeting()}
            </Text>
            <Text variant="headlineSmall" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
              {user?.full_name ?? 'User'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-grid'}
              size={22}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            />
            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <IconButton
                  icon="sort-variant"
                  size={22}
                  onPress={() => setSortMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={() => setSortMenuVisible(false)} title="Recent" leadingIcon="clock-outline" />
              <Menu.Item onPress={() => setSortMenuVisible(false)} title="Name" leadingIcon="sort-alphabetical-ascending" />
              <Menu.Item onPress={() => setSortMenuVisible(false)} title="Size" leadingIcon="sort-numeric-ascending" />
              <Divider />
              <Menu.Item onPress={() => setSortMenuVisible(false)} title="Favorites" leadingIcon="heart-outline" />
            </Menu>
          </View>
        </View>
        <SearchHeader value={searchQuery} onChangeText={handleSearch} />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            onPress={() => router.push('/(tabs)/scan')}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            <LinearGradient
              colors={['#2563EB', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanBanner}
            >
              <View style={styles.scanBannerContent}>
                <View style={styles.scanBannerIcon}>
                  <Ionicons name="scan" size={28} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ color: '#FFF', fontWeight: '700' }}>
                    Scan Document
                  </Text>
                  <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                    Camera, import, or batch scan
                  </Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.9)" />
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Premium Upsell Banner */}
        {!isPremium() && (
          <Pressable
            onPress={() => router.push('/premium')}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            <View style={styles.premiumBanner}>
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.premiumBannerGradient}
              >
                <View style={styles.premiumBannerContent}>
                  <View style={styles.premiumBannerIcon}>
                    <Ionicons name="diamond" size={22} color="#FFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={{ color: '#FFF', fontWeight: '700' }}>
                      Upgrade to Premium
                    </Text>
                    <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                      {getRemainingCredits('scans')} scans · {getRemainingCredits('ocr')} OCR · {getRemainingCredits('summaries')} summaries left
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.9)" />
                </View>
              </LinearGradient>
            </View>
          </Pressable>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                Folders
              </Text>
              <Pressable>
                <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                  See All
                </Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {folders.map((folder) => (
                <FolderCard key={folder.id} folder={folder} onPress={() => {}} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Favorites */}
        {favoriteDocs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                ⭐ Favorites
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16 }}
            >
              {favoriteDocs.slice(0, 5).map((doc) => (
                <View key={doc.id} style={{ marginRight: 12, width: 150 }}>
                  <DocumentCard
                    document={doc}
                    variant="grid"
                    onPress={() => {
                      setSelectedDocument(doc);
                      router.push(`/document/${doc.id}`);
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
              Recent Documents
            </Text>
            {documents.length > 4 && (
              <Pressable>
                <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                  See All
                </Text>
              </Pressable>
            )}
          </View>

          {isLoading && documents.length === 0 ? (
            <EmptyState icon="hourglass-outline" title="Loading..." loading />
          ) : documents.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No documents yet"
              subtitle="Tap the scan button to get started"
            />
          ) : (
            <View style={styles.docGrid}>
              {(searchQuery ? documents : recentDocs).map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  variant={viewMode}
                  onPress={() => {
                    setSelectedDocument(doc);
                    router.push(`/document/${doc.id}`);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="camera"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFF"
        onPress={() => router.push('/(tabs)/scan')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  scanBanner: {
    borderRadius: 18,
    padding: 20,
  },
  scanBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanBannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  premiumBanner: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  premiumBannerGradient: {
    borderRadius: 14,
    padding: 14,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  docGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    borderRadius: 16,
  },
});
