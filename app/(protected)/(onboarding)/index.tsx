import { View } from 'react-native';
import { Button } from '~/components/Button';
import { StyledText } from '~/components/StyledText';
import { useRouter } from 'expo-router';

export default function Onboarding() {
  const router = useRouter();

  const handleOnboardingComplete = () => {
    router.push('/(protected)/(onboarding)/personal-details');
  };

  return (
    <View className="flex-1 justify-center bg-white">
      <View className="m-6 justify-between gap-8 pb-12">
        <StyledText className="mt-5 text-center font-playfair text-4xl tracking-tighter">
          Welcome to Chrona.
        </StyledText>
        <StyledText className="font-inter text-center tracking-tighter text-zinc-600">
          Let&apos;s get your profile set up so you can start connecting with new pen pals.
        </StyledText>
        <Button
          onPress={handleOnboardingComplete}
          textClassName="text-white text-xl font-playfair-bold"
          className="items-center justify-center py-3">
          Get Started
        </Button>
      </View>
    </View>
  );
}
