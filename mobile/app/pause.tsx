import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Action, BrandHeader, Eyebrow, Screen, styles } from '../src/ui';
import { colors } from '../src/theme';

type PatternKey = 'gentle' | 'steady';
type Phase = { label: string; seconds: number; scaleTo: number };

const PATTERNS: Record<PatternKey, { title: string; subtitle: string; phases: Phase[] }> = {
  gentle: {
    title: 'Gentle (4–6)',
    subtitle: '4s in · 6s out',
    phases: [
      { label: 'Breathe in', seconds: 4, scaleTo: 1.16 },
      { label: 'Breathe out', seconds: 6, scaleTo: 0.9 },
    ],
  },
  steady: {
    title: 'Steady (4–4–4)',
    subtitle: '4s in · 4s hold · 4s out',
    phases: [
      { label: 'Breathe in', seconds: 4, scaleTo: 1.16 },
      { label: 'Hold gently', seconds: 4, scaleTo: 1.16 },
      { label: 'Breathe out', seconds: 4, scaleTo: 0.9 },
    ],
  },
};

const GROUNDING_STEPS = [
  {
    step: 'STEP 1 OF 3 · SEE',
    title: 'Notice one thing you can see',
    body: 'Look around and pick one ordinary detail—the color of a wall, light on the floor, or an object near you. No need to analyze it.',
  },
  {
    step: 'STEP 2 OF 3 · FEEL',
    title: 'Notice one thing you can feel',
    body: 'Bring your attention to your feet on the ground, your back against the chair, or the fabric of your sleeves under your fingers.',
  },
  {
    step: 'STEP 3 OF 3 · HEAR',
    title: 'Listen for one sound nearby',
    body: 'Notice a sound in the room or outside—a fan, distant traffic, wind, or quiet. Let it be there without needing to change anything.',
  },
];

