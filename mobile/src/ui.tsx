import React from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from './theme';
import { useAppState } from './state';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  keyboardAvoid: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: spacing.page, paddingTop: 14, paddingBottom: 38 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 11, marginBottom: 28 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 11, flexShrink: 1 },
  logo: { width: 42, height: 42 },
  brand: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  tagline: { marginTop: 2, color: colors.muted, fontSize: 12 },
  headerSupport: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 20, backgroundColor: colors.surface },
  headerSupportText: { color: colors.greenDark, fontSize: 12, fontWeight: '700' },
  eyebrow: { marginBottom: 8, color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  title: { marginBottom: 11, color: colors.ink, fontSize: 32, fontWeight: '600', letterSpacing: -0.9, lineHeight: 38 },
  lead: { marginBottom: 22, color: colors.body, fontSize: 15, lineHeight: 23 },
  card: { marginBottom: 14, padding: spacing.card, borderWidth: 1, borderColor: colors.line, borderRadius: spacing.radius, backgroundColor: colors.surface },
  sectionTitle: { marginBottom: 6, color: colors.ink, fontSize: 18, fontWeight: '700', letterSpacing: -0.3, lineHeight: 24 },
  body: { color: colors.body, fontSize: 14, lineHeight: 21 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, borderRadius: 12, backgroundColor: colors.green },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  outlinedButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.surface },
  outlinedButtonText: { color: colors.greenDark, fontSize: 14, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, borderTopWidth: 1, borderTopColor: colors.line },
  taskCheck: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#C2C9BD', borderRadius: 7 },
  taskCheckDone: { borderColor: colors.green, backgroundColor: colors.green },
  taskTitle: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  tag: { alignSelf: 'flex-start', marginBottom: 8, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: colors.greenSoft, color: colors.greenDark, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
});

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const { notice, clearNotice } = useAppState();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              {notice && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${notice} Tap to dismiss.`}
                  onPress={clearNotice}
                  style={{ marginBottom: 14, padding: 13, borderRadius: 10, backgroundColor: colors.dangerSoft }}
                >
                  <Text style={{ color: colors.danger, fontSize: 13, lineHeight: 19 }}>{notice} Tap to dismiss.</Text>
                </Pressable>
              )}
              {children}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.content}>
            {notice && <Text style={{ marginBottom: 12, color: colors.danger, fontSize: 13 }}>{notice}</Text>}
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BrandHeader({ hideSupportLink = false }: { hideSupportLink?: boolean }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image source={require('../assets/brand-mark.png')} style={styles.logo} resizeMode="contain" />
        <View>
          <Text style={styles.brand}>men-tal</Text>
          <Text style={styles.tagline}>A little steadier, together.</Text>
        </View>
      </View>
      {!hideSupportLink && (
        <Link href="/support" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Open support resources" style={styles.headerSupport}>
            <Text style={styles.headerSupportText}>Get support</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}

export function Eyebrow({ children }: React.PropsWithChildren) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

type ActionProps = PressableProps & {
  children: React.ReactNode;
  variant?: 'primary' | 'outlined';
  style?: StyleProp<ViewStyle>;
};

export function Action({ children, variant = 'primary', style, ...props }: ActionProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        primary ? styles.button : styles.outlinedButton,
        pressed && { opacity: 0.78 },
        style,
      ]}
      {...props}
    >
      <Text style={primary ? styles.buttonText : styles.outlinedButtonText}>{children}</Text>
    </Pressable>
  );
}

export function LoadingScreen() {
  return (
    <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
      <Image source={require('../assets/brand-mark.png')} style={{ width: 72, height: 72, marginBottom: 16 }} resizeMode="contain" />
      <ActivityIndicator color={colors.green} />
      <Text style={[styles.muted, { marginTop: 12 }]}>A moment, just for you…</Text>
    </SafeAreaView>
  );
}
