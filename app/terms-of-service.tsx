import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

export default function TermsOfServiceScreen() {
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
          Terms of Service
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

        <Section title="1. Acceptance of Terms">
          <Paragraph>
            By downloading, installing, or using AI Scan PDF (the "App"), you agree to be bound by
            these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.
            We reserve the right to update these Terms at any time. Continued use of the App after
            changes constitutes your acceptance.
          </Paragraph>
        </Section>

        <Section title="2. Description of Service">
          <Paragraph>
            AI Scan PDF provides document scanning, optical character recognition (OCR), AI-powered
            summaries and Q&A, text-to-speech conversion, and cloud storage of your scanned documents.
            Features are available on a free tier with limited usage or via a paid premium subscription.
          </Paragraph>
        </Section>

        <Section title="3. User Accounts">
          <BulletItem>You must be at least 13 years old to create an account.</BulletItem>
          <BulletItem>
            You are responsible for maintaining the confidentiality of your login credentials.
          </BulletItem>
          <BulletItem>
            You are responsible for all activity that occurs under your account.
          </BulletItem>
          <BulletItem>
            You must provide accurate information during registration and keep it up to date.
          </BulletItem>
          <BulletItem>
            We reserve the right to suspend or terminate accounts that violate these Terms.
          </BulletItem>
        </Section>

        <Section title="4. Subscriptions & Billing">
          <SubHeading>Free Tier</SubHeading>
          <Paragraph>
            Free accounts receive limited usage credits each month (1 scan, 0 OCR, 0 AI summaries,
            0 TTS, 0 Q&A). Limits reset on the first day of each calendar month.
          </Paragraph>

          <SubHeading>Premium Subscription</SubHeading>
          <Paragraph>
            Premium plans offer expanded usage limits and are billed monthly or annually via Stripe.
            A 3-day free trial is available to new subscribers. If you do not cancel before the trial
            ends, you will be charged the applicable subscription fee.
          </Paragraph>

          <SubHeading>Cancellation & Refunds</SubHeading>
          <Paragraph>
            You may cancel your subscription at any time. Cancellation takes effect at the end of the
            current billing period; you retain premium access until that date. Refunds for unused
            subscription periods are provided at our sole discretion in accordance with applicable law.
          </Paragraph>

          <SubHeading>Price Changes</SubHeading>
          <Paragraph>
            We may change subscription prices upon reasonable notice. Continued use of the premium
            service after a price change takes effect constitutes your acceptance of the new pricing.
          </Paragraph>
        </Section>

        <Section title="5. Acceptable Use">
          <Paragraph>You agree not to use the App to:</Paragraph>
          <BulletItem>Scan or upload content that infringes third-party intellectual property rights</BulletItem>
          <BulletItem>Upload or process illegal, hateful, abusive, or harmful material</BulletItem>
          <BulletItem>Attempt to reverse-engineer, decompile, or tamper with the App</BulletItem>
          <BulletItem>Use automated scripts to abuse or overload the service</BulletItem>
          <BulletItem>Resell or sublicense access to the App's features without our written consent</BulletItem>
          <BulletItem>Violate any applicable local, national, or international law or regulation</BulletItem>
        </Section>

        <Section title="6. Intellectual Property">
          <SubHeading>Your Content</SubHeading>
          <Paragraph>
            You retain full ownership of all documents and content you scan or upload. By using the
            App, you grant us a limited licence to process and store your content solely to provide the
            service to you.
          </Paragraph>

          <SubHeading>Our Content</SubHeading>
          <Paragraph>
            The App, including its design, code, and branding, is the intellectual property of AI Scan
            PDF. You may not copy, modify, or distribute any part of the App without our prior written
            permission.
          </Paragraph>
        </Section>

        <Section title="7. Privacy">
          <Paragraph>
            Our Privacy Policy, available within the App and at our website, describes how we collect,
            use, and protect your personal data. By using the App, you consent to the practices
            described in the Privacy Policy.
          </Paragraph>
        </Section>

        <Section title="8. Third-Party Services">
          <Paragraph>
            The App integrates third-party services including Supabase, Stripe, OpenAI, and
            ElevenLabs. Your use of these integrations is also subject to each provider's terms and
            policies. We are not responsible for the availability, accuracy, or actions of third-party
            services.
          </Paragraph>
        </Section>

        <Section title="9. Disclaimers">
          <Paragraph>
            THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
            IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF
            VIRUSES OR OTHER HARMFUL COMPONENTS. AI-GENERATED CONTENT (SUMMARIES, OCR OUTPUT, Q&A
            RESPONSES) IS PROVIDED FOR INFORMATIONAL PURPOSES ONLY AND MAY NOT BE ACCURATE.
          </Paragraph>
        </Section>

        <Section title="10. Limitation of Liability">
          <Paragraph>
            TO THE FULLEST EXTENT PERMITTED BY LAW, AI SCAN PDF SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA OR PROFITS,
            ARISING FROM YOUR USE OF OR INABILITY TO USE THE APP, EVEN IF WE HAVE BEEN ADVISED OF THE
            POSSIBILITY OF SUCH DAMAGES.
          </Paragraph>
        </Section>

        <Section title="11. Termination">
          <Paragraph>
            We may suspend or terminate your access to the App at our discretion, without notice, if
            you breach these Terms. Upon termination, your right to use the App ceases immediately.
            Provisions relating to intellectual property, disclaimers, limitations of liability, and
            dispute resolution survive termination.
          </Paragraph>
        </Section>

        <Section title="12. Governing Law">
          <Paragraph>
            These Terms are governed by applicable law. Any disputes arising from these Terms or your
            use of the App shall be resolved through binding arbitration or in the courts of competent
            jurisdiction, as required by applicable law.
          </Paragraph>
        </Section>

        <Section title="13. Contact Us">
          <Paragraph>
            If you have questions about these Terms, please contact us:
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