export default function PauseScreen() {
  const [pattern, setPattern] = useState<PatternKey>('gentle');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [seconds, setSeconds] = useState(PATTERNS.gentle.phases[0].seconds);
  const [finished, setFinished] = useState(false);
  const [groundingStep, setGroundingStep] = useState<number | null>(null);

  const scale = useRef(new Animated.Value(1)).current;
  const phaseRef = useRef(0);
  const activePhases = PATTERNS[pattern].phases;

  useEffect(() => {
    if (!running) return undefined;
    const phases = PATTERNS[pattern].phases;
    const timer = setInterval(() => {
      setElapsed((value) => {
        if (value + 1 >= 60) {
          setRunning(false);
          setFinished(true);
          return 60;
        }
        return value + 1;
      });
      setSeconds((value) => {
        if (value <= 1) {
          const nextPhase = (phaseRef.current + 1) % phases.length;
          phaseRef.current = nextPhase;
          setPhaseIndex(nextPhase);
          return phases[nextPhase].seconds;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, pattern]);

  useEffect(() => {
    if (!running) {
      scale.stopAnimation();
      scale.setValue(1);
      return undefined;
    }
    const currentPhase = activePhases[phaseIndex] ?? activePhases[0];
    Animated.timing(scale, {
      toValue: currentPhase.scaleTo,
      duration: currentPhase.seconds * 1000,
      useNativeDriver: true,
    }).start();
  }, [phaseIndex, running, activePhases, scale]);

  function selectPattern(next: PatternKey) {
    setRunning(false);
    setElapsed(0);
    phaseRef.current = 0;
    setPhaseIndex(0);
    setSeconds(PATTERNS[next].phases[0].seconds);
    setFinished(false);
    setPattern(next);
  }

  function toggle() {
    if (running) {
      setRunning(false);
      setElapsed(0);
      phaseRef.current = 0;
      setPhaseIndex(0);
      setSeconds(activePhases[0].seconds);
      setFinished(false);
      return;
    }
    setElapsed(0);
    phaseRef.current = 0;
    setPhaseIndex(0);
    setSeconds(activePhases[0].seconds);
    setFinished(false);
    setRunning(true);
  }

  const currentPhase = activePhases[phaseIndex] ?? activePhases[0];

  return (
    <Screen>
      <BrandHeader />
      <Eyebrow>YOU CAN PAUSE HERE</Eyebrow>
      <Text style={styles.title}>Come back to{'\n'}this moment.</Text>
      <Text style={styles.lead}>There’s nothing to get right. Let’s take one slow, comfortable breath together.</Text>

      <View style={[styles.card, { alignItems: 'center', paddingVertical: 26 }]}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
          {(['gentle', 'steady'] as PatternKey[]).map((key) => {
            const active = pattern === key;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => selectPattern(key)}
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: active ? colors.green : colors.line,
                  backgroundColor: active ? colors.greenSoft : colors.paper,
                }}
              >
                <Text style={{ color: active ? colors.greenDark : colors.body, fontSize: 12, fontWeight: active ? '700' : '500' }}>
                  {PATTERNS[key].title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 210, width: 210, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Animated.View style={{ position: 'absolute', width: 166, height: 166, borderRadius: 100, backgroundColor: colors.greenSoft, borderWidth: 1, borderColor: '#C8D5C2', transform: [{ scale }] }} />
          <View style={{ alignItems: 'center' }}>
            <Text accessibilityLiveRegion="polite" style={{ color: colors.greenDark, fontSize: 22, fontWeight: '600' }}>
              {finished ? 'Well done.' : running ? currentPhase.label : 'Ready?'}
            </Text>
            <Text style={[styles.muted, { marginTop: 7 }]}>
              {running ? `${seconds} seconds` : finished ? 'One gentle minute for you' : PATTERNS[pattern].subtitle}
            </Text>
          </View>
        </View>
        <Text style={[styles.muted, { marginBottom: 18, textAlign: 'center' }]}>
          {running
            ? `No need to force your breath. (${Math.max(0, 60 - elapsed)}s left — stop anytime)`
            : 'Find a comfortable position. If breathing exercises don’t feel right, try grounding below.'}
        </Text>
        <Action onPress={toggle} style={{ alignSelf: 'stretch' }}>
          {running ? 'Stop for now' : finished ? 'Take another minute' : 'Begin a gentle minute'}
        </Action>
      </View>

      <View style={[styles.card, { backgroundColor: colors.sand }]}>
        <Eyebrow>OR JUST NOTICE WHAT’S HERE</Eyebrow>
        <Text style={styles.sectionTitle}>A small grounding check-in</Text>
        {groundingStep === null ? (
          <>
            <Text style={styles.body}>
              Notice one thing you can see, one thing you can feel under your hands or feet, and one sound nearby. You don’t need to change anything.
            </Text>
            <Action
              variant="outlined"
              onPress={() => setGroundingStep(0)}
              style={{ alignSelf: 'flex-start', marginTop: 13 }}
            >
              Walk through 3 steps →
            </Action>
          </>
        ) : groundingStep < GROUNDING_STEPS.length ? (
          <View style={{ marginTop: 6, padding: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
            <Text style={styles.tag}>{GROUNDING_STEPS[groundingStep].step}</Text>
            <Text style={[styles.sectionTitle, { fontSize: 16 }]}>{GROUNDING_STEPS[groundingStep].title}</Text>
            <Text style={styles.body}>{GROUNDING_STEPS[groundingStep].body}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <Action
                onPress={() => setGroundingStep((step) => (step ?? 0) + 1)}
                style={{ minHeight: 40, paddingHorizontal: 16 }}
              >
                {groundingStep === GROUNDING_STEPS.length - 1 ? 'Finish check-in ✓' : 'Next step →'}
              </Action>
              <Pressable accessibilityRole="button" onPress={() => setGroundingStep(null)} style={{ padding: 8 }}>
                <Text style={[styles.muted, { fontWeight: '600' }]}>Close</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 6, padding: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
            <Text style={styles.tag}>GROUNDED IN THIS MOMENT</Text>
            <Text style={[styles.sectionTitle, { fontSize: 16 }]}>Take your time from here.</Text>
            <Text style={styles.body}>You paused and noticed where you are. That’s enough for right now.</Text>
            <Action
              variant="outlined"
              onPress={() => setGroundingStep(null)}
              style={{ alignSelf: 'flex-start', marginTop: 12, minHeight: 38 }}
            >
              Done
            </Action>
          </View>
        )}
      </View>
      <Text style={styles.muted}>If focusing on your breath feels uncomfortable, stop and use any other way of grounding that feels safe for you.</Text>
    </Screen>
  );
}
