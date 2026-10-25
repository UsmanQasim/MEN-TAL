import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Share, Text, TextInput, View } from 'react-native';
import { Action, BrandHeader, Eyebrow, LoadingScreen, Screen, styles } from '../src/ui';
import { MAX_STEADY_PLAN_FIELD_LENGTH, steadyPlanFitsStorage, useAppState, type SteadyPlan } from '../src/state';
import { colors } from '../src/theme';

const prompts: { key: keyof SteadyPlan; label: string; placeholder: string }[] = [
  { key: 'signs', label: 'How might I notice things are getting heavy?', placeholder: 'For example: I stop replying, skip meals, or stay up late.' },
  { key: 'helpful', label: 'What small thing can help me through the next few minutes?', placeholder: 'Something simple that has helped before…' },
  { key: 'person', label: 'Who could I reach out to?', placeholder: 'A name, or just “my brother” / “a friend”.' },
  { key: 'message', label: 'What could I say?', placeholder: '“I’m having a rough day. Could you check in with me?”' },
];

const starterMessages = [
  'Hey, having a bit of a heavy day. Do you have a few minutes to catch up?',
  'No need to fix anything, just wanted to let you know today feels rough.',
  'Could you check in on me later today? Just a quick text helps.',
];

export default function SteadyPlanScreen() {
  const { steadyPlan, ready, saveSteadyPlan } = useAppState();
  const [draft, setDraft] = useState(steadyPlan);
  const [status, setStatus] = useState('This is optional. Keep it short and make it your own.');

  useEffect(() => {
    if (ready) setDraft(steadyPlan);
  }, [ready, steadyPlan]);

  async function save() {
    if (await saveSteadyPlan(draft)) {
      setStatus('Your plan is saved on this device only. It is not uploaded.');
      return;
    }
    setStatus(steadyPlanFitsStorage(draft)
      ? 'This device could not save your plan. Check the storage notice above and try again.'
      : 'Please shorten your entries and try saving again.');
  }

  async function clear() {
    if (await saveSteadyPlan({ signs: '', helpful: '', person: '', message: '' })) {
      setDraft({ signs: '', helpful: '', person: '', message: '' });
      setStatus('Your plan has been cleared from this device.');
    } else {
      setStatus('This device could not clear the saved plan. Check the storage notice above and try again.');
    }
  }

  async function shareOrCopyMessage() {
    const text = draft.message.trim();
    if (!text) return;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setStatus('Message copied. Open your messages app to paste and send it.');
        return;
      }
      await Share.share({ message: text });
    } catch (error) {
      console.error('Could not share or copy rough-day message.', error);
      setStatus('Could not open the share sheet right now. You can copy the text above directly.');
    }
  }

  if (!ready) return <LoadingScreen />;

  return (
    <Screen>
      <BrandHeader />
      <Eyebrow>FOR A DAY THAT FEELS HEAVY</Eyebrow>
      <Text style={styles.title}>A little plan{'\n'}for rough days.</Text>
      <Text style={styles.lead}>When things are calmer, jot down a couple of reminders you might want later. Skip anything that doesn’t feel useful.</Text>

      <View style={[styles.card, { backgroundColor: colors.greenSoft }]}>
        <Text style={styles.sectionTitle}>A note from you, to you</Text>
        <Text style={styles.body}>This is a personal reminder, not a professional safety plan. MEN-TAL doesn’t monitor it, detect emergencies, or contact anyone for you.</Text>
      </View>

      <View style={styles.card}>
        {prompts.map((prompt, index) => (
          <View key={prompt.key} style={{ marginBottom: index === prompts.length - 1 ? 0 : 18 }}>
            <Text style={[styles.sectionTitle, { fontSize: 15, lineHeight: 21 }]}>{prompt.label}</Text>
            <TextInput
              value={draft[prompt.key]}
              onChangeText={(value) => {
                setDraft((current) => ({ ...current, [prompt.key]: value }));
                setStatus('Only on this device. Save when you’re ready.');
              }}
              maxLength={MAX_STEADY_PLAN_FIELD_LENGTH}
              multiline
              textAlignVertical="top"
              placeholder={prompt.placeholder}
              placeholderTextColor="#959A90"
              accessibilityLabel={prompt.label}
              style={{ minHeight: 78, marginTop: 8, padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.paper, color: colors.ink, fontSize: 15, lineHeight: 22 }}
            />
            <Text style={[styles.muted, { marginTop: 4, textAlign: 'right', fontSize: 12 }]}>{draft[prompt.key].length}/{MAX_STEADY_PLAN_FIELD_LENGTH}</Text>
            {prompt.key === 'message' && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.muted, { fontSize: 12, marginBottom: 6 }]}>Need words? Tap to fill in a starter:</Text>
                <View style={{ gap: 6 }}>
                  {starterMessages.map((starter) => (
                    <Pressable
                      key={starter}
                      accessibilityRole="button"
                      onPress={() => {
                        setDraft((current) => ({ ...current, message: starter.slice(0, MAX_STEADY_PLAN_FIELD_LENGTH) }));
                        setStatus('Starter added. Edit it however you like and save when ready.');
                      }}
                      style={{ paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }}
                    >
                      <Text style={{ color: colors.body, fontSize: 12, lineHeight: 17 }}>“{starter}”</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
        <Text accessibilityLiveRegion="polite" style={[styles.muted, { marginTop: 10, color: colors.greenDark, fontWeight: '500' }]}>{status}</Text>
        <Text style={[styles.muted, { marginTop: 5, fontSize: 12 }]}>Saved in protected device storage on mobile, or this browser on web. Anyone with access to your unlocked device or browser profile may be able to read it.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10, marginTop: 15 }}>
          {draft.message.trim() ? (
            <Action variant="outlined" onPress={shareOrCopyMessage}>
              {Platform.OS === 'web' ? 'Copy message' : 'Send / share message'}
            </Action>
          ) : null}
          <Action variant="outlined" onPress={clear}>Clear plan</Action>
          <Action onPress={save}>Save my plan</Action>
        </View>
      </View>

      <View style={[styles.card, { borderColor: '#EAD8CB', backgroundColor: colors.dangerSoft }]}>
        <Text style={[styles.tag, { color: colors.danger, backgroundColor: '#F1DFD3' }]}>IF YOU’RE IN IMMEDIATE DANGER</Text>
        <Text style={styles.body}>Call your local emergency number or go to the nearest emergency department now. If you can, tell someone you trust and ask them to stay with you.</Text>
      </View>
    </Screen>
  );
}
