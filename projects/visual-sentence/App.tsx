import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { lockViewport } from './src/lib/lockViewport';
import { JournalScreen } from './src/screens/JournalScreen';

export default function App() {
  useEffect(() => {
    lockViewport();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <JournalScreen />
    </SafeAreaProvider>
  );
}
