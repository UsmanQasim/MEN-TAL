import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from './theme';
import { useAppState } from './state';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { flexGrow: 1 },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: spacing.page, paddingTop: 14, paddingBottom: 38 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
  logo: { width: 42, height: 42 },
  brand: { color: colors.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  tagline: { marginTop: 3, color: colors.muted, fontSize: 10 },
  eyebrow: { marginBottom: 9, color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  title: { marginBottom: 11, color: colors.ink, fontSize: 36, fontWeight: '600', letterSpacing: -1.4, lineHeight: 41 },
  lead: { marginBottom: 22, color: colors.muted, fontSize: 13, lineHeight: 21 },
  card: { marginBottom: 13, padding: spacing.card, borderWidth: 1, borderColor: colors.line, borderRadius: spacing.radius, backgroundColor: colors.surface },
  sectionTitle: { marginBottom: 5, color: colors.ink, fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  body: { color: colors.body, fontSize: 12, lineHeight: 19 },
  muted: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  button: { minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 17, borderRadius: 12, backgroundColor: colors.green },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  outlinedButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.surface },
  outlinedButtonText: { color: colors.greenDark, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62, borderTopWidth: 1, borderTopColor: colors.line },
  taskCheck: { width: 23, height: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C9D0C4', borderRadius: 7 },
  taskCheckDone: { borderColor: colors.green, backgroundColor: colors.green },
  taskTitle: { flex: 1, color: colors.ink, fontSize: 12, fontWeight: '600' },
  tag: { alignSelf: 'flex-start', marginBottom: 7, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: colors.greenSoft, color: colors.greenDark, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
});

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const { notice, clearNotice } = useAppState();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {notice && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${notice} Tap to dismiss.`}
                onPress={clearNotice}
                style={{ marginBottom: 14, padding: 12, borderRadius: 10, backgroundColor: colors.dangerSoft }}
              >
                <Text style={{ color: colors.danger, fontSize: 11, lineHeight: 17 }}>{notice} Tap to dismiss.</Text>
              </Pressable>
            )}
            {children}
          </View>
        </ScrollView>
      ) : <View style={styles.content}>{notice && <Text style={{ marginBottom: 12, color: colors.danger }}>{notice}</Text>}{children}</View>}
    </SafeAreaView>
  );
}

export function BrandHeader() {
  return (
    <View style={styles.header}>
      <Image source={require('../assets/brand-mark.png')} style={styles.logo} resizeMode="contain" />
      <View>
        <Text style={styles.brand}>men-tal</Text>
        <Text style={styles.tagline}>A little steadier, together.</Text>
      </View>
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
