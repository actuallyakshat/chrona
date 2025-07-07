import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot, SplashScreen, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import '../global.css';

import { ConvexProviderWithClerk } from 'convex/react-clerk';

import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_500Medium_Italic,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_600SemiBold_Italic,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_800ExtraBold_Italic,
  PlayfairDisplay_900Black,
  PlayfairDisplay_900Black_Italic,
  useFonts,
} from '@expo-google-fonts/playfair-display';

import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_400Regular_Italic,
  Inter_500Medium,
  Inter_500Medium_Italic,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import { ConvexReactClient } from 'convex/react';

SplashScreen.preventAutoHideAsync();

function AuthChecker({ children }: { children?: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/(protected)/(tabs)');
    } else if (pathname !== '/' && !isSignedIn) {
      router.replace('/(public)/signin');
    }
  }, [isLoaded, isSignedIn, router, pathname]);

  if (!isLoaded) return null;

  return <Slot />;
}

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string);

export default function RootLayout() {
  const [loadedPlayfair] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_500Medium_Italic,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_600SemiBold_Italic,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_700Bold_Italic,
    PlayfairDisplay_800ExtraBold,
    PlayfairDisplay_800ExtraBold_Italic,
    PlayfairDisplay_900Black,
    PlayfairDisplay_900Black_Italic,
  });

  const [loadedInter] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular_Italic,
    Inter_500Medium_Italic,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (loadedPlayfair && loadedInter) {
      SplashScreen.hideAsync();
    }
  }, [loadedPlayfair, loadedInter]);

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthChecker />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
