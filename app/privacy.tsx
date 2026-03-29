import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: March 2026</Text>

        <Text style={styles.sectionTitle}>Data Collection</Text>
        <Text style={styles.body}>
          AquaPulse by Abraham Oladotun Foundation NFP stores all your hydration
          data locally on your device. We do not collect, transmit, or store any
          personal data on external servers. Your hydration logs, goals, reminders,
          and preferences remain entirely on your device.
        </Text>

        <Text style={styles.sectionTitle}>Third-Party Services</Text>
        <Text style={styles.body}>
          AquaPulse uses the following third-party services that may collect data
          as described in their own privacy policies:
        </Text>
        <Text style={styles.bullet}>
          • Google AdMob — for displaying advertisements in the free version
        </Text>
        <Text style={styles.bullet}>
          • RevenueCat — for managing premium subscriptions
        </Text>

        <Text style={styles.sectionTitle}>Advertising</Text>
        <Text style={styles.body}>
          The free version of AquaPulse displays banner advertisements powered by
          Google AdMob. On iOS, we request App Tracking Transparency (ATT)
          permission before showing personalized ads. If you decline tracking,
          non-personalized ads are shown instead. Premium subscribers see no ads.
        </Text>

        <Text style={styles.sectionTitle}>In-App Purchases</Text>
        <Text style={styles.body}>
          Premium subscriptions are managed through RevenueCat and processed by
          Apple App Store or Google Play Store. We do not have access to your
          payment information.
        </Text>

        <Text style={styles.sectionTitle}>Children's Privacy</Text>
        <Text style={styles.body}>
          AquaPulse is not directed at children under the age of 13. We do not
          knowingly collect personal information from children.
        </Text>

        <Text style={styles.sectionTitle}>Data Deletion</Text>
        <Text style={styles.body}>
          You can delete all your data at any time from Settings → Delete all data.
          This permanently removes all hydration logs, summaries, and reminders
          from your device.
        </Text>

        <Text style={styles.sectionTitle}>Changes to This Policy</Text>
        <Text style={styles.body}>
          We may update this privacy policy from time to time. Changes will be
          posted within the app and take effect immediately upon posting.
        </Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.body}>
          If you have questions about this privacy policy, contact us at:
          privacy@abrahamoladotun.org
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 52,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bullet: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginLeft: 8,
    marginTop: 4,
  },
});
