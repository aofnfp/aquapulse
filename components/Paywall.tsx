import { Modal, View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { X, Check, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { usePremiumStore } from '@/store/premium-store';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  'Custom beverage types',
  'Unlimited reminders',
  'Smart scheduling',
  'Weekly and monthly analytics',
  'Calendar heat map',
  'Health app sync',
  'Home screen widgets',
  '5 curated themes',
  'No ads',
];

export default function Paywall({ visible, onClose }: PaywallProps) {
  const { isLoading, buyMonthly, buyAnnual, restore } = usePremiumStore();

  const handleAnnual = async () => {
    const success = await buyAnnual();
    if (success) onClose();
  };

  const handleMonthly = async () => {
    const success = await buyMonthly();
    if (success) onClose();
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close premium upgrade"
            accessibilityRole="button"
            hitSlop={8}
          >
            <X size={24} color={Colors.textSecondary} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Sparkles size={24} color={Colors.primary} />
              <Text style={styles.title}>AquaPulse Premium</Text>
            </View>
            <Text style={styles.subtitle}>Unlock the full experience</Text>

            <View style={styles.features}>
              {PREMIUM_FEATURES.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Check size={16} color={Colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Annual Plan */}
            <Pressable
              onPress={handleAnnual}
              style={[styles.planCard, styles.planCardHighlight]}
              accessibilityLabel="Annual plan, $19.99 per year, 7-day free trial"
              accessibilityRole="button"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Text style={styles.planTitle}>Annual — $19.99/year</Text>
                  <Text style={styles.planDetail}>$1.67/mo — Save 44%</Text>
                  <Text style={styles.planTrial}>7-day free trial</Text>
                </>
              )}
            </Pressable>

            {/* Monthly Plan */}
            <Pressable
              onPress={handleMonthly}
              style={styles.planCard}
              accessibilityLabel="Monthly plan, $2.99 per month"
              accessibilityRole="button"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Text style={styles.planTitle}>Monthly — $2.99/month</Text>
              )}
            </Pressable>

            {/* CTA */}
            <Pressable
              onPress={handleAnnual}
              style={styles.ctaButton}
              accessibilityLabel="Start free trial"
              accessibilityRole="button"
              disabled={isLoading}
            >
              <Text style={styles.ctaText}>Start Free Trial</Text>
            </Pressable>

            {/* Restore & Legal */}
            <View style={styles.footer}>
              <Pressable
                onPress={handleRestore}
                accessibilityLabel="Restore purchases"
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.footerLink}>Restore purchases</Text>
              </Pressable>
              <Text style={styles.footerDot}> · </Text>
              <Text style={styles.footerLink}>Terms</Text>
            </View>

            <Text style={styles.disclaimer}>
              Payment will be charged to your App Store or Google Play account.
              Subscriptions auto-renew unless cancelled at least 24 hours before
              the end of the current period.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 25, 41, 0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 22,
  },
  features: {
    marginTop: 24,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 28,
  },
  featureText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  planCard: {
    borderWidth: 1,
    borderColor: Colors.surfaceDivider,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    backgroundColor: Colors.surface,
    minHeight: 52,
    justifyContent: 'center',
  },
  planCardHighlight: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  planDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  planTrial: {
    fontSize: 13,
    color: Colors.primaryText,
    marginTop: 2,
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 52,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerLink: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  footerDot: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
