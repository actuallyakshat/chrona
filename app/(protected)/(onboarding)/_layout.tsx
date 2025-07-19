import { Stack } from 'expo-router';
import { OnboardingProvider } from '~/providers/onboarding-provider';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="personal-details" />
      </Stack>
    </OnboardingProvider>
  );
}
