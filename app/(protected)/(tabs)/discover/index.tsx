import { api } from 'convex/_generated/api';
import { useMutation } from 'convex/react';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { Button } from '~/components/Button';
import useUser from '~/hooks/useUser';
import { calculateDeliveryTimeHours, formatDeliveryTime } from '~/utils/deliveryTime';

export default function DiscoverPage() {
  const { user: viewer } = useUser();
  const viewerId = viewer?._id;

  const recommend = useMutation(api.recommendation.recommend);

  const [recommendations, setRecommendations] = useState<any[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewerLoc =
    viewer?.location && viewer.location.latitude && viewer.location.longitude
      ? {
          lat: viewer.location.latitude,
          lon: viewer.location.longitude,
        }
      : null;

  useEffect(() => {
    if (!viewerId) return;
    setLoading(true);
    setError(null);
    recommend({ viewerId })
      .then((result) => {
        setRecommendations(result);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch recommendations');
        setLoading(false);
      });
  }, [viewerId, recommend]);
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 gap-3 px-4 py-3">
        <Text className="mb-5 mt-2 font-playfair text-zinc-900">
          Here are three recommended companions for you to connect with. You can establish a
          connection by sending the initial chronicle.
        </Text>
        <View className="flex flex-wrap items-center gap-4 pb-3">
          {loading && <Text className="text-zinc-500">Loading...</Text>}
          {error && <Text className="text-red-500">{error}</Text>}
          {recommendations?.length === 0 && !loading && (
            <Text className="text-zinc-500">No recommendations found.</Text>
          )}
          {recommendations?.map((user) => {
            let deliveryTime: string | null = null;
            if (viewerLoc && user.location && user.location.latitude && user.location.longitude) {
              const userLoc = {
                lat: user.location.latitude,
                lon: user.location.longitude,
              };
              const hours = calculateDeliveryTimeHours(viewerLoc, userLoc);
              deliveryTime = formatDeliveryTime(hours);
            }
            return (
              <UserRecommendationCard
                key={user._id}
                userId={user.clerkId}
                imageUrl={user.imageUrl}
                name={user.name}
                age={user.age}
                city={user.city}
                country={user.country}
                bio={user.bio}
                languagesSpoken={user.languagesSpoken}
                interests={user.interests}
                deliveryTime={deliveryTime}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

type UserRecommendationCardProps = {
  userId: string;
  imageUrl?: string | null;
  name: string;
  age?: number | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  languagesSpoken?: string[] | null;
  interests?: string[] | null;
  deliveryTime?: string | null;
};

export function UserRecommendationCard({
  userId,
  imageUrl,
  name,
  age,
  city,
  country,
  bio,
  languagesSpoken,
  interests,
  deliveryTime,
}: UserRecommendationCardProps) {
  return (
    <View className="w-full border bg-white px-4 pb-2 pt-4 shadow-sm">
      {/* Header */}
      <View className="flex-row items-start gap-3">
        <Image
          source={{ uri: imageUrl ?? undefined }}
          className="h-16 w-16 rounded-full bg-zinc-200"
        />

        <View className="flex-1">
          <Text className="text-lg font-bold text-zinc-900">
            {name}
            {age && <Text className="font-normal text-zinc-500">, {age}</Text>}
          </Text>

          {city && country && (
            <Text className="text-sm text-zinc-500">
              {city}, {country}
            </Text>
          )}

          {deliveryTime && (
            <Text className="mt-1 text-xs text-blue-600">Delivery Time: {deliveryTime}</Text>
          )}
        </View>
      </View>

      {/* Bio */}
      {bio && (
        <Text className="mt-3 text-sm text-zinc-700" numberOfLines={2}>
          {bio}
        </Text>
      )}

      {/* Languages */}
      {languagesSpoken && languagesSpoken.length > 0 && (
        <View className="mt-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Speaks
          </Text>
          <View className="mt-1 flex-row flex-wrap gap-1">
            {languagesSpoken.map((lang: string) => (
              <View key={lang} className="rounded-full bg-zinc-100 px-2 py-1">
                <Text className="text-xs text-zinc-700">{lang}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Interests */}
      {interests && interests.length > 0 && (
        <View className="mt-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Interests
          </Text>
          <View className="mt-1 flex-row flex-wrap gap-1">
            {interests.slice(0, 3).map((interest: string) => (
              <View key={interest} className="rounded-full bg-neutral-200 px-2.5 py-1">
                <Text className="text-xs font-medium text-neutral-900">{interest}</Text>
              </View>
            ))}
            {interests.length > 3 && (
              <Text className="ml-1 self-center text-xs text-zinc-500">
                +{interests.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}

      <Link
        className="mt-5 w-full items-center justify-center bg-black py-2"
        href={{
          pathname: '/connections/[id]',
          params: {
            id: -1,
            name,
            imageUrl: imageUrl ?? undefined,
            fresh: 'true',
            recipientUserId: userId,
          },
        }}>
        <Text className="text-center text-sm font-bold text-white">Establish Connection</Text>
      </Link>
    </View>
  );
}
