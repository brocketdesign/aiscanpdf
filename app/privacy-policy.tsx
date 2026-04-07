import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

export default function PrivacyPolicyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: theme.colors.surfaceVariant }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text variant="titleLarge" style={{ fontWeight: '700' }}>
          Privacy Policy
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="bodySmall" style={[styles.lastUpdated, { color: theme.colors.onSurfaceVariant }]}>
          Last updated: April 4, 2026
        </Text>

        <Section title="1. Introduction">
          <Paragraph>
            AI Scan PDF ("we", "us", or "our") is committed to protecting your privacy. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your information when you use
            our mobile application. Please read this policy carefully. By using the app, you agree to
            the practices described here.
          </Paragraph>
        </Section>

        <Section title="2. Information We Collect">
          <SubHeading>Account Information</SubHeading>
          <Paragraph>
            When you create an account, we collect your email address and optionally a display name.
            This information is processed and stored securely via Supabase.
          </Paragraph>

          <SubHeading>Documents & Scanned Content</SubHeading>
          <Paragraph>
            Files you scan, upload, or create within the app (including images, PDFs, extracted text,
            and AI-generated summaries) are stored in your personal cloud storage. You retain full
            ownership of your content.
          </Paragraph>

          <SubHeading>Usage Data</SubHeading>
          <Paragraph>
            We track feature usage (number of scans, OCR requests, AI summaries, text-to-speech
            conversions, and Q&A queries) to enforce free-tier limits and provide accurate billing for
            premium subscribers.
          </Paragraph>

          <SubHeading>Payment Information</SubHeading>
          <Paragraph>
            Subscription payments are handled by Stripe. We do not store your full credit card
            details. We receive only a Stripe customer ID and subscription status to manage your
            account.
          </Paragraph>

          <SubHeading>Device & Log Data</SubHeading>
          <Paragraph>
            We may collect information such as your device type, operating system version, app
            version, and crash logs to diagnose issues and improve app performance.
          </Paragraph>
        </Section>

        <Section title="3. How We Use Your Information">
          <BulletItem>Provide, operate, and maintain the app's features</BulletItem>
          <BulletItem>Process subscriptions and manage billing</BulletItem>
          <BulletItem>Improve and personalise your experience</BulletItem>
          <BulletItem>Send important service notices (e.g., billing updates, policy changes)</BulletItem>
          <BulletItem>Detect, prevent, and address technical issues or abuse</BulletItem>
          <BulletItem>Comply with applicable laws and enforce our Terms of Service</BulletItem>
        </Section>

        <Section title="4. Third-Party Services">
          <Paragraph>
            We use the following third-party services, each governed by their own privacy policies:
          </Paragraph>
          <BulletItem>
            <Text style={{ fontWeight: '600' }}>Supabase</Text> — Authentication, database, and file
            storage (supabase.com/privacy)
          </BulletItem>
          <BulletItem>
            <Text style={{ fontWeight: '600' }}>Stripe</Text> — Payment processing (stripe.com/privacy)
          </BulletItem>
          <BulletItem>
            <Text style={{ fontWeight: '600' }}>OpenAI</Text> — AI text generation, OCR analysis, and
            Q&A (openai.com/privacy)
          </BulletItem>
          <BulletItem>
            <Text style={{ fontWeight: '600' }}>ElevenLabs</Text> — Text-to-speech audio synthesis
            (elevenlabs.io/privacy)
          </BulletItem>
          <Paragraph>
            Content sent to AI services (OpenAI, ElevenLabs) is transmitted solely to fulfil your
            in-app request and is subject to those providers' data handling terms. We do not sell your
            content to any third party.
          </Paragraph>
        </Section>

        <Section title="5. Data Storage & Security">
          <Paragraph>
            Your data is stored on Supabase-managed infrastructure with row-level security policies
            ensuring only you can access your own documents and account data. We use HTTPS/TLS
            encryption for all data in transit. Despite reasonable safeguards, no method of electronic
            storage is 100% secure, and we cannot guarantee absolute security.
          </Paragraph>
        </Section>

        <Section title="6. Data Retention">
          <Paragraph>
            We retain your account data and documents for as long as your account is active. If you
            delete your account, your personal data and uploaded files will be permanently deleted
            within 30 days, except where retention is required by law.
          </Paragraph>
        </Section>

        <Section title="7. Your Rights">
          <Paragraph>
            Depending on your location, you may have the right to:
          </Paragraph>
          <BulletItem>Access the personal data we hold about you</BulletItem>
          <BulletItem>Request correction of inaccurate data</BulletItem>
          <BulletItem>Request deletion of your data</BulletItem>
          <BulletItem>Object to certain processing of your data</BulletItem>
          <BulletItem>Port your data to another service</BulletItem>
          <Paragraph>
            To exercise any of these rights, please contact us at the address below.
          </Paragraph>
        </Section>

        <Section title="8. Children's Privacy">
          <Paragraph>
            AI Scan PDF is not directed at children under the age of 13. We do not knowingly collect
            personal information from children under 13. If we become aware that a child under 13 has
            provided us with personal information, we will delete it promptly.
          </Paragraph>
        </Section>

        <Section title="9. Changes to This Policy">
          <Paragraph>
            We may update this Privacy Policy from time to time. We will notify you by updating the
            "Last updated" date at the top of this page and, for material changes, by posting an
            in-app notice or sending an email. Your continued use of the app after changes are posted
            constitutes your acceptance of the revised policy.
          </Paragraph>
        </Section>

        <Section title="10. Contact Us">
          <Paragraph>
            If you have questions or concerns about this Privacy Policy, please contact us at:
          </Paragraph>
          <Paragraph style={{ fontWeight: '600' }}>
            support@aiscanpdf.com
          </Paragraph>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Text
      variant="bodyMedium"
      style={[styles.subHeading, { color: theme.colors.onSurface }]}
    >
      {children}
    </Text>
  );
}

function Paragraph({ children, style }: { children: React.ReactNode; style?: object }) {
  const theme = useTheme();
  return (
    <Text
      variant="bodyMedium"
      style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }, style]}
    >
      {children}
    </Text>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.bulletRow}>
      <Text style={{ color: theme.colors.primary, marginRight: 8, lineHeight: 22 }}>•</Text>
      <Text
        variant="bodyMedium"
        style={[styles.bulletText, { color: theme.colors.onSurfaceVariant }]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastUpdated: {
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 10,
  },
  subHeading: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingRight: 8,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
});
