import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Action, BrandHeader, Eyebrow, LoadingScreen, Screen, styles } from '../src/ui';
import { journalFitsStorage, MAX_JOURNAL_BYTES, useAppState, utf8Length } from '../src/state';
import { colors } from '../src/theme';

const JOURNAL_PROMPTS = [
  'Right now, I need…',
  'One thing that felt heavy today was…',
  'Something I can give myself permission to leave until tomorrow is…',
  'For the next hour, “enough” looks like…',
  'What I wish someone understood without me having to explain is…',
  'One small thing I got through today was…',
];

export default function JournalScreen() {
  const { data, ready, saveJournal } = useAppState();
  const [entry, setEntry] = useState(data.journal);
  const [promptIndex, setPromptIndex] = useState(0);
  const [status, setStatus] = useState('Stored in this app on this device only.');

  useEffect(() => {
    if (ready) setEntry(data.journal);
  }, [ready, data.journal]);

  async function save() {
    if (await saveJournal(entry)) setStatus('Protected and saved on this device. Not uploaded.');
    else setStatus(!journalFitsStorage(entry, data)
      ? 'This note is too large for secure device storage. Please shorten it and try again.'
      : 'This device could not protect and save your note. Check available storage and try again.');
  }

  async function clear() {
    if (await saveJournal('')) {
      setEntry('');
      setStatus('Cleared from this app on this device.');
    } else {
      setStatus('This device could not clear the saved note. Check device storage and try again.');
    }
  }

  function insertPrompt() {
    const promptText = JOURNAL_PROMPTS[promptIndex % JOURNAL_PROMPTS.length];
    const nextValue = entry.trim() ? `${entry.trimEnd()}\n\n${promptText} ` : `${promptText} `;
    if (nextValue.length <= 1500) {
      setEntry(nextValue);
      setStatus('Prompt added. Save when you’re ready.');
    }
  }

  if (!ready) return <LoadingScreen />;

  const currentPrompt = JOURNAL_PROMPTS[promptIndex % JOURNAL_PROMPTS.length];

  return (
    <Screen>
      <BrandHeader />
      <Eyebrow>JUST FOR YOU</Eyebrow>
      <Text style={styles.title}>Put it somewhere{'\n'}outside your head.</Text>
      <Text style={styles.lead}>Write as much or as little as you like. Nothing here is sent to a server.</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What feels most on your mind right now?</Text>
        <TextInput
          value={entry}
          onChangeText={(value) => {
            setEntry(value);
            setStatus('Only on this device. Save when you’re ready.');
          }}
          multiline
          maxLength={1500}
          textAlignVertical="top"
          placeholder="It doesn’t have to make sense. Start wherever you are…"
          placeholderTextColor="#959A90"
          accessibilityLabel="Journal entry"
          style={{ minHeight: 220, marginTop: 14, padding: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.paper, color: colors.ink, fontSize: 15, lineHeight: 23 }}
        />
        <Text style={[styles.muted, { marginTop: 12, color: colors.greenDark, fontWeight: '500' }]}>{status}</Text>
        <Text style={[styles.muted, { marginTop: 5, fontSize: 12 }]}>Your note is stored in Android Keystore or iOS Keychain, not uploaded. On web it stays in this browser’s local storage. This is not a substitute for professional care.</Text>
        <Text style={[styles.muted, { marginTop: 5, fontSize: 12 }]}>{utf8Length(entry)} / {MAX_JOURNAL_BYTES} bytes. The limit keeps notes small enough for protected device storage.</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 }}>
          <Action variant="outlined" onPress={clear}>Clear note</Action>
          <Action onPress={save} style={{ minWidth: 124 }}>Save for later</Action>
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.greenSoft }]}>
        <Eyebrow>A SMALL PROMPT</Eyebrow>
        <Text style={styles.body}>
          If writing feels like too much, try finishing this sentence:{' '}
          <Text style={{ fontWeight: '700', color: colors.ink }}>“{currentPrompt}”</Text>
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <Action variant="outlined" onPress={insertPrompt} style={{ minHeight: 38, paddingHorizontal: 13 }}>
            Use this prompt →
          </Action>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPromptIndex((current) => (current + 1) % JOURNAL_PROMPTS.length)}
            style={{ paddingVertical: 6, paddingHorizontal: 4 }}
          >
            <Text style={{ color: colors.greenDark, fontSize: 13, fontWeight: '700' }}>Another prompt ↻</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
