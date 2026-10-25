import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Action, BrandHeader, Eyebrow, LoadingScreen, Screen, styles } from '../src/ui';
import { todayKey, useAppState, type BasicTask, type DailyTask, type Mood } from '../src/state';
import { colors } from '../src/theme';

const moods: { key: Mood; face: string; label: string; response: string }[] = [
  { key: 'rough', face: '☁', label: 'Pretty rough', response: 'Thanks for being honest. You deserve support, not pressure.' },
  { key: 'low', face: '◡', label: 'A bit low', response: 'It’s okay to feel low. Let’s keep the next step gentle.' },
  { key: 'okay', face: '◠', label: 'Getting by', response: 'Getting by is enough for right now. One thing at a time.' },
  { key: 'good', face: '☀', label: 'Doing okay', response: 'Glad there’s a little light today. You deserve the easier moments too.' },
];

type PathwayKey = 'sleep' | 'money' | 'lonely' | 'energy' | 'overwhelm';

const pathways: { key: PathwayKey; label: string; tag: string; title: string; ideas: string[] }[] = [
  {
    key: 'sleep',
    label: 'Exhausted or can’t sleep',
    tag: 'REST & WIND-DOWN',
    title: 'Take the pressure off sleeping',
    ideas: [
      'Stop trying to force sleep. Resting your body in the dark with your eyes closed still counts.',
      'Put your phone face-down across the room for 15 minutes and let your shoulders drop.',
      'Write down the one thing you’re worried about forgetting tomorrow in your journal so your brain doesn’t have to hold it.',
    ],
  },
  {
    key: 'money',
    label: 'Work or money stress',
    tag: 'WORK & MONEY STRAIN',
    title: 'Shrink the window to just today',
    ideas: [
      'You don’t have to solve the whole month tonight. Pick one small admin task—or decide that money tasks wait until tomorrow morning.',
      'Eat something simple and drink water before looking at bills or messages. Everything feels heavier on an empty stomach.',
      'If debt or housing is pressing, free confidential advice lines exist in many countries—you don’t have to figure it out in isolation.',
    ],
  },
  {
    key: 'lonely',
    label: 'Feeling isolated',
    tag: 'CONNECTION WITHOUT PRESSURE',
    title: 'Low-effort ways to feel less alone',
    ideas: [
      'Send a low-stakes text to one person: “Thinking of you, hope your week is going okay.” No need to explain how you feel unless you want to.',
      'Step into a shared space for 10 minutes—a local shop, park, or café—just to be around everyday life.',
      'Check your rough-day plan for the name of someone you trust, and let them know you could use a quick check-in.',
    ],
  },
  {
    key: 'energy',
    label: 'Hard to get moving',
    tag: 'LOW ENERGY',
    title: 'Make the first step tiny',
    ideas: [
      'Sit on the edge of the bed or couch and put both feet flat on the floor for 30 seconds. That’s the whole first step.',
      'Splash cool water on your face or put on a clean shirt—no need for a full routine.',
      'Open a curtain or crack a window for two minutes of fresh air and daylight.',
    ],
  },
  {
    key: 'overwhelm',
    label: 'Head feels too loud',
    tag: 'WHEN EVERYTHING FEELS LIKE A LOT',
    title: 'Slow down the noise',
    ideas: [
      'Try four slow breaths in the Pause tab—longer on the exhale than the inhale.',
      'Dump the loudest thought into the Journal tab so it’s outside your head.',
      'Look around the room and name three solid objects you can see right now.',
    ],
  },
];

const basicsList: { key: BasicTask; tag: string; title: string; note: string }[] = [
  { key: 'water', tag: 'BODY & ENERGY', title: 'Have a glass of water', note: 'Or step outside for a minute. Your body deserves care, even on hard days.' },
  { key: 'food', tag: 'FOOD & FUEL', title: 'Eat something simple', note: 'Toast, fruit, leftovers. It doesn’t need to be perfect to help.' },
  { key: 'space', tag: 'YOUR SPACE', title: 'Make one thing easier', note: 'Wash your face, change your shirt, or clear one corner.' },
];

const plan: { key: DailyTask; title: string; note: string }[] = [
  { key: 'connect', title: 'Let someone know how you’re doing', note: 'A text counts. No big explanation needed.' },
  { key: 'move', title: 'Move in a way that feels manageable', note: 'A stretch or a slow walk is enough.' },
  { key: 'rest', title: 'Give yourself a proper pause', note: 'Rest is part of looking after yourself.' },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 18) return 'Good afternoon.';
  return 'Good evening.';
}

