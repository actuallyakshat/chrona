// app/(tabs)/index.tsx
import { ScrollView, Text, View } from 'react-native';

export default function HomePage() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 gap-3 px-4 py-3">
        <Text className="mb-5 mt-2 font-playfair text-zinc-900">Home Page</Text>
      </ScrollView>
    </View>
  );
}
