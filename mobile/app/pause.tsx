import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { Action, BrandHeader, Eyebrow, Screen, styles } from '../src/ui';
import { colors } from '../src/theme';

const PHASES = [
  { label: 'Breathe in', seconds: 4 },
  { label: 'Breathe out', seconds: 6 },
];

export default function PauseScreen() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [seconds, setSeconds] = useState(PHASES[0].seconds);
  const [finished, setFinished] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
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
          const nextPhase = (phaseRef.current + 1) % PHASES.length;
          phaseRef.current = nextPhase;
          setPhaseIndex(nextPhase);
          return PHASES[nextPhase].seconds;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) {
      scale.stopAnimation();
      scale.setValue(1);
      return undefined;
    }
    Animated.timing(scale, {
      toValue: phaseIndex === 0 ? 1.15 : 0.9,
      duration: phaseIndex === 0 ? 4000 : 6000,
      useNativeDriver: true,
    }).start();
  }, [phaseIndex, running, scale]);

  function toggle() {
    if (running) {
      setRunning(false);
      setElapsed(0);
      phaseRef.current = 0;
      setPhaseIndex(0);
      setSeconds(PHASES[0].seconds);
      setFinished(false);
      return;
    }
    setElapsed(0);
    phaseRef.current = 0;
    setPhaseIndex(0);
    setSeconds(PHASES[0].seconds);
    setFinished(false);
    setRunning(true);
  }

  return (
    <Screen>
      <BrandHeader />
      <Eyebrow>YOU CAN PAUSE HERE</Eyebrow>
      <Text style={styles.title}>Come back to{'\n'}this moment.</Text>
      <Text style={styles.lead}>There’s nothing to get right. Let’s take one slow, comfortable breath together.</Text>

      <View style={[styles.card, { alignItems: 'center', paddingVertical: 30 }]}>
        <View style={{ height: 210, width: 210, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Animated.View style={{ position: 'absolute', width: 166, height: 166, borderRadius: 100, backgroundColor: colors.greenSoft, borderWidth: 1, borderColor: '#C8D5C2', transform: [{ scale }] }} />
          <View style={{ alignItems: 'center' }}>
            <Text accessibilityLiveRegion="polite" style={{ color: colors.greenDark, fontSize: 22, fontWeight: '600' }}>
              {finished ? 'Well done.' : running ? PHASES[phaseIndex].label : 'Ready?'}
            </Text>
            <Text style={[styles.muted, { marginTop: 7 }]}>
              {running ? `${seconds} seconds` : finished ? 'One gentle minute for you' : 'Breathe at your own pace'}
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
        <Text style={styles.sectionTitle}>A small grounding exercise</Text>
        <Text style={styles.body}>Notice one thing you can see, one thing you can feel under your hands or feet, and one sound nearby. You don’t need to change anything.</Text>
      </View>
      <Text style={styles.muted}>If focusing on your breath feels uncomfortable, stop and use any other way of grounding that feels safe for you.</Text>
    </Screen>
  );
}
