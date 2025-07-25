import { Stack } from 'expo-router';

export default function PublicLayout() {
  console.log('public render');

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
