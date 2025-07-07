import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, View } from 'react-native';
import { StyledText } from '~/components/StyledText';

export default function Signup() {
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSSO = async (strategy: 'oauth_apple' | 'oauth_google' | 'oauth_facebook') => {
    try {
      setIsLoading(strategy);
      await startSSOFlow({ strategy });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-between px-6 py-12">
        {/* Header */}
        <View className="items-center pt-16">
          <StyledText className="font-playfair text-5xl tracking-tighter text-black">
            Join Chrona
          </StyledText>
          <StyledText className="font-inter mt-4 text-center text-lg tracking-tighter text-zinc-600">
            Start building connections that matter, one message at a time
          </StyledText>
        </View>

        {/* Social Login Buttons */}
        <View className="gap-4">
          <Pressable
            onPress={() => handleSSO('oauth_apple')}
            disabled={isLoading !== null}
            className="flex-row items-center justify-center rounded-2xl border border-zinc-200 bg-black px-6 py-4 active:bg-zinc-800">
            <Ionicons name="logo-apple" size={24} color="white" />
            <StyledText className="font-inter ml-3 text-lg font-medium text-white">
              {isLoading === 'oauth_apple' ? 'Creating account...' : 'Sign up with Apple'}
            </StyledText>
          </Pressable>

          <Pressable
            onPress={() => handleSSO('oauth_google')}
            disabled={isLoading !== null}
            className="flex-row items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-4 active:bg-zinc-50">
            <Ionicons name="logo-google" size={24} color="#4285F4" />
            <StyledText className="font-inter ml-3 text-lg font-medium text-black">
              {isLoading === 'oauth_google' ? 'Creating account...' : 'Sign up with Google'}
            </StyledText>
          </Pressable>

          <Pressable
            onPress={() => handleSSO('oauth_facebook')}
            disabled={isLoading !== null}
            className="flex-row items-center justify-center rounded-2xl border border-zinc-200 bg-[#1877F2] px-6 py-4 active:bg-[#166FE5]">
            <Ionicons name="logo-facebook" size={24} color="white" />
            <StyledText className="font-inter ml-3 text-lg font-medium text-white">
              {isLoading === 'oauth_facebook' ? 'Creating account...' : 'Sign up with Facebook'}
            </StyledText>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="items-center gap-6">
          <View className="flex-row items-center gap-2">
            <StyledText className="font-inter text-zinc-600">Already have an account?</StyledText>
            <Link href="/(public)/signin" asChild>
              <Pressable>
                <StyledText className="font-inter font-semibold text-black">Sign in</StyledText>
              </Pressable>
            </Link>
          </View>

          <StyledText className="font-inter text-center text-sm text-zinc-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </StyledText>
        </View>
      </View>
    </SafeAreaView>
  );
}
