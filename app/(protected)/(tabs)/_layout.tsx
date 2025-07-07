// app/(tabs)/_layout.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import CustomHeader from '~/components/CustomHeader';
import colors from '~/constants/colors';

export default function TabsLayout() {
  return (
    <>
      <CustomHeader />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#bfbfbf',
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialIcons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialIcons name="person" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
