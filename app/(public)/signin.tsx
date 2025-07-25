import { useAuth, useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, View } from 'react-native';
import { StyledText } from '~/components/StyledText';

export default function Signin() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { isSignedIn, isLoaded } = useAuth();

  const handleSSO = async (strategy: 'oauth_apple' | 'oauth_google' | 'oauth_facebook') => {
    try {
      setIsLoading(strategy);
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
        router.replace('/(protected)/(tabs)');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  if (!isLoaded) {
    return null;
  }

  if (isLoaded && isSignedIn) {
    return <Redirect href="/(protected)/(tabs)" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-between px-6 py-12">
        {/* Header */}
        <View className="items-center pt-16">
          <StyledText className="font-playfair text-5xl tracking-tighter text-black">
            Welcome Back
          </StyledText>
          <StyledText className="mt-4 text-center font-inter text-lg tracking-tighter text-zinc-600">
            Continue your journey of meaningful connections
          </StyledText>
        </View>

        {/* Social Login Buttons */}
        <View className="gap-4">
          <Pressable
            onPress={() => handleSSO('oauth_apple')}
            disabled={isLoading !== null}
            className="flex-row items-center justify-center rounded-2xl border border-zinc-200 bg-black px-6 py-4 active:bg-zinc-800">
            <Ionicons name="logo-apple" size={24} color="white" />
            <StyledText className="ml-3 font-inter text-lg font-medium text-white">
              {isLoading === 'oauth_apple' ? 'Signing in...' : 'Continue with Apple'}
            </StyledText>
          </Pressable>

          <Pressable
            onPress={() => handleSSO('oauth_google')}
            disabled={isLoading !== null}
            className="flex-row items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-4 active:bg-zinc-50">
            <Ionicons name="logo-google" size={24} color="#4285F4" />
            <StyledText className="ml-3 font-inter text-lg font-medium text-black">
              {isLoading === 'oauth_google' ? 'Signing in...' : 'Continue with Google'}
            </StyledText>
          </Pressable>

          <Pressable
            onPress={() => handleSSO('oauth_facebook')}
            disabled={isLoading !== null}
            className="flex-row items-center justify-center rounded-2xl border border-zinc-200 bg-[#1877F2] px-6 py-4 active:bg-[#166FE5]">
            <Ionicons name="logo-facebook" size={24} color="white" />
            <StyledText className="ml-3 font-inter text-lg font-medium text-white">
              {isLoading === 'oauth_facebook' ? 'Signing in...' : 'Continue with Facebook'}
            </StyledText>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="items-center gap-6">
          <View className="flex-row items-center gap-2">
            <StyledText className="font-inter text-zinc-600">
              Don&apos;t have an account?
            </StyledText>
            <Link href="/(public)/register" asChild>
              <Pressable>
                <StyledText className="font-inter font-semibold text-black">Sign up</StyledText>
              </Pressable>
            </Link>
          </View>

          <StyledText className="text-center font-inter text-sm text-zinc-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </StyledText>
        </View>
      </View>
    </SafeAreaView>
  );
}
