import { ScrollView, Text, View } from 'react-native';

export default function Profile() {
  return (
    <View className="bg-background flex-1">
      {/* Your page content */}
      <ScrollView className="flex-1 px-5">
        <Text className="mt-5 text-base">Your profile content goes here...</Text>
      </ScrollView>
    </View>
  );
}
