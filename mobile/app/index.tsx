import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { BrandHeader, Eyebrow, Screen, styles } from '../src/ui';
import { todayKey, useAppState, type DailyTask, type Mood } from '../src/state';
import { colors } from '../src/theme';

const moods: { key: Mood; face: string; label: string; response: string }[] = [
  { key: 'rough', face: '☁', label: 'Pretty rough', response: 'Thanks for being honest. You deserve support, not pressure.' },
  { key: 'low', face: '◡', label: 'A bit low', response: 'It’s okay to feel low. Let’s keep the next step gentle.' },
  { key: 'okay', face: '◠', label: 'Getting by', response: 'Getting by is enough for right now. One thing at a time.' },
  { key: 'good', face: '☀', label: 'Doing okay', response: 'Glad there’s a little light today. You deserve the easier moments too.' },
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
  const { data, ready, checkIn, toggleTask } = useAppState();
  const selectedMood = data.checkIn?.date === todayKey() ? data.checkIn.mood : null;
  const completed = plan.filter((item) => data.daily.tasks[item.key]).length;

  if (!ready) return null;

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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {moods.map((mood) => {
            const active = selectedMood === mood.key;
            return (
              <Pressable
                key={mood.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => checkIn(mood.key)}
                style={{ flexGrow: 1, flexBasis: '45%', alignItems: 'center', paddingVertical: 11, borderWidth: 1, borderColor: active ? colors.green : colors.line, borderRadius: 12, backgroundColor: active ? colors.greenSoft : colors.paper }}
              >
                <Text style={{ color: colors.greenDark, fontSize: 21 }}>{mood.face}</Text>
                <Text style={[styles.muted, { marginTop: 3, color: active ? colors.greenDark : colors.body }]}>{mood.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {selectedMood && <Text accessibilityLiveRegion="polite" style={[styles.body, { marginTop: 12 }]}>{moods.find((mood) => mood.key === selectedMood)?.response}</Text>}
      </View>

      <Eyebrow>THE BASICS COUNT</Eyebrow>
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Care for the person in the mirror</Text>
      {[
        ['BODY & ENERGY', 'Have a glass of water', 'Or step outside for a minute. Your body deserves care, even on hard days.'],
        ['FOOD & FUEL', 'Eat something simple', 'Toast, fruit, leftovers. It doesn’t need to be perfect to help.'],
        ['YOUR SPACE', 'Make one thing easier', 'Wash your face, change your shirt, or clear one corner.'],
      ].map(([tag, title, note]) => (
        <View key={title} style={styles.card}>
          <Text style={styles.tag}>{tag}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.body}>{note}</Text>
        </View>
      ))}

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
              <View style={{ flex: 1, paddingVertical: 9 }}>
                <Text style={[styles.taskTitle, done && { color: colors.muted, textDecorationLine: 'line-through' }]}>{task.title}</Text>
                <Text style={[styles.muted, { marginTop: 3, fontSize: 10 }]}>{task.note}</Text>
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
          <Text style={{ color: colors.greenDark, fontSize: 12, fontWeight: '700' }}>Talk to a real person →</Text>
        </Pressable>
      </Link>
      <Text style={[styles.muted, { marginTop: 18, fontSize: 10 }]}>MEN-TAL offers general wellbeing ideas, not diagnosis or treatment. You deserve qualified help when you need it.</Text>
    </Screen>
  );
}
