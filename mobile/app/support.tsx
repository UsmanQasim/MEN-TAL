import React, { useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Action, BrandHeader, Eyebrow, Screen, styles } from '../src/ui';
import { colors } from '../src/theme';
import { countryLookupUrl, donationUrl, supportDirectoryUrl } from '../src/config';
import { useAppState } from '../src/state';

type CountryLookup = { success?: boolean; country?: string; country_code?: string };

async function openExternal(url: string) {
  await Linking.openURL(url);
}

export default function SupportScreen() {
  const { clearAllData } = useAppState();
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearStatus, setClearStatus] = useState('');

  async function detectCountry() {
    setBusy(true);
    setError('');
    setStatus('Estimating your country…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(countryLookupUrl, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Country service returned HTTP ${response.status}.`);
      const result = (await response.json()) as CountryLookup;
      const code = result.country_code?.toUpperCase() ?? '';
      if (result.success !== true || !/^[A-Z]{2}$/.test(code) || !result.country) {
        throw new Error('The country service returned an incomplete result.');
      }
      setCountry(result.country);
      setCountryCode(code);
      setStatus('This is approximate. You can change the country code below if it looks wrong.');
    } catch (lookupError) {
      console.error('Could not look up the country for support resources.', lookupError);
      setStatus('');
      setError('We couldn’t estimate your country. Choose it below or open the directory and select it there.');
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  }

  async function openLink(url: string) {
    try {
      setLinkError('');
      await openExternal(url);
    } catch (openError) {
      console.error('Could not open an external support link.', openError);
      setLinkError('This link could not open. Check your connection and try again.');
    }
  }

  async function handleClearAll() {
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      setClearStatus('Tap “Confirm erase” to remove your check-in, daily tasks, journal note, and rough-day plan from this device.');
      return;
    }
    const ok = await clearAllData();
    setConfirmClearAll(false);
    setClearStatus(ok
      ? 'All saved MEN-TAL entries have been cleared from this device.'
      : 'Could not clear all saved data right now. Check device storage and try again.');
  }

  const normalizedCode = countryCode.trim().toUpperCase();
  const countryUrl = /^[A-Z]{2}$/.test(normalizedCode)
    ? `https://findahelpline.com/countries/${normalizedCode}`
    : supportDirectoryUrl;

  return (
    <Screen>
      <BrandHeader hideSupportLink />
      <Eyebrow>YOU DON’T HAVE TO DO THIS ALONE</Eyebrow>
      <Text style={styles.title}>Reaching out is{'\n'}a strong next step.</Text>
      <Text style={styles.lead}>A real person can help in ways an app can’t. Find support that fits where you are.</Text>

      <View style={[styles.card, { backgroundColor: colors.greenSoft }]}>
        <Text style={styles.tag}>LOCAL SUPPORT</Text>
        <Text style={styles.sectionTitle}>Find helplines where you are</Text>
        <Text style={[styles.body, { marginTop: 6 }]}>If you choose, we estimate only your country from your internet connection—not GPS. Your IP address is sent to ipwho.is for that one request; MEN-TAL doesn’t save the result. You can also enter a country code yourself.</Text>
        <Action disabled={busy} onPress={detectCountry} style={{ marginTop: 15, opacity: busy ? 0.65 : 1 }}>
          {busy ? 'Checking…' : 'Find my country'}
        </Action>
        {status ? <Text accessibilityLiveRegion="polite" style={[styles.muted, { marginTop: 10 }]}>{status}</Text> : null}
        {error ? <Text accessibilityLiveRegion="polite" style={{ marginTop: 10, color: colors.danger, fontSize: 13, lineHeight: 19 }}>{error}</Text> : null}
        <Text style={[styles.muted, { marginTop: 17, marginBottom: 7 }]}>Or enter the two-letter country code (for example, US or PK)</Text>
        <TextInput
          value={countryCode}
          onChangeText={(value) => {
            setCountryCode(value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase());
            setCountry('');
          }}
          autoCapitalize="characters"
          maxLength={2}
          placeholder="Country code"
          placeholderTextColor="#959A90"
          accessibilityLabel="Country code"
          style={{ height: 48, paddingHorizontal: 14, borderWidth: 1, borderColor: '#D8E1D3', borderRadius: 12, backgroundColor: colors.surface, color: colors.ink, fontSize: 15 }}
        />
        {country ? <Text style={[styles.body, { marginTop: 10, fontWeight: '600' }]}>Approximate location: {country} ({normalizedCode})</Text> : null}
        <Action variant="outlined" onPress={() => openLink(countryUrl)} style={{ marginTop: 12 }}>
          {normalizedCode ? `View ${normalizedCode} helplines` : 'Choose a country in the directory'}
        </Action>
      </View>

      <View style={styles.card}>
        <Text style={styles.tag}>ONGOING SUPPORT</Text>
        <Text style={styles.sectionTitle}>Talk to a health professional</Text>
        <Text style={styles.body}>A doctor or mental health professional can listen, help make sense of things, and talk through options with you.</Text>
        <Pressable accessibilityRole="link" onPress={() => openLink('https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response')} style={{ paddingTop: 12 }}>
          <Text style={{ color: colors.greenDark, fontSize: 14, fontWeight: '700' }}>Learn about mental health support ↗</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.tag}>EVERYDAY CONNECTION</Text>
        <Text style={styles.sectionTitle}>Lean on someone you trust</Text>
        <Text style={styles.body}>You don’t need a speech. Letting a friend, brother, or family member know today feels heavy can make the next hour lighter.</Text>
        <Link href="/plan" asChild>
          <Pressable accessibilityRole="button" style={{ paddingTop: 12 }}>
            <Text style={{ color: colors.greenDark, fontSize: 14, fontWeight: '700' }}>Draft a simple text in your rough-day plan →</Text>
          </Pressable>
        </Link>
      </View>

      <View style={[styles.card, { borderColor: '#EAD8CB', backgroundColor: colors.dangerSoft }]}>
        <Text style={[styles.tag, { color: colors.danger, backgroundColor: '#F1DFD3' }]}>URGENT HELP</Text>
        <Text style={[styles.sectionTitle, { color: '#765343' }]}>If you’re in immediate danger</Text>
        <Text style={[styles.body, { color: '#806B5F' }]}>If you might hurt yourself or someone else, call your local emergency number or go to the nearest emergency department now. If you can, tell someone you trust and ask them to stay with you.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.tag}>OPTIONAL · NEVER REQUIRED</Text>
        <Text style={styles.sectionTitle}>Help keep MEN-TAL free</Text>
        <Text style={styles.body}>No payment is processed in MEN-TAL. {donationUrl ? 'Tips go to the creator page below; MEN-TAL never receives or stores payment details.' : 'No payment account is connected yet, so this app collects no donations. Essential wellbeing and crisis resources stay free.'}</Text>
        {donationUrl ? (
          <Action variant="outlined" onPress={() => openLink(donationUrl)} style={{ marginTop: 13 }}>Visit creator tip page ↗</Action>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.tag}>YOUR PRIVACY & DATA</Text>
        <Text style={styles.sectionTitle}>Everything stays on this device</Text>
        <Text style={styles.body}>Your check-ins, daily tasks, journal note, and rough-day plan are stored locally on this device. You can erase all saved entries whenever you like.</Text>
        {clearStatus ? <Text accessibilityLiveRegion="polite" style={[styles.muted, { marginTop: 8, color: colors.greenDark, fontWeight: '500' }]}>{clearStatus}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 13 }}>
          <Action variant="outlined" onPress={handleClearAll}>
            {confirmClearAll ? 'Confirm erase all data' : 'Erase all saved data'}
          </Action>
          {confirmClearAll ? (
            <Action
              variant="outlined"
              onPress={() => {
                setConfirmClearAll(false);
                setClearStatus('');
              }}
            >
              Cancel
            </Action>
          ) : null}
        </View>
      </View>

      {linkError ? <Text accessibilityLiveRegion="polite" style={{ color: colors.danger, fontSize: 13 }}>{linkError}</Text> : null}
      <Text style={[styles.muted, { marginTop: 6, fontSize: 12 }]}>MEN-TAL offers general wellbeing ideas, not diagnosis, treatment, or crisis care. If things feel unmanageable, you deserve support from a qualified person.</Text>
    </Screen>
  );
}
