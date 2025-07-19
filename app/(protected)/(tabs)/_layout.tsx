// app/(tabs)/_layout.tsx
import { MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { Tabs } from 'expo-router';
import CustomHeader from '~/components/CustomHeader';
import colors from '~/constants/colors';
import { HeaderProvider } from '~/providers/header-provider';

export default function TabsLayout() {
  return (
    <HeaderProvider>
      <CustomHeader />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 0.5,
            paddingTop: 8,
            borderTopColor: '#000',
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
              <MaterialIcons name="home" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="connections"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialIcons name="mail" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <Entypo name="globe" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <MaterialIcons name="person" size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    </HeaderProvider>
  );
}
