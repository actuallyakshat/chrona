import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { api } from '~/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';

export default function Connections() {
  const router = useRouter();
  const { userId } = useAuth();

  //only call if signed in
  const connections = useQuery(api.connection.getConnections);

  // Loading state
  if (connections === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-lg text-gray-500">Loading connections...</Text>
      </View>
    );
  }

  // No connections state
  if (connections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-500">No connections found.</Text>
        <Pressable
          className="mt-4 flex-row items-center justify-center gap-2 border-2 border-black bg-black px-4 py-3"
          onPress={() => router.push('/discover')}>
          <Text className="font-playfair-medium text-white">Discover</Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </Pressable>
      </View>
    );
  }

  // Helper: get the "other" user in the connection
  function getOtherUser(connection: any) {
    if (!userId) return null;
    // Clerk userId is a string, but your backend returns Convex user objects.
    // You may need to compare by clerkId or by _id, depending on your backend.
    // Here, we assume you have clerkId on the user objects.
    if (connection.firstUser?.clerkId === userId) {
      return connection.secondUser;
    }
    return connection.firstUser;
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5 py-5">
        {connections.map((connection) => {
          const otherUser = getOtherUser(connection);

          return (
            <Link
              href={{
                pathname: '/connections/[id]',
                params: {
                  id: connection._id,
                  name: otherUser?.name ?? 'Unknown',
                  imageUrl: otherUser?.imageUrl ?? '',
                  fresh: 'false',
                  recipientUserId: otherUser?._id ?? '',
                },
              }}
              key={connection._id}
              asChild>
              <Pressable className="mb-4 flex-row items-center gap-4 border border-black bg-white p-4">
                {otherUser?.imageUrl ? (
                  <Image
                    source={{ uri: otherUser.imageUrl }}
                    className="size-20 rounded-full border"
                  />
                ) : (
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 0,
                      borderWidth: 2,
                      borderColor: '#000',
                      marginRight: 16,
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Ionicons name="person" size={28} color="#000" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-lg font-bold text-black">
                    {otherUser?.name ?? 'Unknown User'}
                  </Text>
                  <Text className="text-sm text-gray-600">{otherUser?.bio ?? ''}</Text>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </View>
  );
}
