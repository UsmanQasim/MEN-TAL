import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Action, BrandHeader, Eyebrow, Screen, styles } from '../src/ui';
import { journalFitsStorage, MAX_JOURNAL_BYTES, useAppState, utf8Length } from '../src/state';
import { colors } from '../src/theme';

export default function JournalScreen() {
  const { data, ready, saveJournal } = useAppState();
  const [entry, setEntry] = useState(data.journal);
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

  if (!ready) return null;

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
          placeholderTextColor="#A9ADA3"
          accessibilityLabel="Journal entry"
          style={{ minHeight: 220, marginTop: 14, padding: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.paper, color: colors.ink, fontSize: 14, lineHeight: 22 }}
        />
        <Text style={[styles.muted, { marginTop: 11 }]}>{status}</Text>
        <Text style={[styles.muted, { marginTop: 5, fontSize: 10 }]}>Your note is stored in Android Keystore or iOS Keychain, not uploaded. On web it stays in this browser’s local storage. This is not a substitute for professional care.</Text>
        <Text style={[styles.muted, { marginTop: 5, fontSize: 10 }]}>{utf8Length(entry)} / {MAX_JOURNAL_BYTES} bytes. The limit keeps notes small enough for protected device storage.</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
          <Pressable accessibilityRole="button" onPress={clear} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}>
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600' }}>Clear note</Text>
          </Pressable>
          <Action onPress={save} style={{ minWidth: 118 }}>Save for later</Action>
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.greenSoft }]}>
        <Eyebrow>A SMALL PROMPT</Eyebrow>
        <Text style={styles.body}>If writing feels like too much, try finishing this sentence in your head: “Right now, I need…”</Text>
      </View>
    </Screen>
  );
}
