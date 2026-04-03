import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert, Share, Dimensions } from 'react-native';
import { Text, useTheme, IconButton, Menu, Divider, TextInput, Snackbar } from 'react-native-paper';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useDocumentStore } from '../../src/stores/documentStore';
import { AIActionCard } from '../../src/components/AIActionCard';
import { GradientButton } from '../../src/components/GradientButton';
import * as openaiService from '../../src/services/openai';
import * as imageProcessing from '../../src/services/imageProcessing';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { documents, updateDocument, deleteDocument, toggleFavorite } = useDocumentStore();

  const doc = documents.find((d) => d.id === id);
  const [menuVisible, setMenuVisible] = useState(false);
  const [ocrText, setOcrText] = useState(doc?.ocr_text ?? '');
  const [summary, setSummary] = useState(doc?.ai_summary ?? '');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const [loadingOCR, setLoadingOCR] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQA, setLoadingQA] = useState(false);
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const handleOCR = useCallback(async () => {
    if (!doc || doc.pages.length === 0) return;
    setLoadingOCR(true);
    try {
      const base64 = await imageProcessing.imageToBase64(doc.pages[0].uri);
      const text = await openaiService.extractTextFromImage(base64);
      setOcrText(text);
      await updateDocument(doc.id, { ocr_text: text });
      setSnackbar('Text extracted successfully');
    } catch (err: any) {
      setSnackbar(`OCR failed: ${err.message}`);
    } finally {
      setLoadingOCR(false);
    }
  }, [doc]);

  const handleSummary = useCallback(async () => {
    if (!ocrText) {
      setSnackbar('Extract text first (OCR)');
      return;
    }
    setLoadingSummary(true);
    try {
      const result = await openaiService.summarizeDocument(ocrText);
      setSummary(result);
      await updateDocument(doc!.id, { ai_summary: result });
      setSnackbar('Summary generated');
    } catch (err: any) {
      setSnackbar(`Summary failed: ${err.message}`);
    } finally {
      setLoadingSummary(false);
    }
  }, [ocrText, doc]);

  const handleAskQuestion = useCallback(async () => {
    if (!ocrText || !question.trim()) {
      setSnackbar('Extract text first and enter a question');
      return;
    }
    setLoadingQA(true);
    try {
      const result = await openaiService.askDocumentQuestion(ocrText, question.trim());
      setAnswer(result);
    } catch (err: any) {
      setSnackbar(`Q&A failed: ${err.message}`);
    } finally {
      setLoadingQA(false);
    }
  }, [ocrText, question]);

  const handleTTS = useCallback(async () => {
    const textToRead = summary || ocrText;
    if (!textToRead) {
      setSnackbar('Extract text or generate summary first');
      return;
    }
    setLoadingTTS(true);
    try {
      await openaiService.textToSpeech(textToRead);
      setSnackbar('Audio generated (playback coming soon)');
    } catch (err: any) {
      setSnackbar(`TTS failed: ${err.message}`);
    } finally {
      setLoadingTTS(false);
    }
  }, [summary, ocrText]);

  const handleDelete = () => {
    Alert.alert('Delete Document', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (doc) {
            await deleteDocument(doc.id);
            router.back();
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: ocrText || doc?.title || 'Shared from AI Scan PDF',
      });
    } catch {}
  };

  if (!doc) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text>Document not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="titleMedium" numberOfLines={1} style={{ flex: 1, fontWeight: '600' }}>
          {doc.title}
        </Text>
        <IconButton
          icon={doc.is_favorite ? 'heart' : 'heart-outline'}
          iconColor={doc.is_favorite ? '#EF4444' : undefined}
          size={22}
          onPress={() => toggleFavorite(doc.id)}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<IconButton icon="dots-vertical" size={22} onPress={() => setMenuVisible(true)} />}
        >
          <Menu.Item onPress={handleShare} title="Share" leadingIcon="share-outline" />
          <Menu.Item onPress={() => { setMenuVisible(false); }} title="Rename" leadingIcon="pencil-outline" />
          <Menu.Item onPress={() => { setMenuVisible(false); }} title="Move to Folder" leadingIcon="folder-outline" />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleDelete();
            }}
            title="Delete"
            leadingIcon="trash-can-outline"
            titleStyle={{ color: '#EF4444' }}
          />
        </Menu>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Document Preview */}
        <View style={styles.previewContainer}>
          {doc.pages.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {doc.pages.map((page, index) => (
                <View key={page.id} style={styles.pageContainer}>
                  <Image
                    source={{ uri: page.uri }}
                    style={styles.pageImage}
                    contentFit="contain"
                    transition={200}
                  />
                  <View style={styles.pageLabel}>
                    <Text style={styles.pageLabelText}>
                      {index + 1}/{doc.pages.length}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.noPreview, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.onSurfaceVariant} />
            </View>
          )}
        </View>

        {/* Document Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="documents-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {doc.page_count} pages
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {new Date(doc.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* AI Actions */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={{ fontWeight: '600', paddingHorizontal: 16 }}>
            AI Tools
          </Text>
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <AIActionCard
              icon="text-outline"
              title="Extract Text (OCR)"
              subtitle={ocrText ? `${ocrText.length} characters extracted` : 'Use AI vision to read text'}
              onPress={handleOCR}
              loading={loadingOCR}
              color="#2563EB"
            />
            <AIActionCard
              icon="flash-outline"
              title="AI Summary"
              subtitle={summary ? 'Summary generated' : 'Get a smart overview'}
              onPress={handleSummary}
              loading={loadingSummary}
              color="#7C3AED"
            />
            <AIActionCard
              icon="volume-high-outline"
              title="Read Aloud (TTS)"
              subtitle="Listen to your document"
              onPress={handleTTS}
              loading={loadingTTS}
              color="#0891B2"
            />
          </View>
        </View>

        {/* OCR Text */}
        {ocrText ? (
          <View style={styles.section}>
            <Text variant="titleMedium" style={{ fontWeight: '600', paddingHorizontal: 16 }}>
              Extracted Text
            </Text>
            <View
              style={[
                styles.textBox,
                { backgroundColor: theme.colors.surfaceVariant, marginHorizontal: 16, marginTop: 8 },
              ]}
            >
              <Text variant="bodyMedium" selectable style={{ lineHeight: 22 }}>
                {ocrText.length > 1000 ? ocrText.slice(0, 1000) + '...' : ocrText}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Summary */}
        {summary ? (
          <View style={styles.section}>
            <Text variant="titleMedium" style={{ fontWeight: '600', paddingHorizontal: 16 }}>
              AI Summary
            </Text>
            <View
              style={[
                styles.textBox,
                { backgroundColor: theme.colors.secondaryContainer, marginHorizontal: 16, marginTop: 8 },
              ]}
            >
              <Text variant="bodyMedium" selectable style={{ lineHeight: 22 }}>
                {summary}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Q&A */}
        {ocrText ? (
          <View style={styles.section}>
            <Text variant="titleMedium" style={{ fontWeight: '600', paddingHorizontal: 16 }}>
              Ask a Question
            </Text>
            <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
              <TextInput
                placeholder="Ask anything about this document..."
                value={question}
                onChangeText={setQuestion}
                mode="outlined"
                outlineStyle={{ borderRadius: 14 }}
                right={
                  <TextInput.Icon
                    icon="send"
                    onPress={handleAskQuestion}
                    disabled={loadingQA}
                  />
                }
              />
              {answer ? (
                <View
                  style={[
                    styles.textBox,
                    { backgroundColor: theme.colors.tertiaryContainer, marginTop: 10 },
                  ]}
                >
                  <Text variant="bodyMedium" selectable style={{ lineHeight: 22 }}>
                    {answer}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const WINDOW_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  previewContainer: {
    height: 300,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  pageContainer: {
    width: WINDOW_WIDTH - 32,
    height: 300,
  },
  pageImage: {
    flex: 1,
  },
  pageLabel: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pageLabelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginTop: 20,
  },
  textBox: {
    padding: 14,
    borderRadius: 14,
  },
});
