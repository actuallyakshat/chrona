import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useHeader } from '~/providers/header-provider';

export default function ConnectionDetailsPage() {
  const { id, name, imageUrl } = useLocalSearchParams();
  const { setHeaderState } = useHeader();

  const user = useQuery(api.user.get, { id: id as Id<'user'> });

  useEffect(() => {
    if (name && imageUrl) {
      setHeaderState({ title: name as string, imageUrl: imageUrl as string });
    } else if (user) {
      setHeaderState({ title: user.name, imageUrl: user.imageUrl });
    }
  }, [id, name, imageUrl, user, setHeaderState]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Connection Details for {name}</Text>
    </View>
  );
}
