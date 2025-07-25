import { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { useDebounce } from '~/hooks/useDebounce';
import { api } from '~/convex/_generated/api';

export default function SearchUserByUsername() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const results = useQuery(api.user.getUserByUsername, { search: debounced }) ?? [];
  const router = useRouter();

  const handlePress = (user: (typeof results)[0]) => {
    router.replace({
      pathname: '/connections/[id]',
      params: {
        id: user._id,
        name: user.name,
        imageUrl: user.imageUrl ?? undefined,
        fresh: 'true',
        recipientUserId: user.clerkId,
      },
    });
  };

  return (
    <View className="flex-1 bg-white px-4 pt-12">
      <TextInput
        placeholder="Search username..."
        value={query}
        onChangeText={setQuery}
        className="mb-4 rounded-lg border border-gray-300 px-4 py-3"
        autoCapitalize="none"
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            className="flex-row items-center border-b border-gray-200 py-3">
            <Image source={{ uri: item.imageUrl }} className="mr-3 h-12 w-12 rounded-full" />
            <View>
              <Text className="text-base font-semibold">{item.name}</Text>
              <Text className="text-sm text-gray-500">@{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.trim() ? (
            <Text className="mt-8 text-center text-gray-400">No users found</Text>
          ) : null
        }
      />
    </View>
  );
}
