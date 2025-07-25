import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, ScrollView } from 'react-native';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';

export default function UserProfilePreview() {
  //query search param
  const { id } = useLocalSearchParams();
  const fetchedUser = useQuery(api.user.get, { id: id as Id<'user'> });

  if (!fetchedUser) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-black">Loading...</Text>
      </View>
    );
  }

  // Format join date for "User since"
  const joinDate = new Date(fetchedUser._creationTime);
  const userSince = joinDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-4 py-8">
      {/* Profile Image */}
      <View className="mb-6 items-center">
        <Image
          source={{ uri: fetchedUser.imageUrl }}
          className="size-48 rounded-full border-2 border-black"
        />
      </View>

      {/* Name & Age */}
      <Text className="mb-1 text-center text-3xl font-bold text-black">
        {fetchedUser.name}, {fetchedUser.age}
      </Text>

      {/* User Since */}
      <Text className="mb-4 text-center text-sm font-medium text-black opacity-60">
        User since {userSince}
      </Text>

      {/* Bio */}
      <Text className="mb-6 text-center text-base text-black opacity-80">{fetchedUser.bio}</Text>

      {/* Location */}
      <View className="mb-3">
        <Text className="mb-2 text-lg font-semibold text-black">Location</Text>
        <View className="flex-row flex-wrap">
          <View className="rounded-full border border-black px-3 py-1">
            <Text className="text-sm font-medium text-black">
              {fetchedUser.city}, {fetchedUser.country}
            </Text>
          </View>
        </View>
      </View>

      {/* Languages */}
      <View className="mb-3">
        <Text className="mb-2 text-lg font-semibold text-black">Languages Spoken</Text>
        <View className="flex-row flex-wrap gap-2">
          {fetchedUser.languagesSpoken?.map((lang) => (
            <View key={lang} className="rounded-full border border-black px-3 py-1">
              <Text className="text-sm font-medium text-black">{lang}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Interests */}
      <View>
        <Text className="mb-2 text-lg font-semibold text-black">Interests</Text>
        <View className="flex-row flex-wrap gap-2">
          {fetchedUser.interests?.map((interest) => (
            <View key={interest} className="rounded-full border border-black px-3 py-1">
              <Text className="text-sm font-medium text-black">{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
