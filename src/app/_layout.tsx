import { PokemonProvider } from '@/context/PokemonContext';
import { JujutsuProvider } from '@/context/JujutsuContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <PokemonProvider>
      <JujutsuProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </JujutsuProvider>
    </PokemonProvider>
  );
}
