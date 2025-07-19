import { useAuth } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { Link, Redirect } from 'expo-router';
import { View } from 'react-native';
import { Button } from '~/components/Button';
import { StyledText } from '~/components/StyledText';
import landingImage from '../assets/landing.jpg';

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(protected)/(tabs)" />;
  }

  return (
    <View className="flex-1">
      <Image
        source={landingImage}
        style={{ flex: 1 }}
        contentFit="cover"
        contentPosition={'bottom'}
      />
      <View className="m-6 justify-between gap-8 pb-12">
        <StyledText className="mt-5 text-center font-playfair text-4xl tracking-tighter">
          Because Good Things Take Time.
        </StyledText>
        <StyledText className="text-center font-inter tracking-tighter text-zinc-600">
          In a world of instant replies, Chrona brings back the beauty of waiting—fostering
          friendships that unfold with time.
        </StyledText>
        <Link asChild href={'/(public)/signin'}>
          <Button
            textClassName="text-white text-xl font-playfair-bold"
            className="items-center justify-center py-3">
            Get Started
          </Button>
        </Link>
      </View>
    </View>
  );
}
