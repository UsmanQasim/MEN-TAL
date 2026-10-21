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
          setPhaseIndex((index) => (index + 1) % PHASES.length);
          return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, phaseIndex]);

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
      setPhaseIndex(0);
      setSeconds(PHASES[0].seconds);
      setFinished(false);
      return;
    }
    if (finished) {
      setElapsed(0);
      setPhaseIndex(0);
      setSeconds(PHASES[0].seconds);
      setFinished(false);
    }
    setRunning(true);
  }

  return (
    <Screen>
      <BrandHeader />
      <Eyebrow>YOU CAN PAUSE HERE</Eyebrow>
      <Text style={styles.title}>Come back to{'\n'}this moment.</Text>
      <Text style={styles.lead}>There’s nothing to get right. Let’s take one slow, comfortable breath together.</Text>

      <View style={[styles.card, { alignItems: 'center', paddingVertical: 30 }]}>
        <View style={{ height: 210, width: 210, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Animated.View style={{ position: 'absolute', width: 162, height: 162, borderRadius: 100, backgroundColor: colors.greenSoft, borderWidth: 1, borderColor: '#C8D5C2', transform: [{ scale }] }} />
          <View style={{ alignItems: 'center' }}>
            <Text accessibilityLiveRegion="polite" style={{ color: colors.greenDark, fontSize: 21, fontWeight: '600' }}>
              {finished ? 'Well done.' : running ? PHASES[phaseIndex].label : 'Ready?'}
            </Text>
            <Text style={[styles.muted, { marginTop: 7 }]}>{running ? `${seconds} seconds` : finished ? 'One gentle minute for you' : 'Breathe at your own pace'}</Text>
          </View>
        </View>
        <Text style={[styles.muted, { marginBottom: 19, textAlign: 'center' }]}>
          {running ? 'No need to force your breath. You can stop at any time.' : 'Find a comfortable position. If breathing exercises don’t feel right, try grounding below.'}
        </Text>
        <Action onPress={toggle} style={{ alignSelf: 'stretch' }}>{running ? 'Stop for now' : finished ? 'Take another minute' : 'Begin a gentle minute'}</Action>
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
