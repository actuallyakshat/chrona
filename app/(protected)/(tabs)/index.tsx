// app/(tabs)/index.tsx
import { useAuth } from '@clerk/clerk-expo';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function HomePage() {
  const { signOut } = useAuth();
  return (
    <View className="bg-background flex-1">
      {/* Your page content */}
      <ScrollView className="flex-1 px-5">
        <Text className="mt-5 text-base">Your app content goes here...</Text>
        <Pressable className="mt-5" onPress={() => signOut()}>
          <Text>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
