import { Pressable, Text, View } from 'react-native';
import { Button } from '~/components/Button';
import { StyledText } from '~/components/StyledText';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function Onboarding() {
  const router = useRouter();

  const handleOnboardingComplete = () => {
    router.push('/(protected)/(onboarding)/personal-details');
  };

  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View className="flex-1 justify-center bg-white">
      <View className="m-6 justify-between gap-8 pb-12">
        <StyledText className="mt-5 text-center font-playfair text-4xl tracking-tighter">
          Welcome to Chrona.
        </StyledText>
        <StyledText className="text-center font-inter tracking-tighter text-zinc-600">
          Let&apos;s get your profile set up so you can start connecting with new pen pals.
        </StyledText>
        <Button
          onPress={handleOnboardingComplete}
          textClassName="text-white text-xl font-playfair-bold"
          className="items-center justify-center py-3">
          Get Started
        </Button>
        <Pressable onPress={handleLogout} className="items-center justify-center">
          <Text className="text-red-600">Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}
