import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { dummyConnections } from '~/constants/connections';

export default function Connections() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 py-5">
        {dummyConnections.map((connection) => (
          <Link href={`/connections/${connection.id}`} key={connection.id}>
            <Text key={connection.id}>{connection.id}</Text>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}