export default function TodayScreen() {
  const { data, steadyPlan, ready, checkIn, toggleTask, toggleBasic } = useAppState();
  const [activePathway, setActivePathway] = useState<PathwayKey | null>(null);
  const [ideaIndex, setIdeaIndex] = useState(0);

  const selectedMood = data.checkIn?.date === todayKey() ? data.checkIn.mood : null;
  const completed = plan.filter((item) => data.daily.tasks[item.key]).length;
  const basicsState = data.daily.basics ?? { water: false, food: false, space: false };
  const hasSavedPlan = Boolean(
    steadyPlan.helpful.trim() || steadyPlan.person.trim() || steadyPlan.message.trim() || steadyPlan.signs.trim(),
  );
  const currentPathway = pathways.find((item) => item.key === activePathway) ?? null;

  if (!ready) return <LoadingScreen />;

  return (
    <Screen>
      <BrandHeader />
      <Eyebrow>A SPACE JUST FOR YOU</Eyebrow>
      <Text style={styles.title}>{greeting()}{'\n'}Take today as it comes.</Text>
      <Text style={[styles.lead, { marginBottom: 18 }]}>Some days are heavier than others. You don’t have to solve it all. Let’s find your next small step.</Text>

      <View style={styles.card}>
        <Eyebrow>CHECK IN WITH YOURSELF</Eyebrow>
        <Text style={styles.sectionTitle}>How are you, really?</Text>
        <Text style={[styles.muted, { marginBottom: 14 }]}>No right answer. Just notice where you are.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          {moods.map((mood) => {
            const active = selectedMood === mood.key;
            return (
              <Pressable
                key={mood.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => checkIn(mood.key)}
                style={{
                  flexGrow: 1,
                  flexBasis: '45%',
                  alignItems: 'center',
                  paddingVertical: 13,
                  borderWidth: 1,
                  borderColor: active ? colors.green : colors.line,
                  borderRadius: 12,
                  backgroundColor: active ? colors.greenSoft : colors.paper,
                }}
              >
                <Text style={{ color: colors.greenDark, fontSize: 22 }}>{mood.face}</Text>
                <Text style={[styles.muted, { marginTop: 4, color: active ? colors.greenDark : colors.body, fontWeight: active ? '700' : '500' }]}>{mood.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {selectedMood && (
          <Text accessibilityLiveRegion="polite" style={[styles.body, { marginTop: 14, color: colors.greenDark, fontWeight: '500' }]}>
            {moods.find((mood) => mood.key === selectedMood)?.response}
          </Text>
        )}
        {(selectedMood === 'rough' || selectedMood === 'low') && (
          <View style={{ marginTop: 12, padding: 14, borderRadius: 12, backgroundColor: colors.greenSoft }}>
            <Text style={[styles.tag, { backgroundColor: colors.surface, marginBottom: 6 }]}>
              {hasSavedPlan ? 'FROM YOUR ROUGH-DAY PLAN' : 'FOR A HEAVY MOMENT'}
            </Text>
            {hasSavedPlan ? (
              <>
                {steadyPlan.helpful ? (
                  <Text style={[styles.body, { color: colors.ink, fontWeight: '600', marginBottom: 4 }]}>
                    Next small step: {steadyPlan.helpful}
                  </Text>
                ) : null}
                {steadyPlan.person ? (
                  <Text style={styles.muted}>Person you noted: {steadyPlan.person}</Text>
                ) : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
                  <Link href="/plan" asChild>
                    <Pressable accessibilityRole="button">
                      <Text style={{ color: colors.greenDark, fontSize: 13, fontWeight: '700' }}>Open my rough-day plan →</Text>
                    </Pressable>
                  </Link>
                  <Link href="/pause" asChild>
                    <Pressable accessibilityRole="button">
                      <Text style={{ color: colors.greenDark, fontSize: 13, fontWeight: '600' }}>Take a 1-minute breather →</Text>
                    </Pressable>
                  </Link>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.body}>Keep the next hour small. You can take a slow breath or look at your rough-day plan whenever you’re ready.</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
                  <Link href="/pause" asChild>
                    <Pressable accessibilityRole="button">
                      <Text style={{ color: colors.greenDark, fontSize: 13, fontWeight: '700' }}>Take a 1-minute breather →</Text>
                    </Pressable>
                  </Link>
                  <Link href="/plan" asChild>
                    <Pressable accessibilityRole="button">
                      <Text style={{ color: colors.greenDark, fontSize: 13, fontWeight: '600' }}>Open rough-day plan →</Text>
                    </Pressable>
                  </Link>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Eyebrow>WHAT’S WEIGHING ON YOU?</Eyebrow>
        <Text style={styles.sectionTitle}>Pick what feels closest right now</Text>
        <Text style={[styles.muted, { marginBottom: 12 }]}>Optional, low-pressure ideas for everyday strain. Swap or close anytime.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {pathways.map((item) => {
            const selected = activePathway === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  if (selected) {
                    setActivePathway(null);
                  } else {
                    setActivePathway(item.key);
                    setIdeaIndex(0);
                  }
                }}
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 9,
                  borderWidth: 1,
                  borderColor: selected ? colors.green : colors.line,
                  borderRadius: 20,
                  backgroundColor: selected ? colors.greenSoft : colors.paper,
                }}
              >
                <Text style={{ color: selected ? colors.greenDark : colors.ink, fontSize: 13, fontWeight: selected ? '700' : '500' }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {currentPathway && (
          <View style={{ marginTop: 14, padding: 15, borderRadius: 12, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }}>
            <Text style={styles.tag}>{currentPathway.tag}</Text>
            <Text style={[styles.sectionTitle, { fontSize: 16 }]}>{currentPathway.title}</Text>
            <Text style={[styles.body, { marginTop: 4 }]}>
              {currentPathway.ideas[ideaIndex % currentPathway.ideas.length]}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 }}>
              <Action
                variant="outlined"
                onPress={() => setIdeaIndex((current) => (current + 1) % currentPathway.ideas.length)}
                style={{ minHeight: 38, paddingHorizontal: 13 }}
              >
                Show another idea ↻
              </Action>
              <Pressable accessibilityRole="button" onPress={() => setActivePathway(null)} style={{ padding: 8 }}>
                <Text style={[styles.muted, { fontWeight: '600' }]}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <Eyebrow>THE BASICS COUNT</Eyebrow>
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Care for the person in the mirror</Text>
      {basicsList.map((item) => {
        const done = Boolean(basicsState[item.key]);
        return (
          <View key={item.key} style={styles.card}>
            <Text style={styles.tag}>{item.tag}</Text>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.note}</Text>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              onPress={() => toggleBasic(item.key)}
              style={{ alignSelf: 'flex-start', marginTop: 10, paddingVertical: 4 }}
            >
              <Text style={{ color: done ? colors.muted : colors.greenDark, fontSize: 13, fontWeight: '700' }}>
                {done ? 'Done for now ✓' : 'I did this →'}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.card}>
        <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 5 }]}>
          <Text style={styles.sectionTitle}>A few things for today</Text>
          <Text style={[styles.tag, { marginBottom: 0 }]}>{completed} OF {plan.length}</Text>
        </View>
        <Text style={[styles.muted, { marginBottom: 12 }]}>A menu, not a test. Pick one or leave them all.</Text>
        {plan.map((task) => {
          const done = data.daily.tasks[task.key];
          return (
            <Pressable key={task.key} accessibilityRole="checkbox" accessibilityState={{ checked: done }} onPress={() => toggleTask(task.key)} style={styles.taskRow}>
              <View style={[styles.taskCheck, done && styles.taskCheckDone]}>
                {done && <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>✓</Text>}
              </View>
              <View style={{ flex: 1, paddingVertical: 10 }}>
                <Text style={[styles.taskTitle, done && { color: colors.muted, textDecorationLine: 'line-through' }]}>{task.title}</Text>
                <Text style={[styles.muted, { marginTop: 3, fontSize: 12 }]}>{task.note}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Link href="/pause" asChild>
        <Pressable style={{ marginBottom: 12, padding: 19, borderRadius: 16, backgroundColor: colors.greenSoft }}>
          <Text style={styles.tag}>A MINUTE JUST FOR YOU</Text>
          <Text style={styles.sectionTitle}>Need a breather?</Text>
          <Text style={styles.body}>Try a gentle breathing or grounding exercise. You can stop whenever you like.</Text>
        </Pressable>
      </Link>
      <Link href="/plan" asChild>
        <Pressable style={{ marginBottom: 12, padding: 19, borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.surface }}>
          <Text style={styles.tag}>A REMINDER FOR A HARD DAY</Text>
          <Text style={styles.sectionTitle}>Make a little rough-day plan</Text>
          <Text style={styles.body}>Write down what helps and who you could reach out to. Keep it for yourself, on this device.</Text>
        </Pressable>
      </Link>
      <Link href="/support" asChild>
        <Pressable accessibilityRole="button" style={{ alignSelf: 'flex-start', paddingVertical: 10 }}>
          <Text style={{ color: colors.greenDark, fontSize: 14, fontWeight: '700' }}>Talk to a real person →</Text>
        </Pressable>
      </Link>
      <Text style={[styles.muted, { marginTop: 16, fontSize: 12 }]}>MEN-TAL offers general wellbeing ideas, not diagnosis or treatment. You deserve qualified help when you need it.</Text>
    </Screen>
  );
}
