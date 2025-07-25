// File: app/(protected)/_layout.tsx
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import CustomHeader from '~/components/CustomHeader';
import useUser from '~/hooks/useUser';
import { HeaderProvider } from '~/providers/header-provider';

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const isInOnboardedGroup = segments[0] === '(protected)' && segments[1] === '(onboarding)';
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (!user.isOnboarded && !isInOnboardedGroup) {
        router.replace('/(protected)/(onboarding)');
      }
    }
  }, [user, isInOnboardedGroup, router]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  if (!isSignedIn) {
    return <Redirect href="/(public)/signin" />;
  }

  return (
    <HeaderProvider>
      <CustomHeader />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </HeaderProvider>
  );
}
