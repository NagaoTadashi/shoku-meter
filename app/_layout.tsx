import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
      Purchases.configure({
        apiKey: "appl_AKKYHprmMKbJckzXccxPDSagxam"
      });
    } else if (Platform.OS === 'android') {
      Purchases.configure({
        apiKey: ""
      });

      // OR: if building for Amazon, be sure to follow the installation instructions then:
      Purchases.configure({ apiKey: "", useAmazon: true });
    }

  }, []);
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="about"
          options={{
            headerShown: true,
            title: 'このアプリについて',
            headerTintColor: '#1D1D1F',
            headerStyle: { backgroundColor: '#F8F9FA' },
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
