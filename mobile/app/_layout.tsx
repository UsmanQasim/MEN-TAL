import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from '../src/state';
import { colors } from '../src/theme';

const tabIcons: Record<string, string> = {
  index: '⌂',
  pause: '◌',
  plan: '✳',
  journal: '▤',
  support: '♡',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <Tabs
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.greenDark,
            tabBarInactiveTintColor: colors.muted,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 21, lineHeight: 24 }}>{tabIcons[route.name] ?? '·'}</Text>
            ),
            tabBarStyle: {
              height: 64,
              paddingTop: 7,
              backgroundColor: colors.surface,
              borderTopColor: colors.line,
            },
          })}
        >
          <Tabs.Screen name="index" options={{ title: 'Today' }} />
          <Tabs.Screen name="pause" options={{ title: 'Pause' }} />
          <Tabs.Screen name="plan" options={{ title: 'My plan' }} />
          <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
          <Tabs.Screen name="support" options={{ title: 'Support' }} />
        </Tabs>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
