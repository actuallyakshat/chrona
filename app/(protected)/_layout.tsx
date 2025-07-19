import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import useUser from '~/hooks/useUser';

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  const { user: currentUser } = useUser();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || currentUser === undefined) return;

    const inTabsGroup = segments[0] === '(protected)' && segments[1] === '(tabs)';
    const inOnboardingGroup = segments[0] === '(protected)' && segments[1] === '(onboarding)';

    if (!currentUser) return;

    if (isSignedIn && !inOnboardingGroup && !currentUser.isOnboarded) {
      router.replace('/(protected)/(onboarding)');
    } else if (isSignedIn && currentUser?.isOnboarded && !inTabsGroup) {
      router.replace('/(protected)/(tabs)');
    }
  }, [isLoaded, isSignedIn, currentUser, segments, router]);

  if (!isLoaded || currentUser === undefined) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(public)/signin" />;
  }

  return <Slot />;
}
